"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { InfiniteFeed } from "@/components/infinite-feed";
import { useHydrated, useLibrary } from "@/components/library";
import { EmptyState, VideoGrid } from "@/components/video-card";
import { avatarColor } from "@/lib/comment-format";
import type { FeedCard } from "@/lib/types";

type Data = { key: string; items: FeedCard[]; total: number; channels: { slug: string; name: string }[] } | "error";

export function SubscriptionsFeed() {
  const { subs } = useLibrary();
  const ready = useHydrated();
  const key = subs.map(encodeURIComponent).join(",");
  const [data, setData] = useState<Data | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/subscriptions?slugs=${key}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: Omit<Extract<Data, object>, "key">) => setData({ key, ...json }))
      .catch(() => !controller.signal.aborted && setData("error"));
    return () => controller.abort();
  }, [key, attempt]);

  if (!ready) return null;
  if (!subs.length)
    return <EmptyState title="Don't miss new videos" body="Subscribe to channels to see their videos here" href="/categories" action="Browse channels" />;
  if (data === "error")
    return (
      <div className="grid place-items-center rounded-2xl bg-surface px-6 py-16 text-center">
        <p className="text-base font-medium">Couldn&apos;t load videos</p>
        <button type="button" className="mt-4 h-9 rounded-full bg-background px-4 text-sm font-medium hover:bg-surface-hover press" onClick={() => { setData(null); setAttempt((n) => n + 1); }}>
          Try again
        </button>
      </div>
    );
  if (!data || data.key !== key) return <div aria-hidden className="h-40 rounded-2xl bg-surface motion-safe:animate-pulse" />;

  return (
    <>
      <ul className="no-scrollbar -mx-1 mb-8 flex gap-4 overflow-x-auto px-1 pb-1">
        {data.channels.map((channel) => (
          <li key={channel.slug} className="w-20 shrink-0">
            <Link href={`/channel/${channel.slug}`} className="press flex flex-col items-center gap-2 text-center">
              <span
                aria-hidden
                className="grid size-14 place-items-center rounded-full text-xl font-medium text-white"
                style={{ backgroundColor: avatarColor(channel.name) }}
              >
                {channel.name.charAt(0).toUpperCase()}
              </span>
              <span className="line-clamp-2 w-full text-xs wrap-anywhere">{channel.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <VideoGrid items={data.items} />
      <InfiniteFeed key={key} src={`/api/subscriptions?slugs=${key}`} start={data.items.length} total={data.total} kind="grid" />
    </>
  );
}
