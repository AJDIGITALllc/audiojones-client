// src/app/(protected)/dashboard/page.tsx
"use client";

import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Audio Jones Client Portal</h1>
        <p className="text-sm text-gray-300">
          You are viewing the protected dashboard from{" "}
          <code>src/app/(protected)/dashboard/page.tsx</code>
        </p>
        <button
          onClick={handleSignOut}
          className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[#FF4500] to-[#FFD700] text-black font-semibold text-sm hover:opacity-90"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
