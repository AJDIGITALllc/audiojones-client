import type { ServiceModule } from "@/lib/types";

export interface PreflightItem {
  id: string;
  label: string;
  required: boolean;
}

export const MODULE_PREFLIGHT: Record<ServiceModule, PreflightItem[]> = {
  "client-delivery": [
    { id: "audio-files", label: "Upload your latest audio files or stems", required: true },
    { id: "brand-assets", label: "Provide brand assets (logos, colors) if applicable", required: false },
    { id: "reference-tracks", label: "Share reference tracks or creative direction", required: true },
    { id: "cloud-access", label: "Confirm access to cloud storage for large files", required: false },
    { id: "timeline", label: "Review and confirm project timeline expectations", required: true },
  ],
  "marketing-automation": [
    { id: "platform-access", label: "Grant access to email marketing platform (MailerLite, etc.)", required: true },
    { id: "social-credentials", label: "Provide social media account credentials or admin access", required: true },
    { id: "audience-lists", label: "Export and share existing audience lists or contacts", required: false },
    { id: "brand-guidelines", label: "Share brand guidelines and approved messaging", required: true },
    { id: "campaign-goals", label: "Define clear goals and KPIs for campaigns", required: true },
  ],
  "ai-optimization": [
    { id: "content-repo", label: "Grant access to existing content repositories", required: true },
    { id: "analytics-data", label: "Export historical performance data (3-6 months)", required: true },
    { id: "api-keys", label: "Provide API keys for platform integrations", required: false },
    { id: "objectives", label: "Document clear optimization objectives", required: true },
    { id: "sample-content", label: "Share sample content or templates for AI training", required: false },
  ],
  "data-intelligence": [
    { id: "analytics-access", label: "Grant access to all analytics platforms", required: true },
    { id: "historical-data", label: "Export historical data (at least 3-6 months)", required: true },
    { id: "kpi-list", label: "Provide list of KPIs and metrics to track", required: true },
    { id: "business-goals", label: "Share business goals and benchmarks", required: true },
    { id: "database-access", label: "Grant admin access to databases if applicable", required: false },
  ],
};
