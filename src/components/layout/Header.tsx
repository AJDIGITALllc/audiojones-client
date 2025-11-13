"use client";

import { Bell, User } from "lucide-react";
import { cn } from "@/lib/cn";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full",
            "text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange" />
        </button>
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-brand-teal text-white transition-colors hover:bg-brand-teal/90"
          )}
          aria-label="User account"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

