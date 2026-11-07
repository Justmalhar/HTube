import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState, RelatedRow } from "@/components/video-card";
import { chipClass, chipOnClass } from "@/components/ui";
import { ActionBar, Description, Player } from "@/components/watch-actions";
import { categoryName } from "@/lib/engine";
import { getEngine, getMentions } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

const STANCE: Record<string, string> = {
  strong_rec: "Strongly recommends",
  rec: "Recommends",
  reference: "Cites",
  joke: "Joke",
  critical: "Critical",
};

export async function generateMetadata({ params }: PageProps<"/watch/[vid]">): Promise<Metadata> {
  const { vid } = await params;
  const card = getEngine().byId.get(vid);
  if (!card) return { title: "Not found" };
  return { title: card.title, description: card.whyHn || card.summary || undefined };
}

export default async function WatchPage({ params, searchParams }: PageProps<"/watch/[vid]">) {
  const { vid } = await params;
  const fromChannel = (await searchParams).rel === "channel";
  const engine = getEngine();
  const card = engine.byId.get(vid);
  if (!card) notFound();
  const mentions = getMentions(vid);
  const related = fromChannel
    ? engine.cards.filter((item) => item.channelSlug === card.channelSlug && item.vid !== vid).slice(0, 20)
    : (engine.related.get(vid) ?? [])
        .map((edge) => engine.byId.get(edge.vid))
        .filter((item) => item != null)
        .slice(0, 20);
  const meta = card.lastYear > card.firstYear ? `Recommended on HN ${card.firstYear} to ${card.lastYear}` : `Recommended on HN in ${card.firstYear}`;
  return (
    <div className="mx-auto flex max-w-[1754px] min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        <Player vid={vid} title={card.title} />
        <h1 className="mt-3 line-clamp-2 text-xl font-bold leading-7 text-balance wrap-anywhere">{card.title}</h1>
        <div className="mt-3 flex min-w-0 flex-col gap-3 min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:justify-between">
          <div className="min-w-0">
            <a href={`/channel/${card.channelSlug}`} className="block truncate text-base font-medium leading-[22px] hover:text-muted">
              {card.channel}
            </a>
            <p className="truncate text-xs text-muted tabular-nums">
              {card.mentions.toLocaleString("en-US")} HN {card.mentions === 1 ? "comment" : "comments"}
            </p>
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
        <section className="mt-6" aria-labelledby="comments-title">
          <h2 id="comments-title" className="text-xl font-bold">
            {mentions.length.toLocaleString("en-US")} Hacker News {mentions.length === 1 ? "comment" : "comments"}
          </h2>
          <ul className="mt-6 flex flex-col gap-6 pb-2">
            {mentions.map((mention) => (
              <li key={mention.hn_comment_id} className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                  <span className="min-w-0 truncate font-medium">@{mention.author}</span>
                  <span className="text-muted">{mention.month}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-5 wrap-anywhere">{mention.text}</p>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex h-7 items-center rounded-full bg-surface px-3 font-medium">{STANCE[mention.stance] ?? mention.stance}</span>
                  <a className="press inline-flex h-7 items-center rounded-full px-3 font-medium hover:bg-surface" href={mention.hn_url} target="_blank" rel="noreferrer">
                    View on HN
                  </a>
                  <span className="min-w-0 max-w-full truncate text-muted">in {mention.story_title}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="flex w-full min-w-0 shrink-0 flex-col gap-2 xl:w-[402px]">
        <h2 className="sr-only">Related</h2>
        <nav aria-label="Related videos" className="no-scrollbar mb-1 flex gap-3 overflow-x-auto bg-background py-1 xl:sticky xl:top-14 xl:z-(--z-raised)">
          <a href={`/watch/${vid}`} aria-current={fromChannel ? undefined : "page"} className={fromChannel ? chipClass : chipOnClass}>All</a>
          <a href={`/watch/${vid}?rel=channel`} aria-current={fromChannel ? "page" : undefined} className={`${fromChannel ? chipOnClass : chipClass} max-w-[280px]`}>
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
