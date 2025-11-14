// src/lib/types.ts

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'DECLINED'
  | 'CANCELED'
  | 'COMPLETED';

export interface BookingSummary {
  id: string;
  tenantId: string;
  serviceId: string;
  serviceName: string;
  variantName?: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  status: BookingStatus;
  source: 'CLIENT_PORTAL' | 'WHOP' | 'CHAT' | 'ADMIN' | 'OTHER';
  scheduledDate?: string;
  totalCost?: number;
  createdAt: string; // ISO
}

export interface BookingDetail extends BookingSummary {
  price?: number;
  durationMinutes: number;
  notes?: string;
  clientNotes?: string;
  intakeAnswers: Array<{ question: string; answer: string }>;
  assets: AssetFile[];
  attachments?: Array<{ name: string; url: string }>;
  updatedAt?: string; // ISO
  timeline: Array<{
    id: string;
    label: string;
    at: string; // ISO
    type: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED' | 'ASSET_UPLOADED' | 'OTHER';
  }>;
}

export type AssetFileType = 'REFERENCE' | 'ROUGH_MIX' | 'FINAL_MIX' | 'MASTER' | 'STEMS' | 'OTHER';

export interface AssetFile {
  id: string;
  bookingId: string;
  serviceName: string;
  fileName: string;
  fileType: AssetFileType;
  sizeBytes: number;
  downloadUrl: string;
  uploadedAt: string; // ISO
}

export interface DashboardStats {
  upcomingSessions: number;
  upcomingDelta: number;
  pendingApprovals: number;
  pendingDelta: number;
  completedSessions: number;
  completedDeltaPct: number;
  openMessages: number;
  openMessagesDelta: number;
  totalBookings: number;
  activeBookings: number;
  totalAssets: number;
  totalHoursBooked: number;
  upcomingBookings: BookingSummary[];
}

export interface ServiceSummary {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: 'ARTIST' | 'CONSULTING' | 'STRATEGY' | 'PRODUCTION' | 'SMB' | 'OTHER';
  iconEmoji?: string;
  durationLabel?: string;
  modeLabel?: string;
  badgeLabel?: string;
  priceLabel: string;
}
