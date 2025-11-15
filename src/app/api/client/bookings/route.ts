// src/app/api/client/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { requireAuth, errorResponse } from '@/lib/api/middleware';
import type { Booking, Service } from '@/lib/types/firestore';
import type { BookingSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');

    // Query bookings for the user's tenant and user
    let q = query(
      collection(db, 'bookings'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (status && status !== 'all') {
      q = query(
        collection(db, 'bookings'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId),
        where('status', '==', status.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
    }

    const snap = await getDocs(q);

    // Fetch service names for each booking
    const bookings: BookingSummary[] = await Promise.all(
      snap.docs.map(async (bookingDoc) => {
        const data = bookingDoc.data() as Booking;
        
        // Get service name
        let serviceName = 'Unknown Service';
        try {
          const serviceDoc = await getDoc(doc(db, 'services', data.serviceId));
          if (serviceDoc.exists()) {
            serviceName = (serviceDoc.data() as Service).name;
          }
        } catch (err) {
          console.error('Failed to fetch service:', err);
        }

        return {
          id: bookingDoc.id,
          tenantId: data.tenantId,
          serviceId: data.serviceId,
          serviceName,
          status: data.status.toUpperCase() as any,
          source: 'CLIENT_PORTAL',
          startAt: data.startTime?.toDate().toISOString() || data.scheduledAt?.toDate().toISOString() || '',
          endAt: data.endTime?.toDate().toISOString() || data.scheduledAt?.toDate().toISOString() || '',
          scheduledDate: data.scheduledAt?.toDate().toISOString().split('T')[0] || '',
          totalCost: data.priceCents ? data.priceCents / 100 : 0,
          createdAt: data.createdAt.toDate().toISOString(),
        };
      })
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return errorResponse('Failed to fetch bookings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { userId, tenantId } = authResult;
    const body = await request.json();

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
    return errorResponse('Failed to create booking');
  }
}
