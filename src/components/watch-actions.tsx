"use client";

import { useEffect, useRef, useState } from "react";

import { ClockIcon, ExternalIcon, HideIcon, ShareIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { useLibrary } from "@/components/library";
import { ActionMenu, menuItemClass } from "@/components/video-card";

export function Player({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  const { markSeen } = library;
  useEffect(() => {
    // markSeen reads the stored library itself and moves a re-watched id to the top of History.
    markSeen(vid);
  }, [markSeen, vid]);
  const [glow, setGlow] = useState(false);
  return (
    // isolate keeps the glow's -z-10 inside this box, under the player but above the page background.
    <div className="relative isolate -mx-4 min-[801px]:mx-0">
      {/* Ambient mode: a blurred copy of the thumbnail spills soft colour around the player.
          No scale transform: blur is ink overflow and never adds scroll width, a transform would. */}
      <img
        src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
        alt=""
        aria-hidden
        decoding="async"
        ref={(node) => {
          if (node?.complete && node.naturalWidth) setGlow(true);
        }}
        onLoad={() => setGlow(true)}
        className={`pointer-events-none absolute inset-0 -z-10 size-full object-cover blur-[80px] saturate-[1.4] transition-opacity duration-700 ease-out-quart motion-reduce:transition-none [@media(prefers-reduced-transparency:reduce)]:hidden ${glow ? "opacity-45 in-data-[theme=light]:opacity-25" : "opacity-0"}`}
      />
      <div className="relative aspect-video overflow-hidden bg-black min-[801px]:rounded-xl">
      <iframe
        className="absolute inset-0 size-full"
        src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      </div>
    </div>
  );
}

export function ActionBar({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const liked = library.likes.includes(vid);
  const disliked = library.dislikes.includes(vid);
  const saved = library.later.includes(vid);
  const share = async () => {
    const url = `${window.location.origin}/watch/${vid}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard needs a secure context and permission; fall back to the address bar.
      window.prompt("Copy this link", url);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };
  const pill = "press inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium";
  const off = "bg-surface hover:bg-surface-hover";
  const half = "press grid h-full w-12 place-items-center hover:bg-surface-hover";
  return (
    // The scroller holds the pills; the overflow menu sits outside it so its popover is never clipped.
    <div className="-mr-4 flex min-w-0 items-center gap-2 min-[1000px]:mr-0">
      <div className="no-scrollbar -ml-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 pl-4 min-[1000px]:ml-0 min-[1000px]:overflow-visible min-[1000px]:pl-0">
      <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-full bg-surface">
        <button type="button" className={half} aria-label={liked ? "Unlike" : "Like"} title="Like" aria-pressed={liked} onClick={() => library.toggleLike(vid)}>
          <ThumbUpIcon filled={liked} />
        </button>
        <span className="h-6 w-px bg-line" aria-hidden />
        <button type="button" className={half} aria-label="Not for me" title="Not for me" aria-pressed={disliked} onClick={() => library.toggleDislike(vid)}>
          <ThumbDownIcon filled={disliked} />
        </button>
      </div>
      <button type="button" className={`${pill} ${off}`} onClick={share}>
        <ShareIcon />
        {copied ? "Copied" : "Share"}
      </button>
      <button
        type="button"
        className={`${pill} ${saved ? "bg-chip-on text-chip-on-text" : off}`}
        aria-label={saved ? "Remove from Watch later" : "Save to Watch later"}
        title={saved ? "Remove from Watch later" : "Save to Watch later"}
        aria-pressed={saved}
        onClick={() => library.toggleLater(vid)}
      >
        <ClockIcon filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
      </div>
      <ActionMenu
        label="More actions"
        className="relative mr-4 shrink-0 min-[1000px]:mr-0"
        triggerClass={(open) => `press grid size-9 place-items-center rounded-full ${open ? "bg-surface-hover" : off}`}
      >
            <button role="menuitem" type="button" className={menuItemClass} onClick={() => library.toggleDislike(vid)}>
              <HideIcon />
              {disliked ? "Undo not interested" : "Not interested"}
            </button>
            <a role="menuitem" className={menuItemClass} href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer">
              <ExternalIcon />
              Open on YouTube
            </a>
      </ActionMenu>
      <span role="status" className="sr-only">{copied ? "Link copied" : ""}</span>
    </div>
  );
}

/**
 * Description box: clamps to three lines with a "...more" toggle, like YouTube. The toggle only
 * appears when the text actually overflows. Chips stay visible below the text.
 */
export function Description({ meta, chips, children }: { meta: string; chips: React.ReactNode; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = body.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      if (!node.classList.contains("line-clamp-3")) return;
      setOverflows(node.scrollHeight > node.clientHeight + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="mt-3 rounded-xl bg-surface p-3 text-sm leading-5 wrap-break-word">
      <p className="font-medium">{meta}</p>
      <div ref={body} id="watch-description" className={`mt-1 *:mt-2 first:*:mt-0 ${expanded ? "" : "line-clamp-3"}`}>
        {children}
      </div>
      {overflows ? (
        <button
          type="button"
          className="press mt-1 font-medium"
          aria-expanded={expanded}
          aria-controls="watch-description"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "...more"}
        </button>
      ) : null}
      {chips}
    </div>
  );
}
