import { RankedList } from "@/components/ranked-list";
import { VideoCard } from "@/components/video-card";
import type { FeedCard } from "@/lib/types";

export type TrendingItem = { card: FeedCard; lastYear: number };

const times = (n: number) => (n === 1 ? "once" : `${n} times`);

export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <>
      <RankedList
        className="hidden min-[640px]:flex"
        thumbMax="sm:max-w-[246px]"
        items={items.map(({ card, lastYear }) => ({
          card,
          extra: lastYear > 0 ? <p className="mt-1 text-xs text-muted">Shared on HN {times(lastYear)} this year</p> : null,
        }))}
      />
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
