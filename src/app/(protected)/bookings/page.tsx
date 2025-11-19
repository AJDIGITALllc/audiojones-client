"use client";

import { useState, useEffect } from "react";
import { listBookings, getBookingDetail } from "@/lib/api/client";
import type { BookingSummary, BookingDetail } from "@/lib/types";
import ModuleGuide from "@/components/ModuleGuide";

const statusFilters = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PENDING_PAYMENT", label: "Awaiting Payment" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  PENDING_PAYMENT: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  PENDING_ADMIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/50",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  COMPLETED: "bg-primary/20 text-primary border-primary/50",
  CANCELED: "bg-red-500/20 text-red-400 border-red-500/50",
  DECLINED: "bg-red-500/20 text-red-400 border-red-500/50",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  PENDING_PAYMENT: "Awaiting Payment",
  PENDING_ADMIN: "Pending Admin",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
  DECLINED: "Declined",
};

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [selectedService, setSelectedService] = useState<import("@/lib/types").ServiceSummary | null>(null);
  const [selectedModuleGuide, setSelectedModuleGuide] = useState<import("@/lib/types").ServiceModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = statusFilter !== "ALL" ? { status: statusFilter } : undefined;
        const data = await listBookings(params);
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const handleBookingClick = async (bookingId: string) => {
    try {
      setDetailLoading(true);
      const [detail, services] = await Promise.all([
        getBookingDetail(bookingId),
        import("@/lib/api/client").then(m => m.listServices()),
      ]);
      setSelectedBooking(detail);
      // Find the service for this booking
      const service = services.find(s => s.id === detail.serviceId);
      setSelectedService(service || null);
    } catch (err) {
      console.error("Failed to load booking detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Manage and track your sessions</p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-background-card text-gray-400 hover:bg-gray-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              {error.includes("UNAUTHENTICATED") 
                ? "Please sign in again to continue." 
                : error.includes("FORBIDDEN")
                ? "You don't have access to view bookings."
                : "Please try again later."}
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-background-card rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No bookings found</p>
          </div>
        ) : (
          <BookingsGroupedList
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onBookingUpdate={() => {
              // Refetch bookings
              const refetch = async () => {
                try {
                  const params = statusFilter !== "ALL" ? { status: statusFilter } : undefined;
                  const data = await listBookings(params);
                  setBookings(data);
                } catch (err) {
                  console.error("Failed to refetch bookings:", err);
                }
              };
              refetch();
            }}
          />
        )}
      </div>

      {/* Detail Drawer */}
      {selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          service={selectedService}
          loading={detailLoading}
          onViewModuleGuide={(module) => setSelectedModuleGuide(module)}
          onClose={() => {
            setSelectedBooking(null);
            setSelectedService(null);
          }}
        />
      )}

      {/* Module Guide Modal */}
      {selectedModuleGuide && (
        <ModuleGuide
          module={selectedModuleGuide}
          onClose={() => setSelectedModuleGuide(null)}
        />
      )}
    </div>
  );
}

