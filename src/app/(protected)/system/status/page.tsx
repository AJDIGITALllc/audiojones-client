"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";

interface HealthStatus {
  status: string;
  timestamp: string;
  env: string;
  project: string;
}

export default function SystemStatusPage() {
  const { user, tenantId } = useTenant();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const currentEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "unknown";

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setHealthLoading(true);
    setHealthError(null);
    
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      } else {
        setHealthError(`API: error ${response.status}`);
      }
    } catch (error) {
      setHealthError(`API: error ${(error as Error).message}`);
    } finally {
      setHealthLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">System Status</h1>
        <p className="text-gray-400 mt-1">Internal system health and diagnostics</p>
      </div>

      {/* Environment Card */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Environment</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Environment:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentEnv === "production" 
                ? "bg-green-500/10 text-green-500" 
                : "bg-yellow-500/10 text-yellow-500"
            }`}>
              {currentEnv}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Firebase Project ID:</span>
            <span className="text-white font-mono text-sm">{firebaseProjectId}</span>
          </div>
        </div>
      </div>

      {/* Current User Card */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Current User</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Email:</span>
            <span className="text-white font-mono text-sm">{user?.email || "Not loaded"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">UID:</span>
            <span className="text-white font-mono text-sm break-all">{user?.uid || "Not loaded"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tenant ID:</span>
            <span className="text-white font-mono text-sm">{tenantId || "Not loaded"}</span>
          </div>
        </div>
      </div>

      {/* Health Check Card */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">API Health</h2>
          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {healthLoading ? "Checking..." : "Refresh"}
          </button>
        </div>

        {healthLoading ? (
          <p className="text-gray-400">Checking API health...</p>
        ) : healthError ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-semibold">❌ {healthError}</span>
            </div>
          </div>
        ) : healthStatus ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-semibold">✅ API: healthy</span>
            </div>
            <div className="bg-gray-800 rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white font-mono">{healthStatus.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white font-mono">{healthStatus.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Environment:</span>
                <span className="text-white font-mono">{healthStatus.env}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Project:</span>
                <span className="text-white font-mono">{healthStatus.project}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
