// src/app/(protected)/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
