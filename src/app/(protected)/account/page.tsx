"use client";

import { useTenant } from "@/contexts/TenantContext";

export default function AccountPage() {
  const { user, tenantId } = useTenant();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account preferences and information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-background-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.displayName || ""}
                  disabled
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tenant ID
                </label>
                <input
                  type="text"
                  defaultValue={tenantId || ""}
                  disabled
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-50 font-mono text-sm"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Contact support to update your profile information.
            </p>
          </div>

          {/* Placeholder sections */}
          <div className="bg-background-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
            <p className="text-gray-400">Email notification preferences coming soon.</p>
          </div>

          <div className="bg-background-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Billing</h2>
            <p className="text-gray-400 mb-4">
              Manage your subscription and payment methods through Whop.
            </p>
            <a
              href="https://whop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Go to Whop Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
