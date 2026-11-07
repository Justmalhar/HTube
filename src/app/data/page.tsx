import { PageHeader } from "@/components/page-header";
import { getManifest } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

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
    <div>
      <PageHeader title="Data" description="Licensed catalogue, in 16 shards" />
      <p className="max-w-3xl text-sm">
        Official export generated 2026-10-31. Live check on 7 Nov 2026, 5:56 am IST. Credit HackerTube and open-index/hacker-news. YouTube durations, views, likes, and publish dates are not in these files.
      </p>
      <ul className="mt-4 divide-y divide-line rounded-xl bg-surface">
        {files.map(([href, name]) => (
          <li key={href}>
            <a className="flex items-center justify-between px-3 py-2" href={href}>
              <span>{name}</span>
              <span className="text-sm text-muted">Download</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
