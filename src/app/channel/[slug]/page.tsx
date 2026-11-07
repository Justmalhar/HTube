import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelAbout } from "@/components/channel/channel-about";
import { ChannelActions, ChannelHeader } from "@/components/channel/channel-header";
import { ChipBar, Pager } from "@/components/filters";
import { Shelf } from "@/components/shelf";
import { ChipRow } from "@/components/topic/chip-row";
import { VideoCard, VideoGrid } from "@/components/video-card";
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
      <ChannelActions slug={slug} name={name} />
      <nav aria-label="Channel" className="no-scrollbar mt-4 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.on ? "page" : undefined}
            className={`press h-12 shrink-0 border-b-2 pt-3 text-base font-medium ${item.on ? "border-foreground" : "border-transparent text-muted hover:border-muted hover:text-foreground"}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
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
        <div className="mt-6">
          <VideoGrid items={shelves[0].items} />
        </div>
      ) : (
        shelves.map((shelf) => (
          <Shelf key={shelf.title} title={shelf.title} href={shelf.href}>
            {shelf.items.map((item) => (
              <li key={item.vid} className="w-[260px] min-w-0 shrink-0 snap-start p-2 min-[801px]:w-[300px]">
                <VideoCard item={item} />
              </li>
            ))}
          </Shelf>
        ))
      )}
      {topics.length ? (
        <section className="mt-8 border-t border-line pt-6">
          <h2 className="mb-4 text-xl font-bold tracking-[-0.2px]">Topics</h2>
          <ChipRow label="Topics" items={topics} />
        </section>
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
      <VideoGrid items={page.items} />
      <Pager path={base} query={{ ...record, tab: "videos" }} offset={page.offset} total={page.total} />
    </div>
  );
}
