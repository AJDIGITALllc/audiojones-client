import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { webhookLogger } from "@/lib/webhook-logger";
import type { BookingStatusChangeEvent } from "@/types/platform";
import { isValidBookingStatus } from "@/types/platform";

// Internal API key validation
function validateInternalRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  
  // TODO: Add proper internal API key validation
  // For now, just check that some form of auth is present
  return !!(authHeader || apiKey);
}

async function sendToN8N(event: BookingStatusChangeEvent, retryCount = 0): Promise<boolean> {
  const maxRetries = 3;
  
  try {
    if (!config.n8n.webhookUrl) {
      webhookLogger.warn(
        "n8n.not_configured",
        "N8N webhook URL not configured"
      );
      return false;
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
      throw new Error(`N8N returned ${response.status}: ${await response.text()}`);
    }

    webhookLogger.info(
      "n8n.event_sent",
      "Successfully sent event to N8N",
      { bookingId: event.bookingId, eventType: "booking_updated" }
    );

    return true;
  } catch (error) {
    webhookLogger.error(
      "n8n.send_failed",
      `Failed to send event to N8N (attempt ${retryCount + 1}/${maxRetries})`,
      error,
      { bookingId: event.bookingId }
    );

    // Retry with exponential backoff
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendToN8N(event, retryCount + 1);
    }

    return false;
  }
}

export async function POST(request: NextRequest) {
  // Validate internal request
  if (!validateInternalRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate event structure
    if (!body.bookingId || !body.newStatus) {
      webhookLogger.warn(
        "internal.invalid_payload",
        "Invalid booking status change event payload",
        { payload: body }
      );
      return NextResponse.json(
        { error: "Invalid payload: bookingId and newStatus are required" },
        { status: 400 }
      );
    }

    // Validate booking status
    if (!isValidBookingStatus(body.newStatus)) {
      webhookLogger.warn(
        "internal.invalid_status",
        `Invalid booking status: ${body.newStatus}`,
        { bookingId: body.bookingId, status: body.newStatus }
      );
      return NextResponse.json(
        { error: `Invalid booking status: ${body.newStatus}` },
        { status: 400 }
      );
    }

    const event: BookingStatusChangeEvent = {
      bookingId: body.bookingId,
      previousStatus: body.previousStatus || "PENDING",
      newStatus: body.newStatus,
      moduleId: body.moduleId,
      paymentStatus: body.paymentStatus,
      preflight: body.preflight,
      timestamp: new Date().toISOString(),
      triggeredBy: body.triggeredBy || "system",
    };

    webhookLogger.info(
      "internal.event_received",
      "Booking status change event received",
      { bookingId: event.bookingId, status: event.newStatus }
    );

    // Send to N8N with retry
    const success = await sendToN8N(event);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to notify automation hub after retries" },
        { status: 500 }
      );
    }
  } catch (error) {
    webhookLogger.error(
      "internal.processing_error",
      "Error processing internal event",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
