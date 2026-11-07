import { rowListClass } from "@/components/ui";
import { VideoRow } from "@/components/video-card";
import type { FeedCard } from "@/lib/types";

export type RankedItem = { card: FeedCard; href?: string; extra?: React.ReactNode };

/** Numbered list of video rows (trending, playlists). `thumbMax` is a literal Tailwind max-width class. */
export function RankedList({ items, thumbMax, className = "" }: { items: RankedItem[]; thumbMax?: string; className?: string }) {
  return (
    <ol className={`${rowListClass} min-w-0 flex-1 ${className}`}>
      {items.map(({ card, href, extra }, index) => (
        <li key={card.vid} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 min-[801px]:grid-cols-[2rem_minmax(0,1fr)] min-[801px]:gap-3">
          <span className="pt-1 text-right text-sm font-medium tabular-nums text-muted">{index + 1}</span>
          <VideoRow item={card} href={href} thumbMax={thumbMax}>
            {extra}
          </VideoRow>
        </li>
      ))}
    </ol>
  );
}
