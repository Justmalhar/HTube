"use client";

import { useEffect, useRef, useState } from "react";

import { gridClass, pillClass } from "@/components/ui";
import { SearchList, VideoGrid } from "@/components/video-card";
import type { FeedCard } from "@/lib/types";

type Kind = "grid" | "list";
type State = { batches: FeedCard[][]; next: number; error: boolean };

function Skeletons({ kind }: { kind: Kind }) {
  const cards = Array.from({ length: kind === "grid" ? 3 : 2 }, (_, i) => i);
  if (kind === "list")
    return (
      <ul aria-hidden className="flex max-w-[1100px] flex-col gap-4 motion-safe:animate-pulse">
        {cards.map((i) => (
          <li key={i} className="flex gap-3 min-[801px]:gap-4">
            <div className="aspect-video w-[40%] max-w-[360px] shrink-0 rounded-xl bg-surface" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-11/12 rounded bg-surface" />
              <div className="h-3 w-1/2 rounded bg-surface" />
            </div>
          </li>
        ))}
      </ul>
    );
  return (
    <ul aria-hidden className={`${gridClass} motion-safe:animate-pulse`}>
      {cards.map((i) => (
        // Hide the extra placeholders where the grid has fewer columns.
        <li key={i} className={i === 1 ? "hidden min-[720px]:block" : i === 2 ? "hidden min-[1180px]:block" : undefined}>
          <div className="aspect-video rounded-xl bg-surface" />
          <div className="mt-3 h-4 w-11/12 rounded bg-surface" />
          <div className="mt-2 h-3 w-1/2 rounded bg-surface" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Appends batches from `src` (an /api/feed URL without offset) as the sentinel nears the viewport.
 * Render it with `key={src}` so new filters remount it with fresh state.
 */
export function InfiniteFeed({ src, start, total, kind }: { src: string; start: number; total: number; kind: Kind }) {
  const [current, setState] = useState<State>({ batches: [], next: start, error: false });
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const done = current.next >= total;
  const idle = !done && !current.error;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !idle) return;
    // Each run owns one offset; the observer can fire again before the fetch lands.
    let started = false;
    const controller = new AbortController();
    const load = () => {
      if (started) return;
      started = true;
      setLoading(true);
      fetch(`${src}&offset=${current.next}`, { signal: controller.signal })
        .then((res) => (res.ok ? (res.json() as Promise<{ items: FeedCard[]; offset: number }>) : Promise.reject(new Error(String(res.status)))))
        .then((data) =>
          setState((prev) => {
            const seen = new Set(prev.batches.flat().map((item) => item.vid));
            const fresh = data.items.filter((item) => !seen.has(item.vid));
            // An empty batch means the catalogue shrank under us; stop rather than loop.
            const next = data.items.length ? data.offset + data.items.length : total;
            return { ...prev, batches: fresh.length ? [...prev.batches, fresh] : prev.batches, next };
          }),
        )
        .catch(() => {
          if (controller.signal.aborted) return;
          setState((prev) => ({ ...prev, error: true }));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    };
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && load(), { rootMargin: "800px 0px" });
    observer.observe(node);
    return () => {
      observer.disconnect();
      controller.abort();
      setLoading(false);
    };
  }, [src, current.next, idle, total]);

  const List = kind === "grid" ? VideoGrid : SearchList;
  const gap = kind === "grid" ? "mt-10" : "mt-4";
  return (
    <>
      {current.batches.map((items) => (
        <div key={items[0]?.vid} className={gap}>
          <List items={items} />
        </div>
      ))}
      {loading ? (
        <div className={gap}>
          <Skeletons kind={kind} />
        </div>
      ) : null}
      {current.error ? (
        <div role="status" className="mt-10 flex items-center justify-center gap-3 text-sm text-muted">
          Couldn&apos;t load more
          <button type="button" className={pillClass} onClick={() => setState((prev) => ({ ...prev, error: false }))}>
            Retry
          </button>
        </div>
      ) : null}
      {idle ? <div ref={sentinel} aria-hidden className="h-px" /> : null}
    </>
  );
}
