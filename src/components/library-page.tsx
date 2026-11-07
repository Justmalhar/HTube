"use client";

import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { EmptyState, VideoRow } from "@/components/video-card";
import { useHydrated, useLibrary } from "@/components/library";
import { countChipClass, videos } from "@/components/shelf";
import { headerActionClass } from "@/components/ui";
import type { FeedCard } from "@/lib/types";

type Kind = "likes" | "later" | "seen";

const COPY: Record<Kind, { title: string; empty: [string, string]; cleared: string }> = {
  seen: {
    title: "History",
    empty: ["No watch history", "Videos you watch appear here"],
    cleared: "History cleared",
  },
  later: {
    title: "Watch later",
    empty: ["No saved videos", "Videos you save appear here"],
    cleared: "Watch later cleared",
  },
  likes: {
    title: "Liked videos",
    empty: ["No liked videos", "Videos you like appear here"],
    cleared: "Liked videos cleared",
  },
};

/** /api/cards accepts up to 500 ids per request. */
const BATCH = 500;

async function fetchCards(ids: string[]): Promise<FeedCard[]> {
  const batches = [];
  for (let start = 0; start < ids.length; start += BATCH) batches.push(ids.slice(start, start + BATCH));
  const pages = await Promise.all(
    batches.map(async (batch) => {
      const response = await fetch(`/api/cards?ids=${batch.map(encodeURIComponent).join(",")}`);
      if (!response.ok) throw new Error(`cards ${response.status}`);
      return ((await response.json()) as { items: FeedCard[] }).items;
    }),
  );
  return pages.flat();
}

export function LibraryPage({ kind }: { kind: Kind }) {
  const library = useLibrary();
  const ready = useHydrated();
  const copy = COPY[kind];
  const stored = library[kind];
  // History is stored oldest first; show the latest first.
  const ids = kind === "seen" ? [...stored].reverse() : stored;
  const idKey = ids.join(",");

  // vid -> card, or null when the catalogue no longer has that id.
  const [cards, setCards] = useState<Record<string, FeedCard | null>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requested = useRef(new Set<string>());

  useEffect(() => {
    const missing = idKey ? idKey.split(",").filter((id) => !requested.current.has(id)) : [];
    if (!missing.length) return;
    missing.forEach((id) => requested.current.add(id));
    // No cancel flag: results are merged by id, so a late response is still correct.
    fetchCards(missing)
      .then((items) => {
        const found = new Map(items.map((item) => [item.vid, item]));
        setCards((previous) => {
          const next = { ...previous };
          for (const id of missing) next[id] = found.get(id) ?? null;
          return next;
        });
      })
      .catch(() => {
        missing.forEach((id) => requested.current.delete(id));
        setFailed(true);
      });
  }, [idKey, attempt]);

  const [undo, setUndo] = useState<{ message: string; previous: string[] } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  const change = (message: string, next: string[]) => {
    setUndo({ message, previous: stored });
    library.setList(kind, next);
  };

  const items = ids.flatMap((id) => cards[id] ?? []);
  const loading = ids.some((id) => !(id in cards)) && !failed;

  let body: React.ReactNode;
  if (!ready) body = null;
  else if (!ids.length) {
    const [title, text] = copy.empty;
    body = <EmptyState title={title} body={text} href="/" action="Go to Home" />;
  } else if (failed && !items.length) {
    body = (
      <div className="grid place-items-center rounded-2xl bg-surface px-6 py-16 text-center">
        <p className="text-base font-medium">Couldn&apos;t load videos</p>
        <p className="mt-1 text-sm text-muted">Check your connection</p>
        <button type="button" className="mt-4 h-9 rounded-full bg-background px-4 text-sm font-medium hover:bg-surface-hover press" onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>
          Try again
        </button>
      </div>
    );
  } else {
    body = (
      <ul className="flex max-w-[1100px] flex-col gap-4" aria-busy={loading}>
        {items.map((item) => (
          <li key={item.vid}>
            <VideoRow
              item={item}
              action={
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full hover:bg-surface press"
                  aria-label={`Remove ${item.title} from ${copy.title}`}
                  title={`Remove from ${copy.title}`}
                  onClick={() => change(`Removed from ${copy.title}`, stored.filter((id) => id !== item.vid))}
                >
                  <CloseIcon />
                </button>
              }
            />
          </li>
        ))}
        {loading ? <li className="h-24 rounded-xl bg-surface motion-safe:animate-pulse" aria-hidden /> : null}
      </ul>
    );
  }

  return (
    <div>
      <PageHeader
        title={copy.title}
        actions={
          ready && ids.length ? (
            <>
              {kind === "seen" ? null : <span className={countChipClass}>{videos(ids.length)}</span>}
              <button type="button" className={headerActionClass} onClick={() => change(copy.cleared, [])}>
                Clear all
              </button>
            </>
          ) : null
        }
      />
      {body}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-20 z-(--z-header) flex justify-center min-[801px]:bottom-6">
        {undo ? (
          <div className="pointer-events-auto flex max-w-full items-center gap-4 rounded-xl bg-chip-on py-2 pl-4 pr-2 text-sm text-chip-on-text shadow-[0_4px_32px_rgba(0,0,0,0.25)] transition-[opacity,translate] duration-200 ease-out-quart starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none">
            <span className="min-w-0 truncate">{undo.message}</span>
            <button
              type="button"
              className="h-9 shrink-0 rounded-full px-3 font-bold hover:underline press"
              onClick={() => {
                library.setList(kind, undo.previous);
                setUndo(null);
              }}
            >
              Undo
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
