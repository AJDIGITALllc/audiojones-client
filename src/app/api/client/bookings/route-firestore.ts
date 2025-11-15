// src/app/api/client/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import type { Booking } from '@/lib/types/firestore';
import type { BookingSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    
    // TODO: Get tenantId from authenticated user context
    // For now, using hardcoded tenant
    const tenantId = 'tenant-audiojones';

    // Query bookings for the user's tenant
    let q = query(
      collection(db, 'bookings'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    // Filter by status if specified
    if (status && status !== 'all') {
      q = query(
        collection(db, 'bookings'),
        where('tenantId', '==', tenantId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const snap = await getDocs(q);

    // Transform to BookingSummary format
    const bookings: BookingSummary[] = snap.docs.map((doc) => {
      const data = doc.data() as Booking;
      return {
        id: doc.id,
        tenantId: data.tenantId,
        serviceId: data.serviceId,
        serviceName: 'Service Name', // TODO: Join with services collection
        status: data.status.toUpperCase() as any,
        source: 'CLIENT_PORTAL',
        startAt: data.scheduledAt?.toDate().toISOString() || new Date().toISOString(),
        endAt: data.scheduledAt?.toDate().toISOString() || new Date().toISOString(),
        scheduledDate: data.scheduledAt?.toDate().toISOString().split('T')[0] || '',
        totalCost: data.priceCents ? data.priceCents / 100 : 0,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Get userId and tenantId from authenticated user
    const userId = 'user-placeholder';
    const tenantId = 'tenant-audiojones';

    // Create new booking document
    const bookingData: Omit<Booking, 'id'> = {
      tenantId,
      userId,
      serviceId: body.serviceId,
      status: body.requiresApproval ? 'pending' : 'approved',
      scheduledAt: body.scheduledAt ? Timestamp.fromDate(new Date(body.scheduledAt)) : null,
      notes: body.notes || '',
      priceCents: body.priceCents,
      startTime: body.startTime ? Timestamp.fromDate(new Date(body.startTime)) : undefined,
      endTime: body.endTime ? Timestamp.fromDate(new Date(body.endTime)) : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    return NextResponse.json({ bookingId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
