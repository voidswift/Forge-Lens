"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SyncPoller({ isSyncing }: { isSyncing: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!isSyncing) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000); // poll every 3s

    return () => clearInterval(interval);
  }, [isSyncing, router]);

  return null;
}
