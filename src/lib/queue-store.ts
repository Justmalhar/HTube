"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "oht.queue";
const META = "oht.queue.meta";
const EVENT = "oht:queue";

export type QueueItem = { vid: string; title: string; channel: string };

function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify);
  return () => window.removeEventListener(EVENT, notify);
}

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

function parse<T>(raw: string, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(ids: string[], meta: Record<string, QueueItem>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids));
    sessionStorage.setItem(META, JSON.stringify(meta));
  } catch {
    // Storage can be blocked; the queue just will not persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

const current = () => ({ ids: parse<string[]>(read(KEY), []), meta: parse<Record<string, QueueItem>>(read(META), {}) });

export function addToQueue(item: QueueItem) {
  const { ids, meta } = current();
  if (!ids.includes(item.vid)) write(ids.concat(item.vid), { ...meta, [item.vid]: item });
}

export function removeFromQueue(vid: string) {
  const { ids, meta } = current();
  if (ids.includes(vid)) write(ids.filter((id) => id !== vid), meta);
}

export const clearQueue = () => write([], {});

/** Queued videos in play order (empty on the server). */
export function useQueue(): QueueItem[] {
  const ids = useSyncExternalStore(subscribe, () => read(KEY), () => "");
  const meta = useSyncExternalStore(subscribe, () => read(META), () => "");
  return useMemo(() => {
    const info = parse<Record<string, QueueItem>>(meta, {});
    return parse<string[]>(ids, []).map((vid) => info[vid] ?? { vid, title: "Queued video", channel: "" });
  }, [ids, meta]);
}
