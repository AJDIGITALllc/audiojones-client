// src/components/auth/AuthLayout.tsx
"use client";

import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl border border-neutral-800 bg-gradient-to-b from-zinc-900 to-black shadow-xl">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2">
            Audio Jones
          </div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
