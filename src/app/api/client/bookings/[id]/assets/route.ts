// src/app/api/client/bookings/[id]/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock upload - in production this would handle FormData
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const fileType = formData.get('fileType') as string;

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  // Mock response
  return NextResponse.json({
    id: `asset-${Date.now()}`,
    bookingId: params.id,
    fileName: file.name,
    fileType: fileType || 'OTHER',
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  });
}
