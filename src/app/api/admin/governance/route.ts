import { NextRequest, NextResponse } from "next/server";
import { MODULES } from "@/config/modules";
import crypto from "crypto";

interface GovernanceReport {
  timestamp: string;
  checks: {
    moduleContentIntegrity: {
      passed: boolean;
      checksums: Record<string, string>;
      issues: string[];
    };
    preflightSchemaMatch: {
      passed: boolean;
      modules: Record<string, { itemCount: number; requiredCount: number }>;
      issues: string[];
    };
    typeConsistency: {
      passed: boolean;
      issues: string[];
    };
  };
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    errors: number;
  };
}

function validateAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  // TODO: Verify admin token/session
  return !!authHeader;
}

function computeModuleChecksum(moduleId: string): string {
  const module = MODULES[moduleId as keyof typeof MODULES];
  if (!module) return "";
  
  const content = JSON.stringify({
    name: module.name,
    guide: module.guide,
    preflightChecklist: module.preflightChecklist,
  });
  
  return crypto.createHash("sha256").update(content).digest("hex").substring(0, 12);
}

function validateModuleContent(): GovernanceReport["checks"]["moduleContentIntegrity"] {
  const issues: string[] = [];
  const checksums: Record<string, string> = {};

  for (const moduleId of Object.keys(MODULES)) {
    const module = MODULES[moduleId as keyof typeof MODULES];
    
    // Compute checksum
    checksums[moduleId] = computeModuleChecksum(moduleId);

    // Validate guide sections
    if (!module.guide.whatThisModuleDoes || module.guide.whatThisModuleDoes.length < 3) {
      issues.push(`Module ${moduleId}: guide.whatThisModuleDoes has fewer than 3 items`);
    }

    if (!module.guide.youllNeedToProvide || module.guide.youllNeedToProvide.length < 3) {
      issues.push(`Module ${moduleId}: guide.youllNeedToProvide has fewer than 3 items`);
    }

    if (!module.guide.kpisWeTrack || module.guide.kpisWeTrack.length < 3) {
      issues.push(`Module ${moduleId}: guide.kpisWeTrack has fewer than 3 items`);
    }

    // Validate preflight checklist
    if (!module.preflightChecklist || module.preflightChecklist.length < 3) {
      issues.push(`Module ${moduleId}: preflightChecklist has fewer than 3 items`);
    }
  }

  return {
    passed: issues.length === 0,
    checksums,
    issues,
  };
}

function validatePreflightSchema(): GovernanceReport["checks"]["preflightSchemaMatch"] {
  const issues: string[] = [];
  const modules: Record<string, { itemCount: number; requiredCount: number }> = {};

  for (const moduleId of Object.keys(MODULES)) {
    const module = MODULES[moduleId as keyof typeof MODULES];
    const checklist = module.preflightChecklist || [];
    
    const itemCount = checklist.length;
    const requiredCount = checklist.filter(item => item.required).length;

    modules[moduleId] = { itemCount, requiredCount };

    // Validate structure
    if (itemCount < 3 || itemCount > 7) {
      issues.push(`Module ${moduleId}: preflight checklist should have 3-7 items (found ${itemCount})`);
    }

    if (requiredCount === 0) {
      issues.push(`Module ${moduleId}: preflight checklist has no required items`);
    }

    // Validate each item
    for (const item of checklist) {
      if (!item.id || !item.label) {
        issues.push(`Module ${moduleId}: preflight item missing id or label`);
      }

      if (typeof item.required !== "boolean") {
        issues.push(`Module ${moduleId}: preflight item "${item.id}" missing required boolean`);
      }
    }
  }

  return {
    passed: issues.length === 0,
    modules,
    issues,
  };
}

function validateTypeConsistency(): GovernanceReport["checks"]["typeConsistency"] {
  const issues: string[] = [];

  // Check that all module IDs are valid
  const validModuleIds = ["client-delivery", "marketing-automation", "ai-optimization", "data-intelligence"];
  const actualModuleIds = Object.keys(MODULES);

  for (const moduleId of actualModuleIds) {
    if (!validModuleIds.includes(moduleId)) {
      issues.push(`Invalid module ID found in MODULES: ${moduleId}`);
    }
  }

  for (const moduleId of validModuleIds) {
    if (!actualModuleIds.includes(moduleId)) {
      issues.push(`Expected module ID missing from MODULES: ${moduleId}`);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

export async function GET(request: NextRequest) {
  if (!validateAdminRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const moduleContentIntegrity = validateModuleContent();
    const preflightSchemaMatch = validatePreflightSchema();
    const typeConsistency = validateTypeConsistency();

    const allIssues = [
      ...moduleContentIntegrity.issues,
      ...preflightSchemaMatch.issues,
      ...typeConsistency.issues,
    ];

    const report: GovernanceReport = {
      timestamp: new Date().toISOString(),
      checks: {
        moduleContentIntegrity,
        preflightSchemaMatch,
        typeConsistency,
      },
      summary: {
        totalChecks: 3,
        passed: [moduleContentIntegrity, preflightSchemaMatch, typeConsistency].filter(c => c.passed).length,
        warnings: 0,
        errors: allIssues.length,
      },
    };

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run governance checks" },
      { status: 500 }
    );
  }
}
