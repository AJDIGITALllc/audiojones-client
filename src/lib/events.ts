// Central event emitter for client portal
// Emits normalized events to Firestore for consumption by automation hub

import { db } from './firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { logError } from './log';

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
 * Emit event to Firestore portalEvents collection
 * Errors are logged but not thrown to keep user flow uninterrupted
 */
export async function emitEvent(event: PortalEvent): Promise<void> {
  try {
    const eventRef = doc(collection(db, 'portalEvents'), event.id);
    await setDoc(eventRef, {
      ...event,
      // Store occurredAt as both ISO string and Firestore timestamp for querying
      occurredAtTimestamp: Timestamp.fromDate(new Date(event.occurredAt)),
    });
  } catch (error) {
    // Best-effort: log but don't throw
    logError('emitEvent', error, {
      eventId: event.id,
      eventName: event.name,
    });
  }
}

/**
 * Build a payment.completed event (stub for future webhook integration)
 */
export function buildPaymentCompletedEvent(args: {
  bookingId: string;
  amountCents?: number;
  currency?: string;
  billingProvider?: string;
  tenantId?: string;
  userId?: string;
}): PortalEvent {
  return buildEvent({
    name: "payment.completed",
    tenantId: args.tenantId,
    userId: args.userId,
    payload: {
      bookingId: args.bookingId,
      amountCents: args.amountCents,
      currency: args.currency,
      billingProvider: args.billingProvider,
    },
  });
}
