"use client";

import { useEffect } from "react";

import { useLibrary } from "@/components/library";

export function WatchActions({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  useEffect(() => {
    library.markSeen(vid);
    // Record the open once. markSeen no-ops if this id is already stored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vid]);
  const frame = library.frames
    ? `https://i.ytimg.com/vi/${vid}/hq2.jpg`
    : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
        <iframe
          className="size-full"
          src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <img src={frame} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-0" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`h-9 rounded-[18px] px-4 ${library.likes.includes(vid) ? "bg-primary text-[var(--on-primary)]" : "bg-surface"}`} onClick={() => library.toggleLike(vid)}>
          {library.likes.includes(vid) ? "Liked" : "Like"}
        </button>
        <button type="button" className={`h-9 rounded-[18px] px-4 ${library.dislikes.includes(vid) ? "bg-surface-hover" : "bg-surface"}`} onClick={() => library.toggleDislike(vid)}>
          {library.dislikes.includes(vid) ? "Hidden" : "Not for me"}
        </button>
        <button type="button" className="h-9 rounded-[18px] bg-surface px-4" onClick={() => library.toggleLater(vid)}>
          {library.later.includes(vid) ? "Saved" : "Watch later"}
        </button>
        <a className="inline-flex h-9 items-center rounded-[18px] bg-surface px-4" href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer">
          YouTube
        </a>
        <a className="inline-flex h-9 items-center rounded-[18px] bg-surface px-4" href={`https://hackertube.org/watch/${vid}`} target="_blank" rel="noreferrer">
          Source
        </a>
      </div>
    </div>
  );
}
