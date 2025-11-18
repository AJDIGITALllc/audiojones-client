import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { config } from "@/lib/config";
import { webhookLogger } from "@/lib/webhook-logger";
import type { BookingStatus, BookingStatusChangeEvent } from "@/types/platform";
import { isValidBookingStatus } from "@/types/platform";

// TODO: Replace with your actual booking update logic
async function updateBookingStatus(
  bookingId: string, 
  newStatus: BookingStatus,
  metadata?: Record<string, unknown>
): Promise<{ previousStatus: BookingStatus }> {
  // This should call your database/API to update the booking status
  // Example: await db.bookings.update({ id: bookingId, status: newStatus });
  
  webhookLogger.info(
    "booking.status_update",
    `Updating booking ${bookingId} to status: ${newStatus}`,
    { bookingId, newStatus, metadata }
  );

  // TODO: Implement actual database update
  // For now, return mock previous status
  return { previousStatus: "PENDING_PAYMENT" as BookingStatus };
}

async function notifyAutomationHub(event: BookingStatusChangeEvent): Promise<void> {
  try {
    if (!config.n8n.webhookUrl) {
      webhookLogger.warn(
        "automation.skipped",
        "N8N webhook URL not configured, skipping automation notification"
      );
      return;
    }

    const response = await fetch(config.n8n.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.n8n.apiKey && { "X-API-Key": config.n8n.apiKey }),
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook returned ${response.status}`);
    }

    webhookLogger.info(
      "automation.notified",
      "Successfully notified automation hub",
      { bookingId: event.bookingId }
    );
  } catch (error) {
    webhookLogger.error(
      "automation.failed",
      "Failed to notify automation hub",
      error,
      { bookingId: event.bookingId }
    );
  }
}

function verifyWhopSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    webhookLogger.error("signature.verification_failed", "Signature verification error", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const eventId = crypto.randomUUID();
  
  webhookLogger.info("webhook.received", "Whop webhook received", { eventId });

  if (!config.whop.webhookSecret) {
    webhookLogger.error(
      "webhook.config_error",
      "WHOP_WEBHOOK_SECRET is not configured",
      undefined,
      { eventId }
    );
    return NextResponse.json(
      { error: "Webhook handler not configured" },
      { status: 500 }
    );
  }

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-whop-signature") || headersList.get("whop-signature") || "";

    // Verify signature
    if (!verifyWhopSignature(rawBody, signature, config.whop.webhookSecret)) {
      webhookLogger.error(
        "webhook.invalid_signature",
        "Invalid webhook signature",
        undefined,
        { eventId, signatureProvided: !!signature }
      );
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.action || payload.type || "unknown";
    
    webhookLogger.info("webhook.parsed", `Webhook event: ${eventType}`, {
      eventId,
      eventType,
      hasBookingId: !!(payload.metadata?.bookingId || payload.data?.metadata?.bookingId)
    });

    // Handle different event types
    switch (eventType) {
      case "payment.succeeded":
      case "membership.went_valid":
      case "payment_completed": {
        // Extract booking reference from metadata
        const bookingId = payload.metadata?.bookingId || 
                         payload.data?.metadata?.bookingId ||
                         payload.custom_fields?.booking_id;

        if (!bookingId) {
          webhookLogger.warn(
            "webhook.missing_booking_id",
            "No booking ID found in webhook payload",
            { eventId, eventType, payload: payload }
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Update booking status
        const { previousStatus } = await updateBookingStatus(bookingId, "APPROVED", {
          whopEventId: payload.id || eventId,
          whopEventType: eventType,
        });
        
        webhookLogger.info(
          "booking.approved",
          `Booking ${bookingId} approved after Whop payment`,
          { bookingId, previousStatus, eventId }
        );

        // Notify automation hub
        const statusChangeEvent: BookingStatusChangeEvent = {
          bookingId,
          previousStatus,
          newStatus: "APPROVED",
          paymentStatus: "completed",
          timestamp: new Date().toISOString(),
          triggeredBy: "webhook",
        };

        await notifyAutomationHub(statusChangeEvent);
        break;
      }

      case "payment.failed":
      case "membership.went_invalid": {
        const bookingId = payload.metadata?.bookingId || 
                         payload.data?.metadata?.bookingId ||
                         payload.custom_fields?.booking_id;

        if (bookingId) {
          const { previousStatus } = await updateBookingStatus(bookingId, "PAYMENT_FAILED", {
            whopEventId: payload.id || eventId,
            whopEventType: eventType,
          });
          
          webhookLogger.warn(
            "booking.payment_failed",
            `Booking ${bookingId} payment failed`,
            { bookingId, previousStatus, eventId }
          );

          // Notify automation hub
          const statusChangeEvent: BookingStatusChangeEvent = {
            bookingId,
            previousStatus,
            newStatus: "PAYMENT_FAILED",
            paymentStatus: "failed",
            timestamp: new Date().toISOString(),
            triggeredBy: "webhook",
          };

          await notifyAutomationHub(statusChangeEvent);
        }
        break;
      }

      default:
        webhookLogger.info(
          "webhook.unhandled_event",
          `Unhandled webhook event type: ${eventType}`,
          { eventId, eventType }
        );
    }

    // Always respond 200 to prevent retries for unknown events
    return NextResponse.json({ received: true, eventId }, { status: 200 });

  } catch (error) {
    webhookLogger.error(
      "webhook.processing_error",
      "Webhook processing error",
      error,
      { eventId }
    );
    
    // Return 200 to prevent retry storms, but log the error
    return NextResponse.json(
      { received: true, error: "Processing failed", eventId },
      { status: 200 }
    );
  }
}
