// Shared platform types - single source of truth for type safety across the application

// Module system
export type ModuleId = 
  | "client-delivery" 
  | "marketing-automation" 
  | "ai-optimization" 
  | "data-intelligence";

export type ServicePersona = "creator" | "business" | "both";

export type ServiceCategory = 
  | "ARTIST" 
  | "CONSULTING" 
  | "STRATEGY" 
  | "PRODUCTION" 
  | "SMB" 
  | "OTHER";

// Booking system
export type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "PENDING_PAYMENT"
  | "PENDING_ADMIN"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "DECLINED"
  | "PAYMENT_FAILED";

export type PaymentProvider = "whop" | "stripe" | "none";

export type PaymentStatus = 
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "canceled";

// Preflight system
export interface PreflightItem {
  id: string;
  label: string;
  required: boolean;
}

export interface PreflightPayload {
  moduleId: ModuleId;
  checkedItemIds: string[];
  allRequiredCompleted: boolean;
  completedAt?: string;
}

export interface PreflightState {
  checkedItemIds: string[];
  lastUpdated: number;
}

// Payment metadata
export interface PaymentMetadata {
  provider: PaymentProvider;
  status: PaymentStatus;
  url?: string;
  externalId?: string;
  amount?: number;
  currency?: string;
  completedAt?: string;
}

// Booking event payloads (for automation/webhooks)
export interface BookingStatusChangeEvent {
  bookingId: string;
  previousStatus: BookingStatus;
  newStatus: BookingStatus;
  moduleId?: ModuleId;
  paymentStatus?: PaymentStatus;
  preflight?: PreflightPayload;
  timestamp: string;
  triggeredBy: "user" | "webhook" | "admin" | "system";
}

export interface WebhookEvent {
  eventId: string;
  eventType: string;
  bookingId?: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  processedAt?: string;
  error?: string;
}

// Type guards
export function isValidModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && [
    "client-delivery",
    "marketing-automation", 
    "ai-optimization",
    "data-intelligence"
  ].includes(value);
}

export function isValidBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && [
    "DRAFT",
    "PENDING",
    "PENDING_PAYMENT",
    "PENDING_ADMIN",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELED",
    "DECLINED",
    "PAYMENT_FAILED"
  ].includes(value);
}

export function isValidPaymentProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && ["whop", "stripe", "none"].includes(value);
}

export function isValidPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === "string" && [
    "pending",
    "completed",
    "failed",
    "refunded",
    "canceled"
  ].includes(value);
}

// Safe getters with defaults
export function getBookingStatusLabel(status: BookingStatus | string): string {
  const labels: Record<BookingStatus, string> = {
    DRAFT: "Draft",
    PENDING: "Pending",
    PENDING_PAYMENT: "Awaiting Payment",
    PENDING_ADMIN: "Pending Admin Review",
    APPROVED: "Approved",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELED: "Canceled",
    DECLINED: "Declined",
    PAYMENT_FAILED: "Payment Failed",
  };

  return isValidBookingStatus(status) ? labels[status] : status.replace("_", " ");
}

export function getBookingStatusColor(status: BookingStatus | string): string {
  const colors: Record<BookingStatus, string> = {
    DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    PENDING_PAYMENT: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    PENDING_ADMIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/50",
    IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    COMPLETED: "bg-primary/20 text-primary border-primary/50",
    CANCELED: "bg-red-500/20 text-red-400 border-red-500/50",
    DECLINED: "bg-red-500/20 text-red-400 border-red-500/50",
    PAYMENT_FAILED: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return isValidBookingStatus(status) 
    ? colors[status] 
    : "bg-gray-500/20 text-gray-400 border-gray-500/50";
}
