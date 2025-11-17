// src/app/api/client/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { requireAuth, errorResponse } from '@/lib/api/middleware';
import type { Booking, Asset, Service } from '@/lib/types/firestore';
import type { DashboardStats, BookingSummary } from '@/lib/types';
import { logError } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;

    // Fetch all bookings for this user
    const bookingsSnap = await getDocs(
      query(
        collection(db, 'bookings'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId)
      )
    );

    const bookings = bookingsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Booking & { id: string })[];

    // Calculate stats
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => 
      ['approved', 'in_progress'].includes(b.status)
    ).length;
    const pendingApprovals = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;

    // Get upcoming bookings (approved, scheduled in future)
    const now = new Date();
    const upcomingBookingsData = bookings
      .filter(b => 
        b.status === 'approved' && 
        b.scheduledAt && 
        b.scheduledAt.toDate() > now
      )
      .sort((a, b) => 
        (a.scheduledAt?.toMillis() || 0) - (b.scheduledAt?.toMillis() || 0)
      )
      .slice(0, 5);

    // Fetch service names for upcoming bookings
    const upcomingBookings: BookingSummary[] = await Promise.all(
      upcomingBookingsData.map(async (booking) => {
        let serviceName = 'Unknown Service';
        try {
          const serviceDoc = await getDoc(doc(db, 'services', booking.serviceId));
          if (serviceDoc.exists()) {
            serviceName = (serviceDoc.data() as Service).name;
          }
        } catch (err) {
          console.error('Failed to fetch service:', err);
        }

        return {
          id: booking.id,
          tenantId: booking.tenantId,
          serviceId: booking.serviceId,
          serviceName,
          status: booking.status.toUpperCase() as any,
          source: 'CLIENT_PORTAL',
          startAt: booking.startTime?.toDate().toISOString() || booking.scheduledAt?.toDate().toISOString() || '',
          endAt: booking.endTime?.toDate().toISOString() || booking.scheduledAt?.toDate().toISOString() || '',
          scheduledDate: booking.scheduledAt?.toDate().toISOString().split('T')[0] || '',
          totalCost: booking.priceCents ? booking.priceCents / 100 : 0,
          createdAt: booking.createdAt.toDate().toISOString(),
        };
      })
    );

    // Fetch assets count
    const assetsSnap = await getDocs(
      query(
        collection(db, 'assets'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId)
      )
    );
    const totalAssets = assetsSnap.size;

    // Calculate total hours (rough estimate from booking durations)
    const totalHoursBooked = bookings.reduce((acc, b) => {
      if (b.startTime && b.endTime) {
        const hours = (b.endTime.toMillis() - b.startTime.toMillis()) / (1000 * 60 * 60);
        return acc + hours;
      }
      return acc;
    }, 0);

    const stats: DashboardStats = {
      upcomingSessions: upcomingBookingsData.length,
      upcomingDelta: 0, // TODO: Calculate delta from previous period
      pendingApprovals,
      pendingDelta: 0, // TODO: Calculate delta
      completedSessions: completedBookings,
      completedDeltaPct: 0, // TODO: Calculate percentage change
      openMessages: 0, // TODO: Implement messaging system
      openMessagesDelta: 0,
      totalBookings,
      activeBookings,
      totalAssets,
      totalHoursBooked: Math.round(totalHoursBooked),
      upcomingBookings,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logError('api/client/dashboard GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
