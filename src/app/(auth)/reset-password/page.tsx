// src/app/(auth)/reset-password/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { sendReset } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendReset(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="space-y-3 text-sm text-zinc-200">
          <p>Check your inbox.</p>
          <p>
            If an account exists for <span className="font-mono">{email}</span>{" "}
            you&apos;ll receive a password reset link.
          </p>
          <div className="pt-4">
            <a
              href="/login"
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              ← Back to login
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#FF4500] to-[#FFD700] text-black font-semibold py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <div className="pt-2">
            <a
              href="/login"
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              ← Back to login
            </a>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
