import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { countChipClass, videos } from "@/components/shelf";
import { chipClass } from "@/components/ui";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Categories" };

// Same labels and targets as the home chip row.
const SHORTCUTS = [
  ["/browse", "All"],
  ["/browse?sort=recent", "Recently shared"],
  ["/browse?dur=xlong", "Longs"],
  ["/browse?gems=insistent", "Hidden gems"],
] as const;

export default function Categories() {
  const areas = getEngine().areas;
  return (
    <div>
      <PageHeader
        title="Categories"
      />
      <nav aria-label="Shortcuts" className="no-scrollbar -mx-4 mb-8 flex gap-3 overflow-x-auto px-4 min-[801px]:mx-0 min-[801px]:px-0">
        {SHORTCUTS.map(([href, label]) => (
          <a key={href} className={chipClass} href={href}>{label}</a>
        ))}
      </nav>
      <div className="grid grid-cols-1 gap-8 min-[1180px]:grid-cols-2">
        {areas.map((area) => (
          <section key={area.id} aria-labelledby={`area-${area.id}`} className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
              <h2 id={`area-${area.id}`} className="min-w-0 text-xl font-bold">
                <a href={`/a/${area.id}`} className="block truncate rounded-md hover:underline">{area.name}</a>
              </h2>
              <span className={`${countChipClass} ml-auto`}>{videos(area.video_count)}</span>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
              {area.categories.map((category) => (
                <li key={category.id}>
                  <a href={`/c/${category.id}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:bg-surface-hover">
                    <span className="min-w-0 wrap-anywhere">{category.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">{category.video_count.toLocaleString("en-US")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
