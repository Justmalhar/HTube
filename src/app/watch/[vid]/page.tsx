import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HnComments } from "@/components/hn-comments";
import { RelatedRow } from "@/components/video-card";
import { chipClass, chipOnClass } from "@/components/ui";
import { ActionBar, Player } from "@/components/watch-actions";
import { categoryName } from "@/lib/engine";
import { getEngine, getMentions } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ vid: string }> }): Promise<Metadata> {
  const { vid } = await params;
  const card = getEngine().byId.get(vid);
  if (!card) return { title: "Not found" };
  return { title: card.title, description: card.whyHn || card.summary };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ vid: string }>;
  searchParams: Promise<{ rel?: string }>;
}) {
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
  return (
    <div className="mx-auto flex max-w-[1754px] flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        <Player vid={vid} title={card.title} />
        <h1 className="mt-3 text-xl font-bold leading-7">{card.title}</h1>
        <div className="mt-3 flex flex-col gap-3 min-[1000px]:flex-row min-[1000px]:items-center">
          <a href={`/channel/${card.channelSlug}`} className="mr-auto min-w-0 truncate text-base font-medium hover:text-muted">
            {card.channel}
          </a>
          <ActionBar vid={vid} title={card.title} />
        </div>
        <div className="mt-4 rounded-xl bg-surface p-3 text-sm leading-5">
          <p className="font-medium">
            Shared on Hacker News from {card.firstYear}
            {card.lastYear > card.firstYear ? ` to ${card.lastYear}` : ""}
          </p>
          <p className="mt-2">{card.summary}</p>
          {card.whyHn ? <p className="mt-3">{card.whyHn}</p> : null}
          {card.quote ? <p className="mt-3 italic text-muted">&ldquo;{card.quote}&rdquo;</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {card.categories.map((id) => (
              <a key={id} href={`/c/${id}`} className="inline-flex h-8 items-center rounded-lg bg-background px-3 font-medium hover:bg-surface-hover">
                {categoryName(engine, id)}
              </a>
            ))}
          </div>
        </div>
        <HnComments mentions={mentions} />
      </div>
      <aside className="flex w-full shrink-0 flex-col gap-2 xl:w-[402px]">
        <h2 className="sr-only">Related</h2>
        <nav aria-label="Related videos" className="no-scrollbar mb-2 flex gap-3 overflow-x-auto">
          <a href={`/watch/${vid}`} aria-current={fromChannel ? undefined : "page"} className={fromChannel ? chipClass : chipOnClass}>All</a>
          <a href={`/watch/${vid}?rel=channel`} aria-current={fromChannel ? "page" : undefined} className={fromChannel ? chipOnClass : chipClass}>
            From {card.channel}
          </a>
        </nav>
        {!related.length ? <p className="rounded-xl bg-surface p-4 text-sm text-muted">Nothing else here yet</p> : null}
        {related.map((item) => (
          <RelatedRow key={item.vid} item={item} />
        ))}
      </aside>
    </div>
  );
}
