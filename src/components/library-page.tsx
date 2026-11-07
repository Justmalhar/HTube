"use client";

import { useEffect, useRef, useState } from "react";

import { PlaylistSidebar } from "@/components/playlist-sidebar";
import { StatusPanel } from "@/components/status-panel";
import { useSnackbar } from "@/components/snackbar";

import { CloseIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { EmptyState, VideoRow } from "@/components/video-card";
import { useHydrated, useLibrary } from "@/components/library";
import { HistoryPanel, PausedBanner } from "@/components/history/history-panel";
import { headerActionClass, rowListClass, sectionTitleClass } from "@/components/ui";
import { groupHistory } from "@/lib/history";
import type { FeedCard } from "@/lib/types";

type Kind = "likes" | "later" | "seen";

const COPY: Record<Kind, { title: string; empty: [string, string]; cleared: string }> = {
  seen: {
    title: "Watch history",
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

  const [query, setQuery] = useState("");
  const [now] = useState(Date.now);
  const snackbar = useSnackbar();

  const change = (message: string, next: string[]) => {
    const previous = stored;
    snackbar.show(message, { label: "Undo", run: () => library.setList(kind, previous) });
    library.setList(kind, next);
  };

  const needle = query.trim().toLowerCase();
  const items = ids
    .flatMap((id) => cards[id] ?? [])
    .filter((item) => !needle || `${item.title} ${item.channel}`.toLowerCase().includes(needle));
  const loading = ids.some((id) => !(id in cards)) && !failed;

  let body: React.ReactNode;
  if (!ready) body = null;
  else if (!ids.length) {
    const [title, text] = copy.empty;
    body = (
      <>
        {kind === "seen" && library.paused ? <PausedBanner onTurnOn={() => library.setPaused(false)} /> : null}
        <EmptyState title={title} body={text} href="/" action="Go to Home" />
      </>
    );
  } else if (failed && !items.length) {
    body = (
      <StatusPanel
        title="Couldn't load videos"
        body="Check your connection"
        action={{ label: "Try again", onClick: () => { setFailed(false); setAttempt((value) => value + 1); } }}
      />
    );
  } else {
    const row = (item: FeedCard) => (
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
    );
    const skeleton = loading ? <div className="h-24 rounded-xl bg-surface motion-safe:animate-pulse" aria-hidden /> : null;
    const list =
      kind === "seen" ? (
        <div className="flex min-w-0 flex-1 flex-col gap-6" aria-busy={loading}>
          {library.paused ? <PausedBanner onTurnOn={() => library.setPaused(false)} /> : null}
          {needle && !items.length && !loading ? (
            <EmptyState title="No results found" body="Try different keywords" />
          ) : (
            groupHistory(items.map((item) => item.vid), library.seenAt, now).map(({ group, ids: groupIds }) => (
              <section key={group} aria-label={group}>
                <h2 className={`mb-4 ${sectionTitleClass}`}>{group}</h2>
                <ul className={rowListClass}>{groupIds.map((id) => row(cards[id]!))}</ul>
              </section>
            ))
          )}
          {skeleton}
        </div>
      ) : (
        <ul className={`${rowListClass} min-w-0 flex-1`} aria-busy={loading}>
          {items.map(row)}
          {skeleton ? <li>{skeleton}</li> : null}
        </ul>
      );
    const side =
      kind === "seen" ? (
        <HistoryPanel
          query={query}
          onQuery={setQuery}
          paused={library.paused}
          onPaused={library.setPaused}
          onClear={() => change(copy.cleared, [])}
          canClear
        />
      ) : (
        <PlaylistSidebar title={copy.title} ids={ids} />
      );
    body = (
      <div className={`flex flex-col gap-6 min-[801px]:flex-row ${kind === "seen" ? "min-[801px]:flex-row-reverse" : ""}`}>
        {side}
        {list}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={copy.title}
        actions={
          ready && ids.length && kind !== "seen" ? (
            <button type="button" className={headerActionClass} onClick={() => change(copy.cleared, [])}>
              Clear all
            </button>
          ) : null
        }
      />
      {body}
      {snackbar.node}
    </div>
  );
}
