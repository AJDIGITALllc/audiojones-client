// src/lib/api/client.ts
import type { BookingSummary, BookingDetail, AssetFile, DashboardStats } from '@/lib/types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.audiojones.com';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Client API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return api<DashboardStats>('/client/dashboard');
}

export async function listBookings(params?: {
  status?: string;
  from?: string;
  to?: string;
  q?: string;
}): Promise<BookingSummary[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  if (params?.q) search.set('q', params.q);

  const qs = search.toString();
  return api<BookingSummary[]>(`/client/bookings${qs ? `?${qs}` : ''}`);
}

export async function getBookingDetail(id: string): Promise<BookingDetail> {
  return api<BookingDetail>(`/client/bookings/${id}`);
}

export async function listAssets(params?: {
  serviceId?: string;
  bookingId?: string;
  type?: string;
}): Promise<AssetFile[]> {
  const search = new URLSearchParams();
  if (params?.serviceId) search.set('serviceId', params.serviceId);
  if (params?.bookingId) search.set('bookingId', params.bookingId);
  if (params?.type) search.set('type', params.type);
  const qs = search.toString();
  return api<AssetFile[]>(`/client/assets${qs ? `?${qs}` : ''}`);
}

export async function createBooking(payload: {
  serviceId: string;
  variantId: string;
  startAt: string;
  intake: Record<string, unknown>;
}): Promise<{ bookingId: string }> {
  return api<{ bookingId: string }>('/client/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadBookingAsset(bookingId: string, formData: FormData) {
  const res = await fetch(`${BASE}/client/bookings/${bookingId}/assets`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload asset');
  return res.json();
}

export async function listServices(params?: { category?: string }): Promise<import('@/lib/types').ServiceSummary[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set('category', params.category);
  const qs = search.toString();
  return api<import('@/lib/types').ServiceSummary[]>(`/client/services${qs ? `?${qs}` : ''}`);
}
