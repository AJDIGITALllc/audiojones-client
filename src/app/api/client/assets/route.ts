// src/app/api/client/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { requireAuth, errorResponse } from '@/lib/api/middleware';
import type { Asset, Service } from '@/lib/types/firestore';
import type { AssetFile } from '@/lib/types';
import { logError } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;
    const { searchParams } = request.nextUrl;
    const bookingId = searchParams.get('bookingId');
    const fileType = searchParams.get('type');

    // Query assets for the user's tenant and user
    let q = query(
      collection(db, 'assets'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (bookingId) {
      q = query(
        collection(db, 'assets'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId),
        where('bookingId', '==', bookingId),
        orderBy('createdAt', 'desc')
      );
    }

    const snap = await getDocs(q);

    // Filter by file type if specified (client-side since Firestore compound queries are limited)
    let assetDocs = snap.docs;
    if (fileType && fileType !== 'all') {
      assetDocs = assetDocs.filter(doc => {
        const data = doc.data() as Asset;
        return data.fileType === fileType.toLowerCase();
      });
    }

    // Transform to AssetFile format
    const assets: AssetFile[] = await Promise.all(
      assetDocs.map(async (assetDoc) => {
        const data = assetDoc.data() as Asset;
        
        // Get service name from booking if available
        let serviceName = 'Unknown Service';
        try {
          const bookingDoc = await getDoc(doc(db, 'bookings', data.bookingId));
          if (bookingDoc.exists()) {
            const bookingData = bookingDoc.data();
            const serviceDoc = await getDoc(doc(db, 'services', bookingData.serviceId));
            if (serviceDoc.exists()) {
              serviceName = (serviceDoc.data() as Service).name;
            }
          }
        } catch (err) {
          console.error('Failed to fetch service name:', err);
        }

        return {
          id: assetDoc.id,
          bookingId: data.bookingId,
          serviceName,
          fileName: data.fileName,
          fileType: data.fileType.toUpperCase() as any,
          sizeBytes: data.size,
          downloadUrl: data.storageUrl || '#',
          uploadedAt: data.createdAt.toDate().toISOString(),
        };
      })
    );

    return NextResponse.json(assets);
  } catch (error) {
    logError('api/client/assets GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
