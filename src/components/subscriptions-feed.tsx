"use client";

import { useEffect, useState } from "react";

import { AvatarRow } from "@/components/channel/avatar-row";
import { InfiniteFeed } from "@/components/infinite-feed";
import { useHydrated, useLibrary } from "@/components/library";
import { StatusPanel } from "@/components/status-panel";
import { EmptyState, VideoGrid } from "@/components/video-card";
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
      <StatusPanel title="Couldn't load videos" action={{ label: "Try again", onClick: () => { setData(null); setAttempt((n) => n + 1); } }} />
    );
  if (!data || data.key !== key) return <div aria-hidden className="h-40 rounded-2xl bg-surface motion-safe:animate-pulse" />;

  return (
    <>
      <AvatarRow
        label="Subscribed channels"
        className="mb-8"
        items={data.channels.map((channel) => ({ href: `/channel/${channel.slug}`, name: channel.name }))}
      />
      <VideoGrid items={data.items} />
      <InfiniteFeed key={key} src={`/api/subscriptions?slugs=${key}`} start={data.items.length} total={data.total} kind="grid" />
    </>
  );
}
