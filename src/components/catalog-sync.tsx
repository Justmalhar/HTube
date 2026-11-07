"use client";

import { useEffect } from "react";

import { startCatalogSync } from "@/lib/client-catalog";

// Syncs the catalogue to IndexedDB in the background. Renders nothing.
export function CatalogSync() {
  useEffect(() => {
    startCatalogSync();
  }, []);
  return null;
}
