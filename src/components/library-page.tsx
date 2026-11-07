"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { useLibrary } from "@/components/library";
import type { FeedCard } from "@/lib/types";

export function LibraryPage({ kind }: { kind: "likes" | "later" | "seen" }) {
  const library = useLibrary();
  const ids = kind === "likes" ? library.likes : kind === "later" ? library.later : [...library.seen].reverse();
  const idKey = ids.join(",");
  const [items, setItems] = useState<FeedCard[]>([]);
  const title = kind === "likes" ? "Liked" : kind === "later" ? "Watch later" : "History";
  const description = "Saved on this device";

  useEffect(() => {
    if (!idKey) return;
    const list = idKey.split(",");
    let cancel = false;
    void fetch(`/api/cards?ids=${idKey}`)
      .then((response) => response.json())
      .then((payload: { items: FeedCard[] }) => {
        if (cancel) return;
        const order = new Map(payload.items.map((item) => [item.vid, item]));
        setItems(list.flatMap((id) => order.get(id) ?? []));
      });
    return () => {
      cancel = true;
    };
  }, [idKey]);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={kind === "seen" && library.seen.length ? (
          <button type="button" className="h-9 w-32 rounded-[18px] bg-surface" onClick={() => library.clearHistory()}>Clear history</button>
        ) : null}
      />
      {idKey ? <VideoGrid items={items} /> : <p className="text-sm text-muted">Nothing saved yet</p>}
    </div>
  );
}
