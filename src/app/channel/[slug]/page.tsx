import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChipBar, Pager } from "@/components/filters";
import { Shelf } from "@/components/shelf";
import { VideoCard, VideoGrid } from "@/components/video-card";
import { browse } from "@/lib/engine";
import { browsePage } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function channelName(slug: string) {
  return getEngine().cards.find((card) => card.channelSlug === slug)?.channel;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = channelName((await params).slug);
  return { title: name ?? "Not found" };
}

export default async function ChannelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const name = channelName(slug);
  if (!name) notFound();
  const engine = getEngine();
  const search = await searchParams;
  const tab = search.tab === "videos" ? "videos" : "home";
  const all = browse(engine, { channel: slug, news: "show", cited: "show", offset: 0, limit: 12 });
  const recent = browse(engine, { channel: slug, news: "show", cited: "show", sort: "recent", offset: 0, limit: 12 });
  const comments = engine.cards.filter((card) => card.channelSlug === slug).reduce((sum, card) => sum + card.mentions, 0);
  const base = `/channel/${slug}`;
  const tabs = [
    { href: base, label: "Home", on: tab === "home" },
    { href: `${base}?tab=videos`, label: "Videos", on: tab === "videos" },
  ];
  return (
    <div className="mx-auto max-w-[1284px]">
      <header className="flex flex-col gap-4 pt-2 min-[640px]:flex-row min-[640px]:items-end">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] font-bold leading-9 tracking-[-0.4px] min-[801px]:text-4xl min-[801px]:leading-[44px]">{name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-muted">
            <span className="text-foreground">@{slug}</span>
            <span>{all.total} videos</span>
            <span>{comments} HN comments</span>
          </p>
        </div>
        <a
          className="inline-flex h-9 w-fit items-center rounded-full bg-chip-on px-4 text-sm font-medium text-chip-on-text hover:opacity-90"
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`}
          target="_blank"
          rel="noreferrer"
        >
          Find on YouTube
        </a>
      </header>
      <nav aria-label="Channel" className="no-scrollbar mt-4 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.on ? "page" : undefined}
            className={`h-12 shrink-0 border-b-2 pt-3 text-base font-medium ${item.on ? "border-foreground" : "border-transparent text-muted hover:border-muted hover:text-foreground"}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      {tab === "home" ? <ChannelHome base={base} all={all.items} recent={recent.items} /> : <ChannelVideos slug={slug} base={base} search={search} />}
    </div>
  );
}

function ChannelHome({ base, all, recent }: { base: string; all: ReturnType<typeof browse>["items"]; recent: ReturnType<typeof browse>["items"] }) {
  const shelves = [
    { title: "Most recommended", items: all },
    { title: "Recently shared", items: recent },
  ];
  return (
    <div className="mt-2">
      {shelves.map((shelf) =>
        shelf.items.length > 1 ? (
          <Shelf key={shelf.title} title={shelf.title} href={`${base}?tab=videos`}>
            {shelf.items.map((item) => (
              <li key={item.vid} className="w-[260px] shrink-0 snap-start p-2 min-[801px]:w-[300px]">
                <VideoCard item={item} />
              </li>
            ))}
          </Shelf>
        ) : null,
      )}
      {all.length <= 1 ? (
        <div className="mt-6">
          <VideoGrid items={all} />
        </div>
      ) : null}
    </div>
  );
}

function ChannelVideos({ slug, base, search }: { slug: string; base: string; search: Record<string, string | string[] | undefined> }) {
  const { record, page } = browsePage({ ...search, channel: slug, news: "show", cited: "show" });
  const sort = record.sort ?? "hn";
  const chips = [
    { href: `${base}?tab=videos`, label: "Most recommended", on: sort === "hn" },
    { href: `${base}?tab=videos&sort=recent`, label: "Recently shared", on: sort === "recent" },
    { href: `${base}?tab=videos&sort=title`, label: "A to Z", on: sort === "title" },
  ];
  return (
    <div className="mt-4">
      <ChipBar label="Sort" chips={chips} />
      <VideoGrid items={page.items} />
      <Pager path={base} query={{ ...record, tab: "videos" }} offset={page.offset} total={page.total} />
    </div>
  );
}
