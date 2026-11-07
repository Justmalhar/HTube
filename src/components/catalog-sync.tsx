"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getSyncStatus, startCatalogSync, subscribeCatalog } from "@/lib/client-catalog";

export function CatalogSync() {
  const status = useSyncExternalStore(subscribeCatalog, getSyncStatus, getSyncStatus);
  useEffect(() => {
    startCatalogSync();
  }, []);
  return (
    <p className="text-sm text-muted" role="status">
      {status.detail}
      {status.phase === "shards" ? ` (${status.shardsDone} of ${status.shardCount})` : ""}
    </p>
  );
}
