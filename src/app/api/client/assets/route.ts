// src/app/api/client/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { requireClientAuth, errorResponse } from '@/lib/api/middleware';
import type { Asset, Service, ServiceCategory } from '@/lib/types/firestore';
import type { AssetFile } from '@/lib/types';
import { logError } from '@/lib/log';

// Map service categories to asset categories for grouping
function getAssetCategory(serviceCategory: ServiceCategory): string {
  const categoryMap: Record<ServiceCategory, string> = {
    artist: 'artist-services',
    podcast: 'podcast-production',
    consulting: 'personal-brand',
    other: 'other',
  };
  return categoryMap[serviceCategory] || 'other';
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClientAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;
    const { searchParams } = request.nextUrl;
    const bookingId = searchParams.get('bookingId');
    const fileType = searchParams.get('type');
    const category = searchParams.get('category');

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

    // Transform to AssetFile format with category
    const assets: (AssetFile & { category?: string })[] = await Promise.all(
      assetDocs.map(async (assetDoc) => {
        const data = assetDoc.data() as Asset;
        
        // Get service name and category from booking if available
        let serviceName = 'Unknown Service';
        let assetCategory = 'other';
        try {
          const bookingDoc = await getDoc(doc(db, 'bookings', data.bookingId));
          if (bookingDoc.exists()) {
            const bookingData = bookingDoc.data();
            const serviceDoc = await getDoc(doc(db, 'services', bookingData.serviceId));
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data() as Service;
              serviceName = serviceData.name;
              assetCategory = getAssetCategory(serviceData.category);
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
          category: assetCategory,
        };
      })
    );
    
    // Filter by category if specified
    let filteredAssets = assets;
    if (category && category !== 'all') {
      filteredAssets = assets.filter(asset => asset.category === category);
    }

    return NextResponse.json(filteredAssets);
  } catch (error) {
    logError('api/client/assets GET', error, {
      url: request.url,
      method: 'GET',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch assets');
  }
}
