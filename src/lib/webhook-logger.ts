// Webhook event logging and observability utilities
import type { WebhookEvent, BookingStatusChangeEvent } from "@/types/platform";

export interface WebhookLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  eventType: string;
  eventId?: string;
  bookingId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

class WebhookLogger {
  private logs: WebhookLogEntry[] = [];
  private readonly maxLogs = 1000;

  log(entry: Omit<WebhookLogEntry, "timestamp">): void {
    const logEntry: WebhookLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Console logging with structured format
    const prefix = this.getLogPrefix(entry.level);
    console.log(
      `${prefix} [Webhook] ${entry.eventType}:`,
      entry.message,
      entry.metadata ? JSON.stringify(entry.metadata, null, 2) : ""
    );

    // Store in memory (for admin dashboard)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Send to external monitoring if enabled
    this.sendToMonitoring(logEntry).catch(console.error);
  }

  info(eventType: string, message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: "info", eventType, message, metadata });
  }

  warn(eventType: string, message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: "warn", eventType, message, metadata });
  }

  error(eventType: string, message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    this.log({
      level: "error",
      eventType,
      message,
      error: error instanceof Error ? error.message : String(error),
      metadata,
    });
  }

  async sendToMonitoring(entry: WebhookLogEntry): Promise<void> {
    // Only send errors and warnings to external monitoring
    if (entry.level === "info") return;

    try {
      const { config } = await import("@/lib/config");
      
      if (!config.notifications.enabled) return;

      const notificationMessage = this.formatNotification(entry);

      // Send to Slack
      if (config.notifications.slackWebhookUrl) {
        await fetch(config.notifications.slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: notificationMessage,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: notificationMessage,
                },
              },
            ],
          }),
        });
      }

      // Send to Discord
      if (config.notifications.discordWebhookUrl) {
        await fetch(config.notifications.discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: notificationMessage,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to send monitoring notification:", error);
    }
  }

  private formatNotification(entry: WebhookLogEntry): string {
    const emoji = entry.level === "error" ? "" : "";
    let message = `${emoji} **Webhook ${entry.level.toUpperCase()}**\n`;
    message += `**Event**: ${entry.eventType}\n`;
    message += `**Message**: ${entry.message}\n`;
    
    if (entry.bookingId) {
      message += `**Booking ID**: ${entry.bookingId}\n`;
    }
    
    if (entry.error) {
      message += `**Error**: ${entry.error}\n`;
    }
    
    message += `**Time**: ${entry.timestamp}`;
    
    return message;
  }

  private getLogPrefix(level: string): string {
    switch (level) {
      case "info":
        return "?";
      case "warn":
        return "";
      case "error":
        return "";
      default:
        return "";
    }
  }

  getLogs(filter?: { level?: string; eventType?: string; limit?: number }): WebhookLogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.eventType) {
      filtered = filtered.filter((log) => log.eventType === filter.eventType);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered.reverse();
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const webhookLogger = new WebhookLogger();

// Helper for logging booking status changes
export function logBookingStatusChange(event: BookingStatusChangeEvent): void {
  webhookLogger.info("booking.status_changed", "Booking status updated", {
    bookingId: event.bookingId,
    previousStatus: event.previousStatus,
    newStatus: event.newStatus,
    moduleId: event.moduleId,
    paymentStatus: event.paymentStatus,
    triggeredBy: event.triggeredBy,
  });
}

// Helper for logging webhook events
export function logWebhookEvent(event: WebhookEvent): void {
  webhookLogger.info(event.eventType, "Webhook event received", {
    eventId: event.eventId,
    bookingId: event.bookingId,
    payload: event.payload,
  });
}
