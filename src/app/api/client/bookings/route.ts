// src/app/api/client/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { BookingSummary, BookingDetail } from '@/lib/types';

// In-memory store
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
    price: 500,
    durationMinutes: 120,
    notes: 'Looking for a professional mix on my latest single. I have stems ready.',
    intakeAnswers: [
      { question: 'What genre is your music?', answer: 'Hip-Hop / R&B' },
      { question: 'How many tracks?', answer: '8 stems' },
    ],
    assets: [],
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
  {
    id: 'booking-2',
    tenantId: 'tenant-audiojones',
    serviceId: 'svc-mastering',
    serviceName: 'Mastering Session',
    status: 'IN_PROGRESS',
    source: 'CLIENT_PORTAL',
    startAt: new Date(Date.now() - 86400000).toISOString(),
    endAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    totalCost: 300,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    price: 300,
    durationMinutes: 60,
    notes: 'Final mastering for my EP.',
    intakeAnswers: [
      { question: 'Number of tracks?', answer: '5 tracks' },
      { question: 'Reference tracks?', answer: 'Yes, attached' },
    ],
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        at: new Date(Date.now() - 86400000 * 5).toISOString(),
        type: 'CREATED',
      },
      {
        id: 'timeline-2',
        label: 'Approved',
        at: new Date(Date.now() - 86400000 * 4).toISOString(),
        type: 'APPROVED',
      },
    ],
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
    price: 200,
    durationMinutes: 60,
    notes: 'Want to discuss my artist brand strategy and next release plan.',
    intakeAnswers: [
      { question: 'Current stage?', answer: 'Independent artist, 2 releases' },
    ],
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        at: new Date().toISOString(),
        type: 'CREATED',
      },
    ],
  },
  {
    id: 'booking-4',
    tenantId: 'tenant-audiojones',
    serviceId: 'svc-production',
    serviceName: 'Beat Production',
    status: 'COMPLETED',
    source: 'CLIENT_PORTAL',
    startAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    endAt: new Date(Date.now() - 86400000 * 14 + 10800000).toISOString(),
    scheduledDate: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    totalCost: 800,
    createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    price: 800,
    durationMinutes: 180,
    notes: 'Custom beat production for upcoming single.',
    intakeAnswers: [
      { question: 'Genre/Vibe?', answer: 'Trap with melodic elements' },
      { question: 'BPM range?', answer: '140-150' },
    ],
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        at: new Date(Date.now() - 86400000 * 21).toISOString(),
        type: 'CREATED',
      },
      {
        id: 'timeline-2',
        label: 'Approved',
        at: new Date(Date.now() - 86400000 * 20).toISOString(),
        type: 'APPROVED',
      },
      {
        id: 'timeline-3',
        label: 'Completed',
        at: new Date(Date.now() - 86400000 * 13).toISOString(),
        type: 'COMPLETED',
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');

  let filtered = mockBookings;

  if (status) {
    filtered = mockBookings.filter((b) => b.status === status);
  }

  // Return summary view
  const summaries: BookingSummary[] = filtered.map((b) => ({
    id: b.id,
    tenantId: b.tenantId,
    serviceId: b.serviceId,
    serviceName: b.serviceName,
    variantName: b.variantName,
    startAt: b.startAt,
    endAt: b.endAt,
    status: b.status,
    source: b.source,
    scheduledDate: b.scheduledDate,
    totalCost: b.totalCost,
    createdAt: b.createdAt,
  }));

  return NextResponse.json(summaries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newBooking: BookingDetail = {
    id: `booking-${Date.now()}`,
    tenantId: 'tenant-audiojones',
    serviceId: body.serviceId,
    serviceName: `Service ${body.serviceId}`,
    status: 'DRAFT',
    source: 'CLIENT_PORTAL',
    startAt: body.startAt,
    endAt: new Date(new Date(body.startAt).getTime() + 3600000).toISOString(),
    scheduledDate: body.startAt.split('T')[0],
    createdAt: new Date().toISOString(),
    price: 0,
    durationMinutes: 60,
    notes: body.intake?.notes || '',
    intakeAnswers: [],
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        at: new Date().toISOString(),
        type: 'CREATED',
      },
    ],
  };

  mockBookings.push(newBooking);

  return NextResponse.json({ bookingId: newBooking.id });
}
