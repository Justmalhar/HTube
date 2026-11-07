"use client";

import { useEffect } from "react";

import { startCatalogSync } from "@/lib/client-catalog";

// Syncs the catalogue to IndexedDB in the background. Renders nothing.
export function CatalogSync() {
  useEffect(() => {
    // Idle so the 16-shard download never competes with first paint; 1.5s timer for Safari (no rIC).
    const idle = typeof requestIdleCallback === "function";
    const id = idle ? requestIdleCallback(startCatalogSync, { timeout: 3000 }) : setTimeout(startCatalogSync, 1500);
    return () => (idle ? cancelIdleCallback(id as number) : clearTimeout(id));
  }, []);
  return null;
}
