import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChipBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Shelf, countChipClass, videos } from "@/components/shelf";
import { headerActionClass } from "@/components/ui";
import { VideoCard, VideoGrid } from "@/components/video-card";
import { browse } from "@/lib/engine";
import { browsePage } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

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
    <div>
      <PageHeader
        title={name}
        actions={
          <a className={headerActionClass} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">
            Find on YouTube
          </a>
        }
      />
      <ul aria-label="Channel stats" className="flex flex-wrap gap-2">
        <li className={`${countChipClass} max-w-full`}><span className="truncate">@{slug}</span></li>
        <li className={countChipClass}>{videos(all.total)}</li>
        <li className={countChipClass}>{comments.toLocaleString("en-US")} HN comments</li>
      </ul>
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
              <li key={item.vid} className="w-[260px] min-w-0 shrink-0 snap-start p-2 min-[801px]:w-[300px]">
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
