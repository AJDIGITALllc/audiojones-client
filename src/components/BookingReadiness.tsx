"use client";

import type { BookingStatus, PaymentStatus, PreflightPayload } from "@/types/platform";
import { getBookingStatusLabel, getBookingStatusColor } from "@/types/platform";

interface ReadinessBadgeProps {
  type: "preflight" | "payment" | "status";
  status: "complete" | "incomplete" | "pending" | "failed";
  label: string;
  details?: string;
}

export function ReadinessBadge({ type, status, label, details }: ReadinessBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "complete":
        return {
          icon: "",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/50",
          textColor: "text-green-400",
        };
      case "incomplete":
        return {
          icon: "",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/50",
          textColor: "text-gray-400",
        };
      case "pending":
        return {
          icon: "",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/50",
          textColor: "text-yellow-400",
        };
      case "failed":
        return {
          icon: "",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/50",
          textColor: "text-red-400",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`${config.textColor} font-bold`}>{config.icon}</span>
        <span className={`${config.textColor} font-medium text-sm`}>{label}</span>
      </div>
      {details && (
        <p className="text-xs text-gray-400 ml-6">{details}</p>
      )}
    </div>
  );
}

interface BookingReadinessProps {
  bookingStatus: BookingStatus | string;
  paymentStatus?: PaymentStatus | string;
  preflight?: PreflightPayload | null;
  hasPaymentUrl?: boolean;
}

export function BookingReadiness({
  bookingStatus,
  paymentStatus,
  preflight,
  hasPaymentUrl,
}: BookingReadinessProps) {
  const isPaymentRequired = bookingStatus === "PENDING_PAYMENT";
  const isPreflightComplete = preflight?.allRequiredCompleted === true;
  const hasPreflightData = !!preflight && preflight.checkedItemIds.length > 0;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-400">Booking Readiness</h4>

      {/* Preflight Status */}
      {preflight && (
        <ReadinessBadge
          type="preflight"
          status={isPreflightComplete ? "complete" : hasPreflightData ? "pending" : "incomplete"}
          label={isPreflightComplete ? "Preflight Complete" : "Preflight Incomplete"}
          details={
            isPreflightComplete
              ? `All required items completed (${preflight.checkedItemIds.length} items)`
              : `${preflight.checkedItemIds.length} items checked, some required items missing`
          }
        />
      )}

      {/* Payment Status */}
      {isPaymentRequired && (
        <ReadinessBadge
          type="payment"
          status={
            paymentStatus === "completed"
              ? "complete"
              : paymentStatus === "failed"
              ? "failed"
              : hasPaymentUrl
              ? "pending"
              : "incomplete"
          }
          label={
            paymentStatus === "completed"
              ? "Payment Verified"
              : paymentStatus === "failed"
              ? "Payment Failed"
              : hasPaymentUrl
              ? "Payment Pending"
              : "Payment Link Missing"
          }
          details={
            paymentStatus === "completed"
              ? "Payment has been confirmed"
              : hasPaymentUrl
              ? "Complete payment to proceed"
              : "Payment link will be sent manually"
          }
        />
      )}

      {/* Booking Status */}
      <ReadinessBadge
        type="status"
        status={
          ["COMPLETED", "APPROVED", "IN_PROGRESS"].includes(bookingStatus)
            ? "complete"
            : ["CANCELED", "DECLINED", "PAYMENT_FAILED"].includes(bookingStatus)
            ? "failed"
            : "pending"
        }
        label={`Status: ${getBookingStatusLabel(bookingStatus)}`}
        details={undefined}
      />
    </div>
  );
}
