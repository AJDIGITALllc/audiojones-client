// src/app/api/client/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Service } from '@/lib/types/firestore';
import type { ServiceSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');

    // Query services collection
    let q = query(
      collection(db, 'services'),
      where('active', '==', true)
    );

    // Filter by category if specified
    if (category && category !== 'all') {
      q = query(
        collection(db, 'services'),
        where('active', '==', true),
        where('category', '==', category)
      );
    }

    const snap = await getDocs(q);

    // Transform Firestore docs to ServiceSummary format
    const services: ServiceSummary[] = snap.docs.map((doc) => {
      const data = doc.data() as Service;
      return {
        id: doc.id,
        tenantId: data.tenantId || 'global',
        name: data.name,
        description: data.description,
        category: data.category.toUpperCase() as any,
        iconEmoji: '🎵', // Default, can be enhanced later
        durationLabel: data.duration ? `${data.duration} min` : 'Custom',
        modeLabel: 'Remote',
        priceLabel: data.basePrice ? `From $${(data.basePrice / 100).toFixed(0)}` : 'Custom Quote',
      };
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
