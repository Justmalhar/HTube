"use client";

import type { FeedCard } from "@/lib/types";
import { useLibrary } from "@/components/library";

export function VideoCard({ item }: { item: FeedCard }) {
  const library = useLibrary();
  const frame = library.frames
    ? `https://i.ytimg.com/vi/${item.vid}/hq2.jpg`
    : `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
  const saved = library.later.includes(item.vid);
  return (
    <article className="min-w-0">
      <a href={`/watch/${item.vid}`} className="block rounded-[12px]">
        <div className="relative aspect-video overflow-hidden rounded-[12px] bg-surface">
          <img
            src={frame}
            alt=""
            className="size-full object-cover"
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.includes("hqdefault")) image.src = `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
            }}
          />
          <button
            type="button"
            className="absolute right-2 top-2 h-8 rounded-[8px] bg-black/80 px-2 text-xs text-white"
            aria-label={saved ? "Remove from watch later" : "Save to watch later"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              library.toggleLater(item.vid);
            }}
          >
            {saved ? "Saved" : "Later"}
          </button>
        </div>
        <h2 className="mt-3 line-clamp-2 text-base font-medium leading-5">{item.title}</h2>
      </a>
      <a href={`/channel/${item.channelSlug}`} className="mt-1 block truncate text-sm text-muted">{item.channel}</a>
      <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
        <span>{item.recommenders} HN recommendations</span>
        <span>{item.firstYear} to {item.lastYear}</span>
      </p>
      {item.reason ? <p className="mt-1 text-xs text-muted">{item.reason}</p> : null}
    </article>
  );
}

export function VideoGrid({ items }: { items: FeedCard[] }) {
  if (!items.length) {
    return <p className="py-10 text-sm text-muted">Nothing matches these filters.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-8 min-[520px]:grid-cols-2 min-[1100px]:grid-cols-3 min-[1500px]:grid-cols-4">
      {items.map((item) => (
        <li key={item.vid}>
          <VideoCard item={item} />
        </li>
      ))}
    </ul>
  );
}
