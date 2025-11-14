// src/app/api/client/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { BookingDetail } from '@/lib/types';

// Mock data (same as in route.ts for consistency)
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
  { params }: { params: { id: string } }
) {
  const booking = mockBookings.find((b) => b.id === params.id);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(booking);
}
