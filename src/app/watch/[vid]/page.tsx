import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VideoCard } from "@/components/video-card";
import { WatchActions } from "@/components/watch-actions";
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

export async function generateMetadata({ params }: { params: Promise<{ vid: string }> }): Promise<Metadata> {
  const { vid } = await params;
  const card = getEngine().byId.get(vid);
  if (!card) return { title: "Not found" };
  return { title: card.title, description: card.whyHn || card.summary };
}

export default async function WatchPage({ params }: { params: Promise<{ vid: string }> }) {
  const { vid } = await params;
  const engine = getEngine();
  const card = engine.byId.get(vid);
  if (!card) notFound();
  const mentions = getMentions(vid);
  const related = (engine.related.get(vid) ?? [])
    .map((edge) => engine.byId.get(edge.vid))
    .filter((item) => item != null)
    .slice(0, 12);
  return (
    <div className="grid gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <WatchActions vid={vid} title={card.title} />
        <h1 className="mt-3 text-base font-medium leading-5">{card.title}</h1>
        <a href={`/channel/${card.channelSlug}`} className="mt-1 block text-sm text-muted">{card.channel}</a>
        <div className="mt-4 rounded-[12px] bg-surface p-3">
          <p>{card.summary}</p>
          {card.whyHn ? <p className="mt-2 text-sm text-muted">{card.whyHn}</p> : null}
          {card.quote ? <p className="mt-2 text-sm">{card.quote}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {card.categories.map((id) => (
              <a key={id} href={`/c/${id}`} className="rounded-[8px] bg-background px-2 py-1 text-sm">{categoryName(engine, id)}</a>
            ))}
          </div>
        </div>
        <section className="mt-6">
          <h2 className="text-base font-medium">{mentions.length} Hacker News comments</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {mentions.map((mention) => (
              <li key={mention.hn_comment_id} className="rounded-[12px] bg-surface p-3">
                <p className="text-sm text-muted">@{mention.author} {mention.month.slice(0, 4)} in {mention.story_title}</p>
                <p className="mt-2 whitespace-pre-wrap">{mention.text}</p>
                <p className="mt-2 flex flex-wrap gap-3 text-sm">
                  <span>{STANCE[mention.stance] ?? mention.stance}</span>
                  <a href={mention.hn_url} target="_blank" rel="noreferrer">View on HN</a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside>
        <h2 className="mb-3 text-base font-medium">Related</h2>
        <div className="flex flex-col gap-4">
          {related.map((item) => (
            <VideoCard key={item.vid} item={{ ...item, reason: "HN people also recommend this" }} />
          ))}
        </div>
      </aside>
    </div>
  );
}
