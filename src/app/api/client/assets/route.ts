// src/app/api/client/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { AssetFile } from '@/lib/types';

const mockAssets: AssetFile[] = [
  {
    id: 'asset-1',
    bookingId: 'booking-1',
    serviceName: 'Professional Mixing',
    fileName: 'vocal-stems.zip',
    fileType: 'REFERENCE',
    sizeBytes: 45678900,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'asset-2',
    bookingId: 'booking-1',
    serviceName: 'Professional Mixing',
    fileName: 'reference-track.mp3',
    fileType: 'REFERENCE',
    sizeBytes: 8765432,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'asset-3',
    bookingId: 'booking-2',
    serviceName: 'Mastering Session',
    fileName: 'track-01-mixdown.wav',
    fileType: 'ROUGH_MIX',
    sizeBytes: 56789012,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'asset-4',
    bookingId: 'booking-2',
    serviceName: 'Mastering Session',
    fileName: 'track-02-mixdown.wav',
    fileType: 'ROUGH_MIX',
    sizeBytes: 54321098,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'asset-5',
    bookingId: 'booking-4',
    serviceName: 'Beat Production',
    fileName: 'final-beat-master.wav',
    fileType: 'MASTER',
    sizeBytes: 62345678,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
  {
    id: 'asset-6',
    bookingId: 'booking-4',
    serviceName: 'Beat Production',
    fileName: 'beat-stems.zip',
    fileType: 'STEMS',
    sizeBytes: 145678901,
    downloadUrl: '#',
    uploadedAt: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const bookingId = searchParams.get('bookingId');
  const serviceId = searchParams.get('serviceId');

  let filtered = mockAssets;

  if (type) {
    filtered = filtered.filter((a) => a.fileType === type);
  }

  if (bookingId) {
    filtered = filtered.filter((a) => a.bookingId === bookingId);
  }

  return NextResponse.json(filtered);
}
