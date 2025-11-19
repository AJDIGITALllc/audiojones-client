"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "My System", href: "/system/modules", icon: "🔧" },
  { name: "Book Session", href: "/book", icon: "📅" },
  { name: "Projects", href: "/projects", icon: "📁" },
  { name: "My Bookings", href: "/bookings", icon: "📋" },
  { name: "My Assets", href: "/assets", icon: "🎵" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-brand-black text-brand-white">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold">Audio Jones</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-orange text-brand-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

