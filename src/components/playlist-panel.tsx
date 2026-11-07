"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDownIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "@/components/icons";

export type PanelItem = { vid: string; title: string; channel: string };

const href = (vid: string, slug: string) => `/watch/${vid}?list=${slug}`;
const navClass = "press grid size-8 place-items-center rounded-full hover:bg-surface-hover";

export function PlaylistPanel({ slug, title, items, index }: { slug: string; title: string; items: PanelItem[]; index: number }) {
  const [open, setOpen] = useState(true);
  const list = useRef<HTMLOListElement>(null);
  const prev = items[index - 1];
  const next = items[index + 1];
  useEffect(() => {
    // Scroll the list container only, so the page itself does not jump.
    const box = list.current;
    const row = box?.children[index] as HTMLElement | undefined;
    if (box && row) box.scrollTop = row.offsetTop - box.offsetTop - (box.clientHeight - row.clientHeight) / 2;
  }, [index, open]);
  return (
    <section aria-label="Playlist" className="overflow-hidden rounded-xl border border-line bg-surface/40">
      {/* Collapsed: one compact row, like YouTube. */}
      <header className="flex items-center gap-1 bg-surface py-2 pl-3 pr-2">
        <div className="min-w-0 flex-1">
          {open || !next ? (
            <>
              <a href={`/p/${slug}`} className="block truncate text-base font-bold leading-6 hover:text-muted">{title}</a>
              <p className="text-xs text-muted tabular-nums">{index + 1} / {items.length}</p>
            </>
          ) : (
            <a href={href(next.vid, slug)} className="block truncate text-sm leading-5 hover:text-muted">
              <span className="font-medium">Next:</span> {next.title}
            </a>
          )}
        </div>
        <a href={prev ? href(prev.vid, slug) : undefined} aria-disabled={!prev} aria-label="Previous video" title="Previous" className={`${navClass} ${prev ? "" : "pointer-events-none opacity-40"}`}>
          <SkipBackIcon />
        </a>
        <a href={next ? href(next.vid, slug) : undefined} aria-disabled={!next} aria-label="Next video" title="Next" className={`${navClass} ${next ? "" : "pointer-events-none opacity-40"}`}>
          <SkipForwardIcon />
        </a>
        <button type="button" className={navClass} aria-expanded={open} aria-label={open ? "Collapse playlist" : "Expand playlist"} onClick={() => setOpen((value) => !value)}>
          <span className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}><ChevronDownIcon /></span>
        </button>
      </header>
      {open ? (
        <ol ref={list} className="relative max-h-[400px] overflow-y-auto">
          {items.map((item, position) => {
            const current = position === index;
            return (
              <li key={item.vid} className={current ? "bg-surface-hover" : ""}>
                <a href={href(item.vid, slug)} aria-current={current ? "true" : undefined} className="flex min-w-0 items-center gap-2 py-2 pl-1 pr-3 hover:bg-surface-hover">
                  <span className="grid w-6 shrink-0 place-items-center text-xs tabular-nums text-muted">
                    {current ? <span className="text-foreground [&_svg]:size-3.5"><PlayIcon /></span> : position + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnails */}
                  <img src={`https://i.ytimg.com/vi/${item.vid}/default.jpg`} alt="" width={96} height={72} loading="lazy" decoding="async" className="aspect-video w-[100px] shrink-0 rounded-md bg-surface object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-5 wrap-anywhere">{item.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{item.channel}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
