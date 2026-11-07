"use client";

import { useEffect } from "react";

import { ClockIcon, ExternalIcon, ThumbDownIcon, ThumbUpIcon, pillClass } from "@/components/icons";
import { useLibrary } from "@/components/library";

export function WatchActions({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  useEffect(() => {
    library.markSeen(vid);
    // Record the open once. markSeen no-ops if this id is already stored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vid]);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-full bg-surface">
          <button type="button" className={`grid size-9 place-items-center ${library.likes.includes(vid) ? "text-primary" : ""}`} aria-label="Like" aria-pressed={library.likes.includes(vid)} onClick={() => library.toggleLike(vid)}>
            <ThumbUpIcon filled={library.likes.includes(vid)} />
          </button>
          <button type="button" className={`grid size-9 place-items-center border-l border-line ${library.dislikes.includes(vid) ? "text-primary" : ""}`} aria-label="Not for me" aria-pressed={library.dislikes.includes(vid)} onClick={() => library.toggleDislike(vid)}>
            <ThumbDownIcon filled={library.dislikes.includes(vid)} />
          </button>
        </div>
        <button type="button" className={`${pillClass} ${library.later.includes(vid) ? "text-primary" : ""}`} aria-label={library.later.includes(vid) ? "Remove from watch later" : "Watch later"} aria-pressed={library.later.includes(vid)} onClick={() => library.toggleLater(vid)}>
          <ClockIcon filled={library.later.includes(vid)} />
          <span className="pr-1">{library.later.includes(vid) ? "Saved" : "Watch later"}</span>
        </button>
        <a className={pillClass} href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer" aria-label="Open on YouTube">
          <ExternalIcon />
          <span className="pr-1">YouTube</span>
        </a>
        <a className="grid size-9 place-items-center rounded-full bg-surface hover:bg-[var(--surface-hover)]" href={`https://hackertube.org/watch/${vid}`} target="_blank" rel="noreferrer" aria-label="Open on HackerTube">
          <ExternalIcon />
        </a>
      </div>
    </div>
  );
}
