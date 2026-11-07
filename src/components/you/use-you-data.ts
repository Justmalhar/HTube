"use client";

import { useEffect, useState } from "react";

import type { FeedCard } from "@/lib/types";

export type Channel = { slug: string; name: string };

const SHELF = 12;

/** Cards for the newest ids of each list, plus subscribed channel names. Failures leave a shelf empty. */
export function useYouData(history: string[], later: string[], likes: string[], subs: string[]) {
  const [cards, setCards] = useState<Record<string, FeedCard>>({});
  const [channels, setChannels] = useState<Channel[]>([]);
  const ids = [...new Set([...history, ...later, ...likes].slice(0, 3 * SHELF))].sort().join(",");
  const subKey = subs.map(encodeURIComponent).join(",");

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    fetch(`/api/cards?ids=${ids.split(",").map(encodeURIComponent).join(",")}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { items: FeedCard[] }) => setCards(Object.fromEntries(json.items.map((item) => [item.vid, item]))))
      .catch(() => {});
    return () => controller.abort();
  }, [ids]);

  useEffect(() => {
    if (!subKey) return;
    const controller = new AbortController();
    fetch(`/api/subscriptions?slugs=${subKey}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { channels: Channel[] }) => setChannels(json.channels))
      .catch(() => {});
    return () => controller.abort();
  }, [subKey]);

  return { cards, channels: subs.length ? channels : [], SHELF };
}
