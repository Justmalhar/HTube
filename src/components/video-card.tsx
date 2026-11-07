"use client";

import type { FeedCard } from "@/lib/types";
import { ClockIcon } from "@/components/icons";
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
        <div className="group/thumb relative aspect-video overflow-hidden rounded-[12px] bg-surface">
          <img
            src={frame}
            alt=""
            className="size-full object-cover"
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.includes("hqdefault")) image.src = `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
            }}
          />
          <LaterButton saved={saved} onToggle={() => library.toggleLater(item.vid)} />
        </div>
        <h2 className="mt-2 line-clamp-2 text-sm font-medium leading-5">{item.title}</h2>
      </a>
      <a href={`/channel/${item.channelSlug}`} className="mt-1 block truncate text-sm text-muted">{item.channel}</a>
    </article>
  );
}

export function SearchList({ items }: { items: FeedCard[] }) {
  if (!items.length) return <p className="py-10 text-sm text-muted">Nothing matches these filters.</p>;
  return (
    <ul className="flex max-w-[1100px] flex-col gap-4">
      {items.map((item) => (
        <li key={item.vid}>
          <SearchRow item={item} />
        </li>
      ))}
    </ul>
  );
}

function SearchRow({ item }: { item: FeedCard }) {
  const library = useLibrary();
  const frame = library.frames
    ? `https://i.ytimg.com/vi/${item.vid}/hq2.jpg`
    : `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
  return (
    <article className="flex min-w-0 gap-3">
      <a href={`/watch/${item.vid}`} className="block w-[42%] max-w-[360px] shrink-0">
        <div className="group/thumb relative aspect-video overflow-hidden rounded-[12px] bg-surface">
          <img src={frame} alt="" className="size-full object-cover" />
          <LaterButton saved={library.later.includes(item.vid)} onToggle={() => library.toggleLater(item.vid)} />
        </div>
      </a>
      <div className="min-w-0">
        <a href={`/watch/${item.vid}`}>
          <h2 className="line-clamp-2 text-sm font-medium leading-5">{item.title}</h2>
        </a>
        <a href={`/channel/${item.channelSlug}`} className="mt-1 block truncate text-sm text-muted">{item.channel}</a>
      </div>
    </article>
  );
}

function LaterButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/80 text-white ${saved ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-100 focus-visible:opacity-100 max-[800px]:opacity-100"}`}
      aria-label={saved ? "Remove from watch later" : "Save to watch later"}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      <ClockIcon filled={saved} />
    </button>
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
