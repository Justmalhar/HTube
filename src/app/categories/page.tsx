import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import Link from "next/link";

import { countChipClass, listRowClass, sectionTitleClass } from "@/components/ui";
import { videos } from "@/lib/format";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Categories" };

export default function Categories() {
  const areas = getEngine().areas;
  return (
    <div>
      <PageHeader
        title="Categories"
      />
      <div className="grid grid-cols-1 gap-8 min-[1180px]:grid-cols-2">
        {areas.map((area) => (
          <section key={area.id} aria-labelledby={`area-${area.id}`} className="min-w-0">
            <div className="mb-3 flex items-start gap-3">
              <h2 id={`area-${area.id}`} className={`min-w-0 ${sectionTitleClass}`}>
                <Link href={`/a/${area.id}`} prefetch={false} className="block rounded-md wrap-anywhere hover:underline">{area.name}</Link>
              </h2>
              <span className={`${countChipClass} ml-auto`}>{videos(area.video_count)}</span>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
              {area.categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/c/${category.id}`} prefetch={false} className={`${listRowClass} justify-between rounded-none px-4`}>
                    <span className="min-w-0 wrap-anywhere">{category.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">{category.video_count.toLocaleString("en-US")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
