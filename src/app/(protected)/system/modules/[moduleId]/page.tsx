"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { modules, type ModuleId } from "@/config/modules";
import Link from "next/link";

interface Booking {
  id: string;
  serviceName: string;
  status: string;
  createdAt: string;
  scheduledDate?: string;
  paymentUrl?: string | null;
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, tenantId } = useTenant();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const moduleId = params.moduleId as ModuleId;
  const module = modules.find((m) => m.id === moduleId);

  useEffect(() => {
    async function loadBookings() {
      if (!user || !tenantId || !module) return;

      try {
        const response = await fetch("/api/client/bookings");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const allBookings = await response.json();

        // Filter bookings relevant to this module (simplified - in production, use service categories)
        setBookings(allBookings);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [user, tenantId, module]);

  if (!module) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Module Not Found</h1>
            <Link href="/system/modules" className="text-primary hover:underline">
              ← Back to Modules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingPaymentBookings = bookings.filter((b) => b.status === "PENDING_PAYMENT");
  const activeBookings = bookings.filter((b) =>
    ["PENDING", "APPROVED", "IN_PROGRESS"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "completed":
        return "bg-primary/20 text-primary border-primary/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/system/modules"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <span>←</span> Back to Modules
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl">{module.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{module.name}</h1>
            <p className="text-gray-400">{module.description}</p>
          </div>
        </div>

        {/* Pending Payments Alert */}
        {pendingPaymentBookings.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-4">
              ⚠️ Action Required: Complete Payment
            </h2>
            <div className="space-y-3">
              {pendingPaymentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between bg-card border border-purple-500/20 rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-medium text-white">{booking.serviceName}</h3>
                    <p className="text-sm text-gray-400">
                      Booked {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {booking.paymentUrl && (
                    <a
                      href={booking.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Complete Payment →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{activeBookings.length}</div>
            <div className="text-gray-400 text-sm">Active Bookings</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{completedBookings.length}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{bookings.length}</div>
            <div className="text-gray-400 text-sm">Total Bookings</div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No bookings yet for this module</p>
              <Link
                href="/book"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Book Your First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings`}
                  className="block bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{booking.serviceName}</h3>
                      <p className="text-sm text-gray-400">
                        {booking.scheduledDate
                          ? `Scheduled for ${new Date(booking.scheduledDate).toLocaleDateString()}`
                          : `Booked ${new Date(booking.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Book Another Session
            </Link>
            <Link
              href="/bookings"
              className="px-4 py-2 bg-card border border-border text-white rounded-lg hover:border-primary/50 transition-colors"
            >
              View All Bookings
            </Link>
            <a
              href="mailto:support@audiojones.com"
              className="px-4 py-2 bg-card border border-border text-white rounded-lg hover:border-primary/50 transition-colors"
            >
              Need Help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
