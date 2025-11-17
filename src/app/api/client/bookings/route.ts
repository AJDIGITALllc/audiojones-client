// src/app/api/client/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { requireAuth, errorResponse } from '@/lib/api/middleware';
import { Booking, Service, BookingStatusEvent, BookingStatus } from '@/lib/types/firestore';
import type { BookingSummary } from '@/lib/types';
import { logError } from '@/lib/log';

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
    logError('api/client/bookings GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { userId, tenantId } = authResult;
    const body = await request.json();

    // Fetch service to get billing info
    const serviceDoc = await getDoc(doc(db, 'services', body.serviceId));
    const service = serviceDoc.data() as Service;

    // Determine initial status based on payment requirements
    let initialStatus: BookingStatus = body.requiresApproval ? 'pending' : 'approved';
    if (service?.billingProvider === 'whop' || service?.billingProvider === 'stripe') {
      initialStatus = 'pending_payment';
    }
    
    const statusHistory: BookingStatusEvent[] = [{
      status: initialStatus,
      changedAt: new Date().toISOString(),
      changedByUserId: userId,
    }];

    const bookingData: Omit<Booking, 'id'> = {
      tenantId,
      userId,
      serviceId: body.serviceId,
      status: initialStatus,
      scheduledAt: body.scheduledAt ? Timestamp.fromDate(new Date(body.scheduledAt)) : null,
      notes: body.notes || '',
      priceCents: body.priceCents || service?.priceCents || service?.basePrice,
      startTime: body.startTime ? Timestamp.fromDate(new Date(body.startTime)) : undefined,
      endTime: body.endTime ? Timestamp.fromDate(new Date(body.endTime)) : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      statusHistory,
      paymentStatus: 'unpaid',
      paymentProvider: service?.billingProvider || 'none',
      paymentExternalId: null,
      paymentUrl: null,
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // Get payment URL for supported providers
    let paymentUrl = null;
    if (service?.billingProvider === 'whop' && service?.whop?.url) {
      // Use real Whop checkout URL if available
      paymentUrl = service.whop.url;
      await updateDoc(doc(db, 'bookings', docRef.id), { paymentUrl });
    } else if (service?.billingProvider === 'stripe') {
      // Placeholder for Stripe - would integrate with Stripe Checkout API
      paymentUrl = `https://pay.example.com/booking/${docRef.id}`;
      await updateDoc(doc(db, 'bookings', docRef.id), { paymentUrl });
    }

    return NextResponse.json({ 
      bookingId: docRef.id,
      paymentUrl,
      paymentProvider: service?.billingProvider || 'none',
    }, { status: 201 });
  } catch (error) {
    logError('api/client/bookings POST', error, {
      url: request.url,
      method: 'POST',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
