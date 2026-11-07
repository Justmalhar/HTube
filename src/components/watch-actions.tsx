"use client";

import { useEffect, useState } from "react";

import { ClockIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { useLibrary } from "@/components/library";

export function Player({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  useEffect(() => {
    library.markSeen(vid);
    // Record the open once. markSeen no-ops if this id is already stored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vid]);
  return (
    <div className="relative -mx-4 aspect-video overflow-hidden bg-black min-[801px]:mx-0 min-[801px]:rounded-xl">
      <iframe
        className="absolute inset-0 size-full"
        src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

export function ActionBar({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  const [copied, setCopied] = useState(false);
  const liked = library.likes.includes(vid);
  const disliked = library.dislikes.includes(vid);
  const saved = library.later.includes(vid);
  const share = async () => {
    const url = `${window.location.origin}/watch/${vid}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  const round = "grid size-9 shrink-0 place-items-center rounded-full bg-surface transition-colors hover:bg-surface-hover";
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-full bg-surface">
        <button type="button" className="grid h-full w-12 place-items-center hover:bg-surface-hover" aria-label={liked ? "Unlike" : "Like"} title="Like" aria-pressed={liked} onClick={() => library.toggleLike(vid)}>
          <ThumbUpIcon filled={liked} />
        </button>
        <span className="h-6 w-px bg-line" aria-hidden />
        <button type="button" className="grid h-full w-12 place-items-center hover:bg-surface-hover" aria-label="Not for me" title="Not for me" aria-pressed={disliked} onClick={() => library.toggleDislike(vid)}>
          <ThumbDownIcon filled={disliked} />
        </button>
      </div>
      <button type="button" className={round} aria-label={copied ? "Link copied" : "Share"} title={copied ? "Link copied" : "Share"} onClick={share}>
        <ShareIcon />
      </button>
      <button type="button" className={round} aria-label={saved ? "Remove from Watch later" : "Save to Watch later"} title={saved ? "Saved" : "Save"} aria-pressed={saved} onClick={() => library.toggleLater(vid)}>
        <ClockIcon filled={saved} />
      </button>
      {copied ? <span role="status" className="text-xs text-muted">Link copied</span> : null}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M14 5l7 7-7 7v-4c-5 0-8 1.5-11 5 1-5 4-10 11-11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
