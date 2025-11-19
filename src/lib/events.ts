// Central event emitter for client portal
// Emits normalized events to Firestore for consumption by automation hub
// Also supports direct HTTP emission to automation hub API

import { db } from './firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { logError } from './log';

/**
 * Automation hub API base URL (optional direct emission)
 */
const AUTOMATION_HUB_URL = process.env.NEXT_PUBLIC_AUTOMATION_HUB_URL;
const AUTOMATION_HUB_API_KEY = process.env.AUTOMATION_HUB_API_KEY;

// Simple UUID v4 generator (crypto.randomUUID() for Node 19+, fallback for older)
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type EventName = 
  | "booking.created" 
  | "booking.status_updated" 
  | "asset.uploaded" 
  | "payment.intent_created" 
  | "payment.completed";

export interface PortalEvent {
  id: string;
  name: EventName;
  source: "client-portal";
  tenantId?: string;
  userId?: string;
  moduleIds?: string[];
  occurredAt: string; // ISO timestamp
  payload: Record<string, unknown>;
}

/**
 * Build a normalized portal event with defaults
 */
export function buildEvent(args: {
  name: EventName;
  tenantId?: string;
  userId?: string;
  moduleIds?: string[];
  payload?: Record<string, unknown>;
}): PortalEvent {
  return {
    id: generateUuid(),
    name: args.name,
    source: "client-portal",
    tenantId: args.tenantId,
    userId: args.userId,
    moduleIds: args.moduleIds,
    occurredAt: new Date().toISOString(),
    payload: args.payload || {},
  };
}

/**
 * Emit event to automation hub via HTTP API (optional, direct)
 */
async function emitEventDirect(event: PortalEvent): Promise<void> {
  if (!AUTOMATION_HUB_URL) {
    return; // Direct emission not configured
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (AUTOMATION_HUB_API_KEY) {
      headers['x-api-key'] = AUTOMATION_HUB_API_KEY;
    }

    const response = await fetch(`${AUTOMATION_HUB_URL}/api/events/intake`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Automation hub API responded with ${response.status}`);
    }

    console.log(`[Events] Direct emit success: ${event.name} (${event.id})`);
  } catch (error) {
    // Log but don't throw - Firestore is primary, direct is fallback
    logError('emitEventDirect', error, {
      eventId: event.id,
      eventName: event.name,
    });
  }
}

/**
 * Emit event to Firestore portalEvents collection
 * Optionally also emits directly to automation hub API
 * Errors are logged but not thrown to keep user flow uninterrupted
 */
export async function emitEvent(event: PortalEvent): Promise<void> {
  // Primary: Firestore
  try {
    const eventRef = doc(collection(db, 'portalEvents'), event.id);
    await setDoc(eventRef, {
      ...event,
      status: 'pending', // Required by automation hub worker
      // Store occurredAt as both ISO string and Firestore timestamp for querying
      occurredAtTimestamp: Timestamp.fromDate(new Date(event.occurredAt)),
    });
    console.log(`[Events] Firestore emit success: ${event.name} (${event.id})`);
  } catch (error) {
    // Best-effort: log but don't throw
    logError('emitEvent.firestore', error, {
      eventId: event.id,
      eventName: event.name,
    });
  }

  // Optional: Direct HTTP emission to automation hub
  await emitEventDirect(event);
}

// ============================================================================
// Convenience Helpers for Common Events
// ============================================================================

/**
 * Emit booking.created event
 */
export async function emitBookingCreated(args: {
  bookingId: string;
  serviceId?: string;
  moduleId?: string;
  tenantId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const event = buildEvent({
    name: "booking.created",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      bookingId: args.bookingId,
      serviceId: args.serviceId,
      moduleId: args.moduleId,
      ...args.payload,
    },
  });
  await emitEvent(event);
}

/**
 * Emit booking.status_updated event
 */
export async function emitBookingStatusUpdated(args: {
  bookingId: string;
  oldStatus: string;
  newStatus: string;
  tenantId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const event = buildEvent({
    name: "booking.status_updated",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      bookingId: args.bookingId,
      oldStatus: args.oldStatus,
      newStatus: args.newStatus,
      ...args.payload,
    },
  });
  await emitEvent(event);
}

/**
 * Emit asset.uploaded event
 */
export async function emitAssetUploaded(args: {
  assetId: string;
  bookingId?: string;
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  storageUrl?: string;
  tenantId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const event = buildEvent({
    name: "asset.uploaded",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      assetId: args.assetId,
      bookingId: args.bookingId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      fileName: args.fileName,
      storageUrl: args.storageUrl,
      ...args.payload,
    },
  });
  await emitEvent(event);
}

/**
 * Emit payment.completed event
 */
export async function emitPaymentCompleted(args: {
  paymentId: string;
  bookingId?: string;
  amountCents?: number;
  currency?: string;
  billingProvider?: string;
  tenantId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const event = buildEvent({
    name: "payment.completed",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      paymentId: args.paymentId,
      bookingId: args.bookingId,
      amountCents: args.amountCents,
      currency: args.currency,
      billingProvider: args.billingProvider,
      ...args.payload,
    },
  });
  await emitEvent(event);
}

/**
 * Emit payment.intent_created event
 */
export async function emitPaymentIntentCreated(args: {
  paymentIntentId: string;
  bookingId?: string;
  amountCents?: number;
  currency?: string;
  tenantId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const event = buildEvent({
    name: "payment.intent_created",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      paymentIntentId: args.paymentIntentId,
      bookingId: args.bookingId,
      amountCents: args.amountCents,
      currency: args.currency,
      ...args.payload,
    },
  });
  await emitEvent(event);
}
