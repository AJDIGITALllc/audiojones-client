// src/app/api/client/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth, errorResponse } from '@/lib/api/middleware';
import { logError } from '@/lib/log';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClientAuth(request);
    if (authResult instanceof Response) return authResult;
    
    // For now, return stub data
    // In production, this would query a 'notifications' collection in Firestore
    const notifications: Notification[] = [
      {
        id: 'notif-1',
        title: 'Booking Confirmed',
        body: 'Your booking for "Artist Consultation" has been confirmed.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        title: 'Payment Received',
        body: 'We received your payment for the Marketing Strategy session.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ];

    return NextResponse.json(notifications);
  } catch (error) {
    logError('api/client/notifications GET', error, {
      url: request.url,
      method: 'GET',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch notifications');
  }
}