function BookingsGroupedList({
  bookings,
  onBookingClick,
  onBookingUpdate,
}: {
  bookings: BookingSummary[];
  onBookingClick: (id: string) => void;
  onBookingUpdate: () => void;
}) {
  const now = new Date();
  
  // Group bookings by time
  const upcoming = bookings.filter(b => {
    if (b.status === "CANCELED" || b.status === "COMPLETED") return false;
    if (!b.scheduledDate) return false;
    const scheduled = new Date(b.scheduledDate);
    return scheduled > now;
  });
  
  const inProgress = bookings.filter(b => {
    return b.status === "IN_PROGRESS" || b.status === "APPROVED";
  });
  
  const past = bookings.filter(b => {
    if (b.status === "COMPLETED" || b.status === "CANCELED") return true;
    if (!b.scheduledDate) return false;
    const scheduled = new Date(b.scheduledDate);
    return scheduled <= now;
  });

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => onBookingClick(booking.id)}
                onUpdate={onBookingUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">In Progress</h2>
          <div className="space-y-4">
            {inProgress.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => onBookingClick(booking.id)}
                onUpdate={onBookingUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Past</h2>
          <div className="space-y-4">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => onBookingClick(booking.id)}
                onUpdate={onBookingUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onClick,
  onUpdate,
}: {
  booking: BookingSummary;
  onClick: () => void;
  onUpdate?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/client/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "CANCELED",
        }),
      });
      
      if (!res.ok) throw new Error("Failed to cancel booking");
      
      onUpdate?.();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const canCancel = !["CANCELED", "COMPLETED", "DECLINED"].includes(booking.status);
  const canReschedule = ["APPROVED", "PENDING", "PENDING_PAYMENT"].includes(booking.status);
  return (
    <div className="bg-background-card rounded-xl p-6 hover:bg-gray-800 transition-colors relative">
      <div className="cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              {booking.serviceName}
            </h3>
            <p className="text-gray-400 text-sm">
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                statusColors[booking.status]
              }`}
            >
              {statusLabels[booking.status] || booking.status.replace("_", " ")}
            </span>
            {(canCancel || canReschedule) && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[160px]">
                    <button
                      onClick={onClick}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    {canReschedule && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Reschedule feature coming soon!");
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Reschedule
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {loading ? "Canceling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {booking.scheduledDate || "Not scheduled"}
          </span>
          {booking.totalCost && (
            <span className="text-white font-medium">${booking.totalCost}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDetailDrawer({
  booking,
  service,
  loading,
  onViewModuleGuide,
  onClose,
}: {
  booking: BookingDetail;
  service: import("@/lib/types").ServiceSummary | null;
  loading: boolean;
  onViewModuleGuide: (module: import("@/lib/types").ServiceModule) => void;
  onClose: () => void;
}) {
  const moduleLabels: Record<string, string> = {
    "client-delivery": "Client Delivery",
    "marketing-automation": "Marketing Automation",
    "ai-optimization": "AI Optimization",
    "data-intelligence": "Data Intelligence",
  };

  const personaLabels: Record<string, string> = {
    "creator": "Creator",
    "business": "Business",
    "both": "All",
  };

  const isPendingPayment = booking.status === "PENDING_PAYMENT";
  const isWhop = service?.billingProvider === "whop";
  const hasPaymentUrl = !!service?.whop?.url;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-background-card z-50 overflow-y-auto">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-8 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
          </div>
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {booking.serviceName}
                </h2>
                <div className="flex gap-2 flex-wrap mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      statusColors[booking.status]
                    }`}
                  >
                    {statusLabels[booking.status] || booking.status.replace("_", " ")}
                  </span>
                  {service?.module && (
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                      {moduleLabels[service.module]}
                    </span>
                  )}
                  {service?.persona && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                      {personaLabels[service.persona]}
                    </span>
                  )}
                </div>
                {service?.module && (
                  <button
                    onClick={() => onViewModuleGuide(service.module!)}
                    className="mt-2 text-sm text-primary hover:text-primary-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About this module
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Payment Status - Highlighted for PENDING_PAYMENT */}
              {isPendingPayment && (
                <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
                  <h3 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Required
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Your booking is created but not confirmed until payment is completed{isWhop && " on Whop"}.
                  </p>
                  {hasPaymentUrl && service?.whop?.url ? (
                    <a
                      href={service.whop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Complete Payment on Whop
                    </a>
                  ) : isWhop ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-yellow-400">
                        Payment link not configured yet. We'll send a payment link manually.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Billing Provider */}
              {service?.billingProvider && service.billingProvider !== "none" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Billing Provider
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-white capitalize">{service.billingProvider}</p>
                    {service.billingProvider === "whop" && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded border border-purple-500/20">
                        Powered by Whop
                      </span>
                    )}
                  </div>
                  {service.whop?.url && (
                    <a
                      href={service.whop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary-400 mt-1 inline-block"
                    >
                      View payment page →
                    </a>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Booking ID
                </h3>
                <p className="text-white font-mono text-sm">{booking.id}</p>
              </div>

              {booking.scheduledDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Scheduled Date
                  </h3>
                  <p className="text-white">{booking.scheduledDate}</p>
                </div>
              )}

              {booking.totalCost && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Total Cost
                  </h3>
                  <p className="text-white text-xl font-semibold">
                    ${booking.totalCost}
                  </p>
                </div>
              )}

              {booking.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Notes
                  </h3>
                  <p className="text-white">{booking.notes}</p>
                </div>
              )}

              {booking.attachments && booking.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {booking.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-white text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Created
                </h3>
                <p className="text-white">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>

              {booking.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Last Updated
                  </h3>
                  <p className="text-white">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
