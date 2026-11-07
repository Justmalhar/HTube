"use client";

import { useEffect, useRef, useState } from "react";

import type { FeedCard } from "@/lib/types";
import { ClockIcon, ExternalIcon, HideIcon, MoreIcon } from "@/components/icons";
import { useLibrary } from "@/components/library";
import { gridClass } from "@/components/ui";

function frameFor(vid: string, frames: boolean) {
  return frames ? `https://i.ytimg.com/vi/${vid}/hq2.jpg` : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
}

function Thumb({ item, className = "rounded-xl" }: { item: FeedCard; className?: string }) {
  const library = useLibrary();
  const saved = library.later.includes(item.vid);
  return (
    <div className={`group/thumb relative aspect-video overflow-hidden bg-surface ${className}`}>
      <img
        src={frameFor(item.vid, library.frames)}
        alt=""
        loading="lazy"
        className="size-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
        onError={(event) => {
          const image = event.currentTarget;
          if (!image.src.includes("hqdefault")) image.src = `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
        }}
      />
      <LaterButton saved={saved} onToggle={() => library.toggleLater(item.vid)} />
    </div>
  );
}

export function VideoCard({ item }: { item: FeedCard }) {
  const library = useLibrary();
  if (library.dislikes.includes(item.vid)) {
    return (
      <div className="grid aspect-video place-items-center rounded-xl bg-surface p-4 text-center">
        <div>
          <p className="text-sm font-medium">Video hidden</p>
          <p className="mt-1 text-xs text-muted">We will show fewer like this</p>
          <button type="button" className="mt-3 h-9 rounded-full bg-background px-4 text-sm font-medium hover:bg-surface-hover" onClick={() => library.toggleDislike(item.vid)}>
            Undo
          </button>
        </div>
      </div>
    );
  }
  return (
    <article className="group/card relative -m-2 min-w-0 rounded-2xl p-2 pb-3 transition-colors hover:bg-surface/60">
      <a href={`/watch/${item.vid}`} className="block rounded-xl">
        <Thumb item={item} />
      </a>
      <div className="relative mt-3 pr-7">
        <div className="min-w-0">
          <a href={`/watch/${item.vid}`}>
            <h2 className="line-clamp-2 text-[15px] font-medium leading-[21px]">{item.title}</h2>
          </a>
          <a href={`/channel/${item.channelSlug}`} className="mt-1 block truncate text-sm text-muted hover:text-foreground">
            {item.channel}
          </a>
        </div>
        <CardMenu item={item} className="absolute -right-2 -top-1" />
      </div>
    </article>
  );
}

function CardMenu({ item, className }: { item: FeedCard; className: string }) {
  const library = useLibrary();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && root.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  const saved = library.later.includes(item.vid);
  const hidden = library.dislikes.includes(item.vid);
  const row = "flex h-10 w-full items-center gap-3 px-4 text-left text-sm hover:bg-surface-hover";
  return (
    <div ref={root} className={className}>
      <button
        type="button"
        className={`grid size-9 place-items-center rounded-full hover:bg-surface ${open ? "bg-surface opacity-100" : "opacity-100 min-[801px]:opacity-0 min-[801px]:group-hover/card:opacity-100 min-[801px]:focus-visible:opacity-100"}`}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreIcon />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-10 z-20 w-60 overflow-hidden rounded-xl bg-surface py-2 shadow-[0_4px_32px_rgba(0,0,0,0.25)]">
          <button role="menuitem" type="button" className={row} onClick={() => { library.toggleLater(item.vid); setOpen(false); }}>
            <ClockIcon filled={saved} />
            {saved ? "Remove from Watch later" : "Save to Watch later"}
          </button>
          <button role="menuitem" type="button" className={row} onClick={() => { library.toggleDislike(item.vid); setOpen(false); }}>
            <HideIcon />
            {hidden ? "Undo not interested" : "Not interested"}
          </button>
          <a role="menuitem" className={row} href={`https://www.youtube.com/watch?v=${item.vid}`} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            <ExternalIcon />
            Open on YouTube
          </a>
        </div>
      ) : null}
    </div>
  );
}

export function SearchList({ items }: { items: FeedCard[] }) {
  if (!items.length) return <EmptyResults />;
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
  return (
    <article className="group/card relative flex min-w-0 gap-4">
      <a href={`/watch/${item.vid}`} className="block w-[42%] max-w-[360px] shrink-0">
        <Thumb item={item} />
      </a>
      <div className="min-w-0 flex-1 pr-8">
        <a href={`/watch/${item.vid}`}>
          <h2 className="line-clamp-2 text-base font-normal leading-[22px] min-[801px]:text-lg min-[801px]:leading-[26px]">{item.title}</h2>
        </a>
        <a href={`/channel/${item.channelSlug}`} className="mt-2 block truncate text-xs text-muted hover:text-foreground">
          {item.channel}
        </a>
        {item.summary ? <p className="mt-2 line-clamp-2 hidden text-xs text-muted min-[720px]:block">{item.summary}</p> : null}
      </div>
      <CardMenu item={item} className="absolute right-0 top-0" />
    </article>
  );
}

export function LaterButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/75 text-white transition-opacity ${saved ? "opacity-100" : "opacity-100 min-[801px]:opacity-0 min-[801px]:group-hover/thumb:opacity-100 min-[801px]:focus-visible:opacity-100"}`}
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

export function RelatedRow({ item }: { item: FeedCard }) {
  return (
    <article className="group/card relative flex gap-2">
      <a href={`/watch/${item.vid}`} className="block w-[168px] shrink-0">
        <Thumb item={item} className="rounded-lg" />
      </a>
      <div className="min-w-0 pr-7">
        <a href={`/watch/${item.vid}`}>
          <h2 className="line-clamp-2 text-sm font-medium leading-5">{item.title}</h2>
        </a>
        <a href={`/channel/${item.channelSlug}`} className="mt-1 block truncate text-xs text-muted hover:text-foreground">{item.channel}</a>
      </div>
      <CardMenu item={item} className="absolute -right-2 top-0" />
    </article>
  );
}

function EmptyResults() {
  return (
    <div className="grid place-items-center rounded-2xl bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted">Try fewer filters or another search</p>
    </div>
  );
}

export function VideoGrid({ items }: { items: FeedCard[] }) {
  if (!items.length) return <EmptyResults />;
  return (
    <ul className={gridClass}>
      {items.map((item) => (
        <li key={item.vid}>
          <VideoCard item={item} />
        </li>
      ))}
    </ul>
  );
}
