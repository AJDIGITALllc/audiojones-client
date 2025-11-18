"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { modules } from "@/config/modules";
import Link from "next/link";

interface ModuleStatus {
  moduleId: string;
  status: "active" | "onboarding" | "awaiting_payment" | "inactive";
  bookingCount: number;
  pendingPayments: number;
}

export default function ModulesPage() {
  const { user, tenantId } = useTenant();
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModuleStatuses() {
      if (!user || !tenantId) return;

      try {
        // Fetch bookings to derive module statuses
        const response = await fetch("/api/client/bookings");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const bookings = await response.json();

        // Calculate status for each module (simplified logic)
        const statuses: ModuleStatus[] = modules.map((module) => {
          const moduleBookings = bookings.filter((b: any) =>
            ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"].includes(b.status)
          );
          const pendingPayments = bookings.filter(
            (b: any) => b.status === "PENDING_PAYMENT"
          ).length;

          let status: "active" | "onboarding" | "awaiting_payment" | "inactive" = "inactive";
          if (pendingPayments > 0) {
            status = "awaiting_payment";
          } else if (moduleBookings.some((b: any) => ["DRAFT", "PENDING"].includes(b.status))) {
            status = "onboarding";
          } else if (moduleBookings.length > 0) {
            status = "active";
          }

          return {
            moduleId: module.id,
            status,
            bookingCount: moduleBookings.length,
            pendingPayments,
          };
        });

        setModuleStatuses(statuses);
      } catch (error) {
        console.error("Failed to load module statuses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadModuleStatuses();
  }, [user, tenantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "onboarding":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "awaiting_payment":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "onboarding":
        return "Onboarding";
      case "awaiting_payment":
        return "Awaiting Payment";
      default:
        return "Inactive";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My System</h1>
          <p className="text-gray-400">
            Track your progress across all Audio Jones modules
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const moduleStatus = moduleStatuses.find(
              (s) => s.moduleId === module.id
            );

            return (
              <Link
                key={module.id}
                href={`/system/modules/${module.id}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{module.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {module.name}
                        </h3>
                        {moduleStatus && (
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              moduleStatus.status
                            )}`}
                          >
                            {getStatusLabel(moduleStatus.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">
                    {module.shortDescription}
                  </p>

                  {/* Stats */}
                  {moduleStatus && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium text-white">
                          {moduleStatus.bookingCount}
                        </span>{" "}
                        bookings
                      </div>
                      {moduleStatus.pendingPayments > 0 && (
                        <div className="text-purple-400">
                          <span className="font-medium">
                            {moduleStatus.pendingPayments}
                          </span>{" "}
                          pending payment
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                      View Details
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Book a Session
            </Link>
            <Link
              href="/bookings"
              className="px-4 py-2 bg-card border border-border text-white rounded-lg hover:border-primary/50 transition-colors"
            >
              View All Bookings
            </Link>
            <Link
              href="/assets"
              className="px-4 py-2 bg-card border border-border text-white rounded-lg hover:border-primary/50 transition-colors"
            >
              My Assets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

