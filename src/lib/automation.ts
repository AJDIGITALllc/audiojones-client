// src/lib/automation.ts

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.audiojones.com';

export type AutomationEventType =
  | 'booking.created'
  | 'booking.submitted'
  | 'booking.approved'
  | 'booking.completed'
  | 'booking.canceled'
  | 'asset.uploaded';

export async function fireAutomationEvent(event: {
  type: AutomationEventType;
  bookingId: string;
  tenantId: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await fetch(`${BASE}/automation/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (err) {
    console.error('Automation event failed', err);
  }
}
