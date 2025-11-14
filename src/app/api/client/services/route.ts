// src/app/api/client/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ServiceSummary } from '@/lib/types';

const mockServices: ServiceSummary[] = [
  {
    id: 'svc-mixing',
    tenantId: 'tenant-audiojones',
    name: 'Professional Mixing',
    description: 'Get your tracks mixed by industry professionals. Includes unlimited revisions and stems delivery.',
    category: 'PRODUCTION',
    iconEmoji: '🎚️',
    durationLabel: '2-3 days',
    modeLabel: 'Remote',
    badgeLabel: 'Popular',
    priceLabel: 'From $500',
  },
  {
    id: 'svc-mastering',
    tenantId: 'tenant-audiojones',
    name: 'Mastering Session',
    description: 'Professional mastering to make your tracks radio-ready. Includes streaming optimization.',
    category: 'PRODUCTION',
    iconEmoji: '✨',
    durationLabel: '1-2 days',
    modeLabel: 'Remote',
    priceLabel: 'From $300',
  },
  {
    id: 'svc-consultation',
    tenantId: 'tenant-audiojones',
    name: 'Strategy Consultation',
    description: '1-on-1 strategy session for artists looking to level up their career and brand.',
    category: 'CONSULTING',
    iconEmoji: '💡',
    durationLabel: '60 min',
    modeLabel: 'Video Call',
    badgeLabel: 'New',
    priceLabel: '$200',
  },
  {
    id: 'svc-production',
    tenantId: 'tenant-audiojones',
    name: 'Beat Production',
    description: 'Custom beat production tailored to your sound. Includes trackouts and unlimited revisions.',
    category: 'ARTIST',
    iconEmoji: '🎵',
    durationLabel: '3-5 days',
    modeLabel: 'Remote',
    priceLabel: 'From $800',
  },
  {
    id: 'svc-recording',
    tenantId: 'tenant-audiojones',
    name: 'Studio Recording',
    description: 'Professional studio recording session with engineer. Perfect for vocals and instruments.',
    category: 'ARTIST',
    iconEmoji: '🎤',
    durationLabel: '2-4 hours',
    modeLabel: 'In-Person',
    priceLabel: '$150/hr',
  },
  {
    id: 'svc-smb-audio',
    tenantId: 'tenant-audiojones',
    name: 'Podcast Production',
    description: 'Complete podcast production including editing, mixing, and publishing support.',
    category: 'SMB',
    iconEmoji: '🎙️',
    durationLabel: '1-2 weeks',
    modeLabel: 'Remote',
    priceLabel: 'Custom Quote',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');

  let filtered = mockServices;

  if (category) {
    filtered = mockServices.filter((s) => s.category === category);
  }

  return NextResponse.json(filtered);
}
