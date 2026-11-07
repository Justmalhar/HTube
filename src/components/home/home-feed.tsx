"use client";

import { useEffect, useState } from "react";

import { InfiniteFeed } from "@/components/infinite-feed";
import { useHydrated, useLibrary } from "@/components/library";
import { Shelf } from "@/components/shelf";
import { VideoCard, VideoGrid } from "@/components/video-card";
import type { FeedCard } from "@/lib/types";

type Personal = {
  items: FeedCard[];
  total: number;
  because: { title: string; items: FeedCard[] } | null;
  later: FeedCard[];
};

const SEED_KEY = "oht.seed";

function sessionSeed() {
  try {
    const stored = sessionStorage.getItem(SEED_KEY);
    if (stored) return Number(stored);
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
    sessionStorage.setItem(SEED_KEY, String(seed));
    return seed;
  } catch {
    return Math.floor(Math.random() * 2 ** 32);
  }
}

function Row({ items }: { items: FeedCard[] }) {
  return items.map((item) => (
    <li key={item.vid} className="w-[256px] shrink-0 snap-start p-2 min-[801px]:w-[296px]">
      <VideoCard item={item} />
    </li>
  ));
}

/**
 * Server-rendered default feed first; once hydrated, swaps in the viewer's personalized order
 * (same grid, crossfade) and continues that order while scrolling.
 */
export function HomeFeed({
  items,
  total,
  topics,
  playlists,
}: {
  items: FeedCard[];
  total: number;
  topics: React.ReactNode;
  playlists: React.ReactNode;
}) {
  const ready = useHydrated();
  const library = useLibrary();
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [settled, setSettled] = useState(false);
  const [fading, setFading] = useState(false);
  const [request, setRequest] = useState<Record<string, unknown> | null>(null);
  // Videos already marked Not interested when the page opened; ones hidden now keep their Undo card.
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;
    const { likes, dislikes, seen, later } = library;
    const body = { likes, dislikes, seen, later, seed: sessionSeed() };
    const controller = new AbortController();
    fetch("/api/feed", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Personal>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        setFading(true);
        setTimeout(() => {
          setPersonal(data);
          setHidden(dislikes);
          setRequest(body);
          setFading(false);
          setSettled(true);
        }, 150);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSettled(true);
      });
    return () => controller.abort();
    // One snapshot per visit: later library edits must not reshuffle the feed under the viewer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const becauseIds = new Set(personal?.because?.items.map((item) => item.vid));
  const later = (personal?.later ?? []).filter((item) => !becauseIds.has(item.vid));
  const onShelves = new Set([...becauseIds, ...later.map((item) => item.vid)]);
  const shown = (personal?.items ?? items).filter(
    (item) => !(personal ? hidden : library.dislikes).includes(item.vid) && !onShelves.has(item.vid),
  );
  const grid = (list: FeedCard[]) => (list.length ? <VideoGrid items={list} /> : null);
  const fade = `transition-opacity duration-150 ease-out-quart motion-reduce:transition-none ${fading ? "opacity-0" : "opacity-100"}`;

  return (
    <div>
      {personal?.because ? (
        <Shelf title={`Because you liked ${personal.because.title}`}>
          <Row items={personal.because.items} />
        </Shelf>
      ) : null}
      {later.length ? (
        <Shelf title="Watch later" href="/later">
          <Row items={later} />
        </Shelf>
      ) : null}
      <div className={fade}>
        {grid(shown.slice(0, 6))}
        {topics}
        {grid(shown.slice(6, 15))}
        {playlists}
        {grid(shown.slice(15))}
      </div>
      {settled ? (
        request ? (
          <InfiniteFeed key={String(request.seed)} src="/api/feed" body={request} skip={[...onShelves]} start={personal?.items.length ?? 0} total={personal?.total ?? 0} kind="grid" />
        ) : (
          <InfiniteFeed key="default" src="/api/feed?path=%2F" start={items.length} total={total} kind="grid" />
        )
      ) : null}
    </div>
  );
}
