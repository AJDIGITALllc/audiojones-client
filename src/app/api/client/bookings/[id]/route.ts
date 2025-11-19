// src/app/api/client/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { requireAuth, errorResponse, enforceTenantAccess } from '@/lib/api/middleware';
import type { Booking, Asset, Service } from '@/lib/types/firestore';
import type { BookingDetail } from '@/lib/types';
import { logError } from '@/lib/log';

// REPLACED WITH FIRESTORE - Old mock data removed
const mockBookings: BookingDetail[] = [
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
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    price: 500,
    durationMinutes: 120,
    notes: 'Looking for a professional mix on my latest single. I have stems ready.',
    intakeAnswers: [
      { question: 'What genre is your music?', answer: 'Hip-Hop / R&B' },
      { question: 'How many tracks?', answer: '8 stems' },
    ],
    assets: [],
    attachments: [
      { name: 'reference-track.mp3', url: '#' },
      { name: 'project-notes.pdf', url: '#' },
    ],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        at: new Date(Date.now() - 86400000 * 3).toISOString(),
        type: 'CREATED',
      },
      {
        id: 'timeline-2',
        label: 'Approved by Admin',
        at: new Date(Date.now() - 86400000 * 2).toISOString(),
        type: 'APPROVED',
      },
    ],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;
    const { id } = await params;

    const bookingDoc = await getDoc(doc(db, 'bookings', id));

    if (!bookingDoc.exists()) {
      return errorResponse('NOT_FOUND', 404, 'Booking not found');
    }

    const bookingData = bookingDoc.data() as Booking;

    if (!enforceTenantAccess(authResult, bookingData.tenantId)) {
      return errorResponse('FORBIDDEN', 403, 'Access denied');
    }

    if (authResult.role !== 'admin' && bookingData.userId !== userId) {
      return errorResponse('FORBIDDEN', 403, 'Access denied');
    }

    let serviceName = 'Unknown Service';
    try {
      const serviceDoc = await getDoc(doc(db, 'services', bookingData.serviceId));
      if (serviceDoc.exists()) {
        serviceName = (serviceDoc.data() as Service).name;
      }
    } catch (err) {
      console.error('Failed to fetch service:', err);
    }

    const assetsSnap = await getDocs(
      query(collection(db, 'assets'), where('bookingId', '==', id))
    );

    const assets: any[] = assetsSnap.docs.map(assetDoc => {
      const data = assetDoc.data() as Asset;
      return {
        id: assetDoc.id,
        bookingId: data.bookingId,
        serviceName,
        fileName: data.fileName,
        fileType: data.fileType.toUpperCase(),
        sizeBytes: data.size,
        downloadUrl: data.storageUrl || '#',
        uploadedAt: data.createdAt.toDate().toISOString(),
      };
    });

    const timeline: any[] = [
      {
        id: 'timeline-created',
        label: 'Booking Created',
        at: bookingData.createdAt.toDate().toISOString(),
        type: 'CREATED',
      },
    ];

    if (bookingData.status !== 'draft' && bookingData.status !== 'pending') {
      timeline.push({
        id: 'timeline-approved',
        label: 'Approved',
        at: bookingData.updatedAt.toDate().toISOString(),
        type: 'APPROVED',
      });
    }

    const detail: BookingDetail = {
      id: bookingDoc.id,
      tenantId: bookingData.tenantId,
      serviceId: bookingData.serviceId,
      serviceName,
      status: bookingData.status.toUpperCase() as any,
      source: 'CLIENT_PORTAL',
      startAt: bookingData.startTime?.toDate().toISOString() || bookingData.scheduledAt?.toDate().toISOString() || '',
      endAt: bookingData.endTime?.toDate().toISOString() || bookingData.scheduledAt?.toDate().toISOString() || '',
      scheduledDate: bookingData.scheduledAt?.toDate().toISOString().split('T')[0] || '',
      totalCost: bookingData.priceCents ? bookingData.priceCents / 100 : 0,
      createdAt: bookingData.createdAt.toDate().toISOString(),
      price: bookingData.priceCents ? bookingData.priceCents / 100 : 0,
      durationMinutes: bookingData.startTime && bookingData.endTime 
        ? (bookingData.endTime.toMillis() - bookingData.startTime.toMillis()) / (1000 * 60)
        : 0,
      notes: bookingData.notes,
      intakeAnswers: [],
      assets,
      timeline,
    };

    return NextResponse.json(detail);
  } catch (error) {
    logError('api/client/bookings/[id] GET', error, {
      url: request.url,
      method: 'GET',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch booking details');
  }
}
