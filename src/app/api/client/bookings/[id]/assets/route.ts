// src/app/api/client/bookings/[id]/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
    bookingId: id,
    fileName: file.name,
    fileType: fileType || 'OTHER',
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  });
}
