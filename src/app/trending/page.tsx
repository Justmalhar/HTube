import type { Metadata } from "next";

import { ChipBar } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { TrendingList, type TrendingItem } from "@/components/trending/trending-list";
import { getEngine, getTrending } from "@/lib/server-catalog";
import type { Card } from "@/lib/types";

export const metadata: Metadata = { title: "Trending" };
export const dynamic = "force-dynamic";

const TABS: { id: string; label: string; keep?: (c: Card, area: Set<string>) => boolean }[] = [
  { id: "now", label: "Now" },
  { id: "talks", label: "Talks", keep: (c) => c.contentType === "talk" },
  { id: "lectures", label: "Lectures", keep: (c) => c.contentType === "lecture" || c.contentType === "course" },
  { id: "documentaries", label: "Documentaries", keep: (c) => c.contentType === "documentary" },
  { id: "programming", label: "Programming", keep: (c, area) => c.categories.some((id) => area.has(id)) },
];

export default async function Trending({ searchParams }: PageProps<"/trending">) {
  const raw = (await searchParams).tab;
  const tab = TABS.find((t) => t.id === raw) ?? TABS[0];
  const { byId, areas } = getEngine();
  const software = new Set(areas.find((a) => a.id === "software")?.categories.map((c) => c.id));
  const items: TrendingItem[] = [];
  for (const t of getTrending()) {
    const card = byId.get(t.vid);
    if (!card || (tab.keep && !tab.keep(card, software))) continue;
    items.push({ card, lastYear: t.lastYear });
    if (items.length === 50) break;
  }
  return (
    <div>
      <PageHeader title="Trending" />
      <ChipBar
        label="Trending"
        chips={TABS.map((t) => ({ href: t.id === "now" ? "/trending" : `/trending?tab=${t.id}`, label: t.label, on: t === tab }))}
      />
      <TrendingList items={items} />
    </div>
  );
}
