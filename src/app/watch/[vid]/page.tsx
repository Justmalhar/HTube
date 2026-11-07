import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Comments } from "@/components/comments";
import { EmptyState, RelatedRow } from "@/components/video-card";
import { chipClass, chipOnClass } from "@/components/ui";
import { SubscribeButton } from "@/components/subscribe-button";
import { PlaylistPanel } from "@/components/playlist-panel";
import { AutoplayToggle } from "@/components/up-next";
import { ActionBar, Description, Player } from "@/components/watch-actions";
import { categoryName } from "@/lib/engine";
import { getEngine, getMentions } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/watch/[vid]">): Promise<Metadata> {
  const { vid } = await params;
  const card = getEngine().byId.get(vid);
  if (!card) return { title: "Not found" };
  return { title: card.title, description: card.whyHn || card.summary || undefined };
}

export default async function WatchPage({ params, searchParams }: PageProps<"/watch/[vid]">) {
  const { vid } = await params;
  const query = await searchParams;
  const fromChannel = query.rel === "channel";
  const listSlug = typeof query.list === "string" ? query.list : "";
  const engine = getEngine();
  const card = engine.byId.get(vid);
  if (!card) notFound();
  const mentions = getMentions(vid);
  // Server-side origin so the iframe (enablejsapi needs it) is in the initial HTML.
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || `${proto}://${host}`;
  const related = fromChannel
    ? engine.cards.filter((item) => item.channelSlug === card.channelSlug && item.vid !== vid).slice(0, 20)
    : (engine.related.get(vid) ?? [])
        .map((edge) => engine.byId.get(edge.vid))
        .filter((item) => item != null)
        .slice(0, 20);
  // Playlist mode needs a known list that contains this vid; anything else falls back to normal mode.
  const playlist = listSlug ? engine.playlists.find((item) => item.slug === listSlug) : undefined;
  const items = (playlist?.items ?? []).flatMap((item) => {
    const entry = engine.byId.get(item.vid);
    return entry ? [{ vid: entry.vid, title: entry.title, channel: entry.channel }] : [];
  });
  const index = items.findIndex((item) => item.vid === vid);
  const inPlaylist = playlist != null && index >= 0;
  const upNext = inPlaylist ? items[index + 1] : related[0];
  const next = upNext ? { href: `/watch/${upNext.vid}${inPlaylist ? `?list=${listSlug}` : ""}`, title: upNext.title } : undefined;
  const meta = card.lastYear > card.firstYear ? `Recommended on HN ${card.firstYear} to ${card.lastYear}` : `Recommended on HN in ${card.firstYear}`;
  return (
    <div className="mx-auto flex max-w-[1754px] min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        <Player key={vid} vid={vid} title={card.title} origin={origin} next={next} />
        <h1 className="mt-3 line-clamp-2 text-xl font-bold leading-7 text-balance wrap-anywhere">{card.title}</h1>
        <div className="mt-3 flex min-w-0 flex-col gap-3 min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:justify-between">
          <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <a href={`/channel/${card.channelSlug}`} className="block truncate text-base font-medium leading-[22px] hover:text-muted">
              {card.channel}
            </a>
            <p className="truncate text-xs text-muted tabular-nums">
              {card.mentions.toLocaleString("en-US")} HN {card.mentions === 1 ? "comment" : "comments"}
            </p>
          </div>
          <SubscribeButton slug={card.channelSlug} name={card.channel} />
          </div>
          <ActionBar vid={vid} title={card.title} />
        </div>
        <Description
          meta={meta}
          chips={
            card.categories.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.categories.map((id) => (
                  <a key={id} href={`/c/${id}`} className="press inline-flex h-8 max-w-full items-center rounded-lg bg-background px-3 font-medium hover:bg-surface-hover">
                    <span className="truncate">{categoryName(engine, id)}</span>
                  </a>
                ))}
              </div>
            ) : null
          }
        >
          {card.summary ? <p>{card.summary}</p> : null}
          {card.whyHn ? <p>{card.whyHn}</p> : null}
          {card.quote ? <p className="italic text-muted">&ldquo;{card.quote}&rdquo;</p> : null}
        </Description>
        <Comments mentions={mentions} />
      </div>
      <aside className="flex w-full min-w-0 shrink-0 flex-col gap-2 xl:w-[402px]">
        {inPlaylist && playlist ? <PlaylistPanel key={listSlug} slug={listSlug} title={playlist.title} items={items} index={index} /> : null}
        <h2 className="sr-only">Related</h2>
        <div className="flex">
          <AutoplayToggle />
        </div>
        <nav aria-label="Related videos" className="no-scrollbar mb-1 flex gap-3 overflow-x-auto bg-background py-1 xl:sticky xl:top-14 xl:z-(--z-raised)">
          <a href={`/watch/${vid}${inPlaylist ? `?list=${listSlug}` : ""}`} aria-current={fromChannel ? undefined : "page"} className={fromChannel ? chipClass : chipOnClass}>All</a>
          <a href={`/watch/${vid}?rel=channel${inPlaylist ? `&list=${listSlug}` : ""}`} aria-current={fromChannel ? "page" : undefined} className={`${fromChannel ? chipOnClass : chipClass} max-w-[280px]`}>
            <span className="truncate">From {card.channel}</span>
          </a>
        </nav>
        {!related.length ? (
          <EmptyState
            title={fromChannel ? "No other videos from this channel" : "No related videos"}
            body="Find more in this topic"
            href={card.categories[0] ? `/c/${card.categories[0]}` : "/browse"}
            action={card.categories[0] ? `More in ${categoryName(engine, card.categories[0])}` : "Browse talks"}
          />
        ) : null}
        {related.map((item) => (
          <RelatedRow key={item.vid} item={item} />
        ))}
      </aside>
    </div>
  );
}
