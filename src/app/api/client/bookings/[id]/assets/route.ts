// src/app/api/client/bookings/[id]/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/log';
import { buildEvent, emitEvent } from '@/lib/events';
import { requireAuth } from '@/lib/api/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get auth context for event emission
    const authResult = await requireAuth(request);
    const { userId, tenantId } = authResult instanceof Response 
      ? { userId: undefined, tenantId: undefined } 
      : authResult;

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

    const assetId = `asset-${Date.now()}`;

    // Mock response
    const response = {
      id: assetId,
      bookingId: id,
      fileName: file.name,
      fileType: fileType || 'OTHER',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    };

    // Emit asset.uploaded event (best-effort, don't block on module lookup)
    await emitEvent(buildEvent({
      name: 'asset.uploaded',
      tenantId,
      userId,
      payload: {
        bookingId: id,
        assetId,
        type: fileType || 'OTHER',
        size: file.size,
        filename: file.name,
      },
    }));

    return NextResponse.json(response);
  } catch (error) {
    logError('api/client/bookings/[id]/assets POST', error, {
      url: request.url,
      method: 'POST',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
