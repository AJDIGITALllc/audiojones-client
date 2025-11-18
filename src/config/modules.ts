// Central module configuration - single source of truth for all module definitions
import type { ServiceModule } from "@/lib/types";

export type ModuleId = ServiceModule;

export interface PreflightItem {
  id: string;
  label: string;
  required: boolean;
}

export interface ModuleGuideContent {
  whatThisModuleDoes: string[];
  youllNeedToProvide: string[];
  kpisWeTrack: string[];
}

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  icon: string;
  color: "blue" | "purple" | "green" | "orange";
  shortDescription: string;
  workflowSteps: string[];
  tools: string[];
  kpis: string[];
  guide: ModuleGuideContent;
  preflightChecklist: PreflightItem[];
  pdfUrl?: string;
}

export const MODULES: Record<ModuleId, ModuleConfig> = {
  "client-delivery": {
    id: "client-delivery",
    name: "Client Delivery",
    icon: "",
    color: "blue",
    shortDescription: "Professional audio production services with direct client communication and project management",
    workflowSteps: [
      "Initial consultation and requirements gathering",
      "Project setup and timeline definition",
      "Audio file delivery and review cycles",
      "Revision implementation and approval",
      "Final delivery and asset archival"
    ],
    tools: [
      "Firebase Storage for file management",
      "Real-time project tracking dashboard",
      "Automated revision request system",
      "Version control for deliverables",
      "Client communication portal"
    ],
    kpis: [
      "Session completion rate",
      "On-time delivery percentage",
      "Client satisfaction (CSAT) scores",
      "Average revision rounds per project",
      "Turnaround time metrics"
    ],
    guide: {
      whatThisModuleDoes: [
        "Professional audio production services (mixing, mastering, production)",
        "Direct client communication and project management",
        "High-quality deliverables with revision cycles",
        "Asset storage and version control",
        "Timeline coordination and milestone tracking"
      ],
      youllNeedToProvide: [
        "Your latest audio files (stems, rough mixes, or reference tracks)",
        "Brand assets (logos, colors) if applicable",
        "Clear creative direction and reference materials",
        "Access to any cloud storage for large file transfers",
        "Contact info for key stakeholders"
      ],
      kpisWeTrack: [
        "Session completion rate and on-time delivery",
        "Client satisfaction scores (CSAT)",
        "Revision rounds per project",
        "Average turnaround time",
        "Asset upload/download activity"
      ]
    },
    preflightChecklist: [
      { id: "audio-files", label: "Upload your latest audio files or stems", required: true },
      { id: "brand-assets", label: "Provide brand assets (logos, colors) if applicable", required: false },
      { id: "reference-tracks", label: "Share reference tracks or creative direction", required: true },
      { id: "cloud-access", label: "Confirm access to cloud storage for large files", required: false },
      { id: "timeline", label: "Review and confirm project timeline expectations", required: true }
    ]
  },
  "marketing-automation": {
    id: "marketing-automation",
    name: "Marketing Automation",
    icon: "",
    color: "purple",
    shortDescription: "Automated email campaigns, social media scheduling, and lead generation workflows",
    workflowSteps: [
      "Platform integration and audience sync",
      "Campaign strategy development",
      "Content creation and automation setup",
      "Testing and optimization cycles",
      "Performance monitoring and reporting"
    ],
    tools: [
      "MailerLite integration for email automation",
      "Social media scheduling platforms",
      "CRM synchronization tools",
      "Analytics and tracking dashboards",
      "A/B testing framework"
    ],
    kpis: [
      "Email open and click-through rates",
      "Social engagement metrics",
      "Lead conversion rates",
      "Audience growth rate",
      "Campaign ROI and cost per acquisition"
    ],
    guide: {
      whatThisModuleDoes: [
        "Automated email campaigns and audience nurturing",
        "Social media scheduling and content distribution",
        "Lead generation and funnel optimization",
        "CRM integration and contact management",
        "Analytics and campaign performance tracking"
      ],
      youllNeedToProvide: [
        "Access to your email marketing platform (MailerLite, Mailchimp, etc.)",
        "Social media account credentials or admin access",
        "Existing audience lists or CSV exports",
        "Brand guidelines and approved messaging",
        "Goals and KPIs for each campaign"
      ],
      kpisWeTrack: [
        "Email open and click-through rates",
        "Social engagement (likes, shares, comments)",
        "Lead conversion rates",
        "Audience growth rate",
        "Campaign ROI and cost per acquisition"
      ]
    },
    preflightChecklist: [
      { id: "platform-access", label: "Grant access to email marketing platform (MailerLite, etc.)", required: true },
      { id: "social-credentials", label: "Provide social media account credentials or admin access", required: true },
      { id: "audience-lists", label: "Export and share existing audience lists or contacts", required: false },
      { id: "brand-guidelines", label: "Share brand guidelines and approved messaging", required: true },
      { id: "campaign-goals", label: "Define clear goals and KPIs for campaigns", required: true }
    ]
  },
  "ai-optimization": {
    id: "ai-optimization",
    name: "AI Optimization",
    icon: "",
    color: "green",
    shortDescription: "AI-powered content generation, workflow automation, and intelligent performance optimization",
    workflowSteps: [
      "Current process audit and opportunity identification",
      "AI model selection and training data preparation",
      "Implementation and integration testing",
      "Performance monitoring and model tuning",
      "Continuous optimization and scaling"
    ],
    tools: [
      "GPT-4 and Claude for content generation",
      "Custom automation workflows via N8N",
      "Predictive analytics models",
      "A/B testing framework for AI outputs",
      "Performance monitoring dashboards"
    ],
    kpis: [
      "Time saved through automation",
      "Content performance improvement",
      "AI vs manual effectiveness comparison",
      "Error reduction in automated processes",
      "ROI of AI implementations"
    ],
    guide: {
      whatThisModuleDoes: [
        "AI-powered content generation and optimization",
        "Automated workflow improvements using machine learning",
        "Predictive analytics for better decision-making",
        "Intelligent automation of repetitive tasks",
        "Performance optimization through AI insights"
      ],
      youllNeedToProvide: [
        "Access to your existing content repositories",
        "Historical performance data (analytics exports)",
        "API keys for platforms you want to integrate",
        "Clear objectives for what you want to optimize",
        "Sample content or templates for AI training"
      ],
      kpisWeTrack: [
        "Time saved through automation",
        "Content performance improvement percentages",
        "AI-generated vs. manual content effectiveness",
        "Error reduction in automated processes",
        "ROI of AI implementations"
      ]
    },
    preflightChecklist: [
      { id: "content-repo", label: "Grant access to existing content repositories", required: true },
      { id: "analytics-data", label: "Export historical performance data (3-6 months)", required: true },
      { id: "api-keys", label: "Provide API keys for platform integrations", required: false },
      { id: "objectives", label: "Document clear optimization objectives", required: true },
      { id: "sample-content", label: "Share sample content or templates for AI training", required: false }
    ]
  },
  "data-intelligence": {
    id: "data-intelligence",
    name: "Data Intelligence",
    icon: "",
    color: "orange",
    shortDescription: "Comprehensive analytics, cross-platform data integration, and actionable business insights",
    workflowSteps: [
      "Data source identification and access setup",
      "Data integration and normalization",
      "Dashboard and report creation",
      "Insight generation and recommendation delivery",
      "Ongoing monitoring and optimization"
    ],
    tools: [
      "Google Analytics integration",
      "Custom data warehouse connections",
      "Real-time dashboard builders",
      "Predictive modeling frameworks",
      "Automated reporting systems"
    ],
    kpis: [
      "Data accuracy and completeness",
      "Report generation speed",
      "Dashboard usage and engagement",
      "Insights converted to actions",
      "Business impact of data-driven decisions"
    ],
    guide: {
      whatThisModuleDoes: [
        "Comprehensive analytics and reporting dashboards",
        "Cross-platform data integration and unification",
        "Actionable insights from your business metrics",
        "Predictive modeling and trend analysis",
        "Custom KPI tracking and goal monitoring"
      ],
      youllNeedToProvide: [
        "Access to all analytics platforms (Google Analytics, social insights, etc.)",
        "Historical data exports (at least 3-6 months)",
        "List of KPIs and metrics you care about",
        "Business goals and benchmarks",
        "Admin access to databases or data warehouses if applicable"
      ],
      kpisWeTrack: [
        "Data accuracy and completeness",
        "Report generation time",
        "Dashboard usage and engagement",
        "Insights converted to action items",
        "Business impact of data-driven decisions"
      ]
    },
    preflightChecklist: [
      { id: "analytics-access", label: "Grant access to all analytics platforms", required: true },
      { id: "historical-data", label: "Export historical data (at least 3-6 months)", required: true },
      { id: "kpi-list", label: "Provide list of KPIs and metrics to track", required: true },
      { id: "business-goals", label: "Share business goals and benchmarks", required: true },
      { id: "database-access", label: "Grant admin access to databases if applicable", required: false }
    ]
  }
};

// Helper functions
export function getModuleById(id: ModuleId): ModuleConfig {
  return MODULES[id];
}

export function findModuleBySlugOrId(value: string): ModuleConfig | undefined {
  // Try direct match first
  if (value in MODULES) {
    return MODULES[value as ModuleId];
  }
  
  // Try case-insensitive match
  const normalized = value.toLowerCase();
  const moduleEntry = Object.entries(MODULES).find(
    ([key, config]) => 
      key.toLowerCase() === normalized || 
      config.name.toLowerCase() === normalized ||
      config.id.toLowerCase() === normalized
  );
  
  return moduleEntry?.[1];
}

export function isValidModuleId(value: string): value is ModuleId {
  return value in MODULES;
}

// Export as array for iteration
export const modules = Object.values(MODULES);
