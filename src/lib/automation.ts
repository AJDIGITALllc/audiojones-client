// src/lib/automation.ts
// Legacy automation event helpers - prefer using lib/events.ts for new code

import { buildEvent, emitEvent, type EventName } from './events';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

export type AutomationEventType =
  | 'booking.created'
  | 'booking.submitted'
  | 'booking.approved'
  | 'booking.completed'
  | 'booking.canceled'
  | 'asset.uploaded';

/**
 * @deprecated Use emitEvent from lib/events.ts instead
 * Legacy helper maintained for backwards compatibility
 */
export async function fireAutomationEvent(event: {
  type: AutomationEventType;
  bookingId: string;
  tenantId: string;
  payload?: Record<string, unknown>;
}) {
  try {
    // Map legacy type to normalized event name
    const eventName = event.type.replace('.', '.') as EventName;
    
    // Emit using new normalized event system
    const normalizedEvent = buildEvent({
      name: eventName,
      tenantId: event.tenantId,
      payload: {
        bookingId: event.bookingId,
        ...event.payload,
      },
    });

    await emitEvent(normalizedEvent);

    console.log(`[Automation] Fired event: ${event.type} for booking ${event.bookingId}`);
  } catch (err) {
    console.error('Automation event failed', err);
  }
}
