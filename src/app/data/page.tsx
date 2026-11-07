import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { getManifest } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Data" };

export default function DataPage() {
  const manifest = getManifest();
  const files = [
    ["/api/sync/manifest", "manifest.json"],
    ["/api/sync/index", "index.json"],
    ["/api/sync/taxonomy", "taxonomy.json"],
    ["/api/sync/playlists", "playlists.json"],
    ...manifest.shards.map((shard) => [`/api/sync/shard/${shard.id}`, `shards/${shard.id}.json`]),
  ];
  return (
    <div className="max-w-3xl">
      <PageHeader title="Data" />
      <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
        {files.map(([href, name]) => (
          <li key={href}>
            <a className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:bg-surface-hover" href={href} download={name.split("/").pop()}>
              <span className="min-w-0 truncate font-mono text-sm">{name}</span>
              <span className="shrink-0 text-sm text-muted">Download</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
