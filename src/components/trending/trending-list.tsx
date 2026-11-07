import { VideoCard, VideoRow } from "@/components/video-card";
import type { FeedCard } from "@/lib/types";

export type TrendingItem = { card: FeedCard; lastYear: number };

const times = (n: number) => (n === 1 ? "once" : `${n} times`);

export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <>
      <ol className="hidden flex-col gap-4 min-[640px]:flex">
        {items.map(({ card, lastYear }, i) => (
          <li key={card.vid} className="flex min-w-0 items-start gap-4">
            <span className="w-8 shrink-0 pt-1 text-right text-lg font-medium text-muted tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1 [&_article>div:first-child]:max-w-[246px]">
              <VideoRow item={card}>
                {lastYear > 0 && <p className="mt-1 text-xs text-muted min-[801px]:mt-1">Shared on HN {times(lastYear)} this year</p>}
              </VideoRow>
            </div>
          </li>
        ))}
      </ol>
      <ul className="grid grid-cols-1 gap-y-8 min-[640px]:hidden">
        {items.map(({ card }, i) => (
          <li key={card.vid} className="min-w-0">
            <VideoCard item={card} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}
