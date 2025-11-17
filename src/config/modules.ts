// src/config/modules.ts

export type ModuleId = "client_delivery" | "marketing_automation" | "ai_optimization" | "data_intelligence";

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  serviceCategories?: string[]; // Map to service categories
}

export const modules: ModuleConfig[] = [
  {
    id: "client_delivery",
    name: "Client Delivery",
    description: "Manage bookings, track project status, and access deliverables",
    icon: "📦",
    serviceCategories: ["artist", "consulting", "podcast"],
  },
  {
    id: "marketing_automation",
    name: "Marketing Automation",
    description: "Track campaign performance and audience engagement",
    icon: "📊",
    serviceCategories: ["consulting"],
  },
  {
    id: "ai_optimization",
    name: "AI Optimization",
    description: "AI-powered insights and content optimization",
    icon: "🤖",
    serviceCategories: ["consulting", "podcast"],
  },
  {
    id: "data_intelligence",
    name: "Data Intelligence",
    description: "Analytics dashboard and data-driven insights",
    icon: "📈",
    serviceCategories: ["consulting"],
  },
];

export function getModuleForService(serviceCategory: string): ModuleId[] {
  return modules
    .filter(m => m.serviceCategories?.includes(serviceCategory.toLowerCase()))
    .map(m => m.id);
}
