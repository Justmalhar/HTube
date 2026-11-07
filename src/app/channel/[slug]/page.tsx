import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelAbout } from "@/components/channel/channel-about";
import { ChannelHeader } from "@/components/channel/channel-header";
import { ChipBar, Pager } from "@/components/filters";
import { Section } from "@/components/section";
import { CardShelf } from "@/components/shelf";
import { UnderlineTabs } from "@/components/tabs";
import { ChipRow } from "@/components/topic/chip-row";
import { compactGridClass, sectionGapClass } from "@/components/ui";
import { VideoGrid } from "@/components/video-card";
import { channelDescription, channelStats, curators, similarChannels } from "@/lib/channels";
import { browse } from "@/lib/engine";
import { browsePage } from "@/lib/pages";
import { getEngine, getMentions } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

function channelName(slug: string) {
  return getEngine().cards.find((card) => card.channelSlug === slug)?.channel;
}

export async function generateMetadata({ params }: PageProps<"/channel/[slug]">): Promise<Metadata> {
  const name = channelName((await params).slug);
  return { title: name ?? "Not found" };
}

export default async function ChannelPage({ params, searchParams }: PageProps<"/channel/[slug]">) {
  const { slug } = await params;
  const name = channelName(slug);
  if (!name) notFound();
  const engine = getEngine();
  const search = await searchParams;
  const tab = search.tab === "videos" || search.tab === "about" ? search.tab : "home";
  const stats = channelStats(engine, slug);
  const base = `/channel/${slug}`;
  const tabs = [
    { href: base, label: "Home", on: tab === "home" },
    { href: `${base}?tab=videos`, label: "Videos", on: tab === "videos" },
    { href: `${base}?tab=about`, label: "About", on: tab === "about" },
  ];
  const description = channelDescription(stats);
  return (
    <div>
      <ChannelHeader slug={slug} name={name} videos={stats.videos} comments={stats.comments} description={description} />
      <UnderlineTabs label="Channel" tabs={tabs} />
      {tab === "home" ? <ChannelHome slug={slug} base={base} topics={stats.topics} /> : null}
      {tab === "videos" ? <ChannelVideos slug={slug} base={base} search={search} /> : null}
      {tab === "about" ? (
        <ChannelAbout
          first={stats.firstYear}
          last={stats.lastYear}
          topics={stats.topics}
          curators={curators(engine, getMentions, slug)}
          similar={similarChannels(engine, slug)}
        />
      ) : null}
    </div>
  );
}

function ChannelHome({ slug, base, topics }: { slug: string; base: string; topics: { id: string; name: string }[] }) {
  const engine = getEngine();
  const q = { channel: slug, news: "show", cited: "show", offset: 0, limit: 12 } as const;
  const shelves = [
    { title: "Popular on HN", items: browse(engine, q).items, href: `${base}?tab=videos&sort=hn` },
    { title: "Recently shared", items: browse(engine, { ...q, sort: "recent" }).items, href: `${base}?tab=videos` },
  ];
  const single = shelves[0].items.length <= 1;
  return (
    <div className="mt-2">
      {single ? (
        <div className={sectionGapClass}>
          <VideoGrid items={shelves[0].items} className={compactGridClass} />
        </div>
      ) : (
        shelves.map((shelf) => <CardShelf key={shelf.title} title={shelf.title} href={shelf.href} items={shelf.items} />)
      )}
      {topics.length ? (
        <Section title="Topics">
          <ChipRow label="Topics" items={topics} />
        </Section>
      ) : null}
    </div>
  );
}

function ChannelVideos({ slug, base, search }: { slug: string; base: string; search: Record<string, string | string[] | undefined> }) {
  const { record, page } = browsePage({ ...search, sort: search.sort || "recent", channel: slug, news: "show", cited: "show" });
  const sort = record.sort ?? "recent";
  const chips = [
    { href: `${base}?tab=videos`, label: "Latest", on: sort === "recent" },
    { href: `${base}?tab=videos&sort=hn`, label: "Popular", on: sort === "hn" },
    { href: `${base}?tab=videos&sort=oldest`, label: "Oldest", on: sort === "oldest" },
  ];
  return (
    <div className="mt-4">
      <ChipBar label="Sort" chips={chips} />
      <VideoGrid items={page.items} className={compactGridClass} />
      <Pager path={base} query={{ ...record, tab: "videos" }} offset={page.offset} total={page.total} />
    </div>
  );
}
