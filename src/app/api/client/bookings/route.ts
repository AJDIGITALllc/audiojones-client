// src/app/api/client/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { requireAuth, errorResponse } from '@/lib/api/middleware';
import { Booking, Service, BookingStatusEvent, BookingStatus } from '@/lib/types/firestore';
import type { BookingSummary } from '@/lib/types';
import { logError } from '@/lib/log';
import { buildEvent, emitEvent } from '@/lib/events';

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
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch bookings');
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

    // Emit booking.created event
    const moduleIds = service?.module ? [service.module] : undefined;
    await emitEvent(buildEvent({
      name: 'booking.created',
      tenantId,
      userId,
      moduleIds,
      payload: {
        bookingId: docRef.id,
        serviceId: body.serviceId,
        status: initialStatus,
        priceCents: bookingData.priceCents,
        currency: service?.currency,
        billingProvider: service?.billingProvider,
      },
    }));

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

    // Emit payment.intent_created if payment is required
    if ((service?.billingProvider === 'whop' || service?.billingProvider === 'stripe') && paymentUrl) {
      await emitEvent(buildEvent({
        name: 'payment.intent_created',
        tenantId,
        userId,
        moduleIds,
        payload: {
          bookingId: docRef.id,
          serviceId: body.serviceId,
          billingProvider: service.billingProvider,
          paymentUrl,
        },
      }));
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
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to create booking');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { userId, tenantId } = authResult;
    const body = await request.json();
    const { bookingId, status, scheduledAt } = body;

    if (!bookingId) {
      return errorResponse('BAD_REQUEST', 400, 'bookingId is required');
    }

    // Fetch existing booking
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return errorResponse('NOT_FOUND', 404, 'Booking not found');
    }

    const booking = bookingDoc.data() as Booking;

    // Ensure user owns this booking
    if (booking.userId !== userId || booking.tenantId !== tenantId) {
      return errorResponse('FORBIDDEN', 403, 'Not authorized to modify this booking');
    }

    const updates: Partial<Booking> = {
      updatedAt: Timestamp.now(),
    };

    // Handle status change (e.g., cancel)
    if (status) {
      const oldStatus = booking.status;
      updates.status = status.toLowerCase() as BookingStatus;
      
      // Update status history
      const statusEvent: BookingStatusEvent = {
        status: updates.status,
        changedAt: new Date().toISOString(),
        changedByUserId: userId,
      };
      updates.statusHistory = [...(booking.statusHistory || []), statusEvent];

      // Emit booking.status_updated event
      await emitEvent(buildEvent({
        name: 'booking.status_updated',
        tenantId,
        userId,
        payload: {
          bookingId,
          oldStatus,
          newStatus: updates.status,
        },
      }));
    }

    // Handle reschedule
    if (scheduledAt) {
      updates.scheduledAt = Timestamp.fromDate(new Date(scheduledAt));
    }

    await updateDoc(bookingRef, updates);

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    logError('api/client/bookings PATCH', error, {
      url: request.url,
      method: 'PATCH',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to update booking');
  }
}
