"use client";

import type { ServiceModule } from "@/lib/types";

interface ModuleContent {
  name: string;
  icon: string;
  color: string;
  whatItDoes: string[];
  youllNeed: string[];
  weTrack: string[];
}

const MODULE_CONTENT: Record<ServiceModule, ModuleContent> = {
  "client-delivery": {
    name: "Client Delivery",
    icon: "🎵",
    color: "blue",
    whatItDoes: [
      "Professional audio production services (mixing, mastering, production)",
      "Direct client communication and project management",
      "High-quality deliverables with revision cycles",
      "Asset storage and version control",
      "Timeline coordination and milestone tracking",
    ],
    youllNeed: [
      "Your latest audio files (stems, rough mixes, or reference tracks)",
      "Brand assets (logos, colors) if applicable",
      "Clear creative direction and reference materials",
      "Access to any cloud storage for large file transfers",
      "Contact info for key stakeholders",
    ],
    weTrack: [
      "Session completion rate and on-time delivery",
      "Client satisfaction scores (CSAT)",
      "Revision rounds per project",
      "Average turnaround time",
      "Asset upload/download activity",
    ],
  },
  "marketing-automation": {
    name: "Marketing Automation",
    icon: "📢",
    color: "purple",
    whatItDoes: [
      "Automated email campaigns and audience nurturing",
      "Social media scheduling and content distribution",
      "Lead generation and funnel optimization",
      "CRM integration and contact management",
      "Analytics and campaign performance tracking",
    ],
    youllNeed: [
      "Access to your email marketing platform (MailerLite, Mailchimp, etc.)",
      "Social media account credentials or admin access",
      "Existing audience lists or CSV exports",
      "Brand guidelines and approved messaging",
      "Goals and KPIs for each campaign",
    ],
    weTrack: [
      "Email open and click-through rates",
      "Social engagement (likes, shares, comments)",
      "Lead conversion rates",
      "Audience growth rate",
      "Campaign ROI and cost per acquisition",
    ],
  },
  "ai-optimization": {
    name: "AI Optimization",
    icon: "🤖",
    color: "green",
    whatItDoes: [
      "AI-powered content generation and optimization",
      "Automated workflow improvements using machine learning",
      "Predictive analytics for better decision-making",
      "Intelligent automation of repetitive tasks",
      "Performance optimization through AI insights",
    ],
    youllNeed: [
      "Access to your existing content repositories",
      "Historical performance data (analytics exports)",
      "API keys for platforms you want to integrate",
      "Clear objectives for what you want to optimize",
      "Sample content or templates for AI training",
    ],
    weTrack: [
      "Time saved through automation",
      "Content performance improvement percentages",
      "AI-generated vs. manual content effectiveness",
      "Error reduction in automated processes",
      "ROI of AI implementations",
    ],
  },
  "data-intelligence": {
    name: "Data Intelligence",
    icon: "📊",
    color: "orange",
    whatItDoes: [
      "Comprehensive analytics and reporting dashboards",
      "Cross-platform data integration and unification",
      "Actionable insights from your business metrics",
      "Predictive modeling and trend analysis",
      "Custom KPI tracking and goal monitoring",
    ],
    youllNeed: [
      "Access to all analytics platforms (Google Analytics, social insights, etc.)",
      "Historical data exports (at least 3-6 months)",
      "List of KPIs and metrics you care about",
      "Business goals and benchmarks",
      "Admin access to databases or data warehouses if applicable",
    ],
    weTrack: [
      "Data accuracy and completeness",
      "Report generation time",
      "Dashboard usage and engagement",
      "Insights converted to action items",
      "Business impact of data-driven decisions",
    ],
  },
};

interface ModuleGuideProps {
  module: ServiceModule;
  onClose: () => void;
}

export default function ModuleGuide({ module, onClose }: ModuleGuideProps) {
  const content = MODULE_CONTENT[module];

  const colorClasses = {
    blue: "border-blue-500/50 bg-blue-500/10",
    purple: "border-purple-500/50 bg-purple-500/10",
    green: "border-green-500/50 bg-green-500/10",
    orange: "border-orange-500/50 bg-orange-500/10",
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`p-6 border-b border-gray-800 ${colorClasses[content.color as keyof typeof colorClasses]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${iconColorClasses[content.color as keyof typeof iconColorClasses]}`}>
                  {content.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{content.name}</h2>
                  <p className="text-sm text-gray-400">Module Guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* What this module does */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-primary">✨</span>
                What this module does for you
              </h3>
              <ul className="space-y-2">
                {content.whatItDoes.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* You'll need */}
            <section className="bg-background rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-accent">📋</span>
                You'll need to provide
              </h3>
              <ul className="space-y-2">
                {content.youllNeed.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-accent mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* We track */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-support">📈</span>
                We track these KPIs
              </h3>
              <ul className="space-y-2">
                {content.weTrack.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-support mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
