// src/app/(protected)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDashboardStats, listBookings } from "@/lib/api/client";
import type { DashboardStats, BookingSummary } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([
          getDashboardStats(),
          listBookings({ status: "APPROVED" }),
        ]);
        setStats(statsData);
        setUpcomingSessions(bookingsData.slice(0, 3));
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back to Audio Jones</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-background-card hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings.toString()}
              icon="📊"
              color="primary"
            />
            <StatCard
              title="Active Sessions"
              value={stats.activeBookings.toString()}
              icon="🎵"
              color="accent"
            />
            <StatCard
              title="Total Files"
              value={stats.totalAssets.toString()}
              icon="📁"
              color="support"
            />
            <StatCard
              title="Hours Booked"
              value={`${stats.totalHoursBooked}h`}
              icon="⏱️"
              color="primary"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-background-card rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Upcoming Sessions
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-background rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-4 bg-gray-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-background rounded-xl p-4 hover:bg-gray-900 transition-colors cursor-pointer"
                      onClick={() => router.push("/bookings")}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            {session.serviceName}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {session.scheduledDate || "Not scheduled"}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-medium">
                          {session.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No upcoming sessions
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/book")}
                className="w-full px-4 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Book a Session
              </button>
              <button
                onClick={() => router.push("/bookings")}
                className="w-full px-4 py-3 bg-background hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
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
                View My Bookings
              </button>
              <button
                onClick={() => router.push("/assets")}
                className="w-full px-4 py-3 bg-background hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                Browse Assets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: "primary" | "accent" | "support";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    support: "bg-support/10 text-support",
  };

  return (
    <div className="bg-background-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
