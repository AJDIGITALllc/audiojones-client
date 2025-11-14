// src/app/api/client/dashboard/route.ts
import { NextResponse } from 'next/server';
import type { DashboardStats } from '@/lib/types';

export async function GET() {
  const mockStats: DashboardStats = {
    upcomingSessions: 3,
    upcomingDelta: 1,
    pendingApprovals: 2,
    pendingDelta: -1,
    completedSessions: 12,
    completedDeltaPct: 15,
    openMessages: 1,
    openMessagesDelta: 1,
    totalBookings: 18,
    activeBookings: 5,
    totalAssets: 24,
    totalHoursBooked: 48,
    upcomingBookings: [
      {
        id: 'booking-1',
        tenantId: 'tenant-audiojones',
        serviceId: 'svc-mixing',
        serviceName: 'Professional Mixing',
        status: 'APPROVED',
        source: 'CLIENT_PORTAL',
        startAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        totalCost: 500,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'booking-2',
        tenantId: 'tenant-audiojones',
        serviceId: 'svc-mastering',
        serviceName: 'Mastering Session',
        status: 'APPROVED',
        source: 'CLIENT_PORTAL',
        startAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
        scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        totalCost: 300,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'booking-3',
        tenantId: 'tenant-audiojones',
        serviceId: 'svc-consultation',
        serviceName: 'Strategy Consultation',
        status: 'PENDING',
        source: 'CLIENT_PORTAL',
        startAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 7 + 3600000).toISOString(),
        scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        totalCost: 200,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json(mockStats);
}
