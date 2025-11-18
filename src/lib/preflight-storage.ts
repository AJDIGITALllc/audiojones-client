// Preflight checklist persistence utilities
import type { ModuleId } from "@/config/modules";

export interface PreflightState {
  checkedItemIds: string[];
  lastUpdated: number;
}

const STORAGE_PREFIX = "aj_preflight_";
const isBrowser = typeof window !== "undefined";

export function loadPreflightState(moduleId: ModuleId): PreflightState | null {
  if (!isBrowser) return null;
  
  try {
    const key = `${STORAGE_PREFIX}${moduleId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      checkedItemIds: Array.isArray(parsed.checkedItemIds) ? parsed.checkedItemIds : [],
      lastUpdated: parsed.lastUpdated || Date.now()
    };
  } catch (error) {
    console.error(`Failed to load preflight state for ${moduleId}:`, error);
    return null;
  }
}

export function savePreflightState(moduleId: ModuleId, checkedItemIds: string[]): void {
  if (!isBrowser) return;
  
  try {
    const key = `${STORAGE_PREFIX}${moduleId}`;
    const state: PreflightState = {
      checkedItemIds,
      lastUpdated: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error(`Failed to save preflight state for ${moduleId}:`, error);
  }
}

export function clearPreflightState(moduleId: ModuleId): void {
  if (!isBrowser) return;
  
  try {
    const key = `${STORAGE_PREFIX}${moduleId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear preflight state for ${moduleId}:`, error);
  }
}
