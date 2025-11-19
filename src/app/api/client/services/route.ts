// src/app/api/client/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Service } from '@/lib/types/firestore';
import type { ServiceSummary } from '@/lib/types';
import { logError } from '@/lib/log';
import { requireClientAuth, errorResponse } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClientAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId } = authResult;
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');

    // Query services collection - filter by active only, then filter tenant and category client-side
    const q = query(
      collection(db, 'services'),
      where('active', '==', true)
    );

    let snap = await getDocs(q);
    
    // Filter by tenant (tenant-specific or global services)
    let docs = snap.docs.filter(doc => {
      const data = doc.data() as Service;
      return data.tenantId === tenantId || data.tenantId === null;
    });
    
    // Filter by category if specified
    if (category && category !== 'all') {
      docs = docs.filter(doc => {
        const data = doc.data() as Service;
        return data.category === category;
      });
    }
    
    snap = { ...snap, docs } as any;

    // Transform Firestore docs to ServiceSummary format
    const services: ServiceSummary[] = snap.docs.map((doc) => {
      const data = doc.data() as Service;
      
      // Determine price label based on Whop/Stripe config or fallback
      let priceLabel = 'Custom Quote';
      if (data.priceCents && data.currency) {
        priceLabel = `${(data.priceCents / 100).toFixed(0)} ${data.currency}`;
      } else if (data.basePrice) {
        priceLabel = `From $${(data.basePrice / 100).toFixed(0)}`;
      }
      
      return {
        id: doc.id,
        tenantId: data.tenantId || 'global',
        name: data.name,
        description: data.description,
        category: data.category.toUpperCase() as any,
        module: data.module,
        persona: data.persona,
        iconEmoji: '🎵', // Default, can be enhanced later
        durationLabel: data.duration ? `${data.duration} min` : 'Custom',
        modeLabel: 'Remote',
        priceLabel,
        schedulingProvider: data.schedulingProvider,
        schedulingUrl: data.schedulingUrl,
        defaultDurationMinutes: data.defaultDurationMinutes,
        billingProvider: data.billingProvider,
        whop: data.whop,
        priceCents: data.priceCents ?? undefined,
        currency: data.currency ?? undefined,
      };
    });

    return NextResponse.json(services);
  } catch (error) {
    logError('api/client/services GET', error, {
      url: request.url,
      method: 'GET',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch services');
  }
}
