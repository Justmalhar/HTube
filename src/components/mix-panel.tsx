"use client";

import { useLibrary } from "@/components/library";
import { PlaylistPanel, type PanelItem } from "@/components/playlist-panel";

/** Mix list: current video first, then the chain; videos marked "not for me" are left out. */
export function MixPanel({ title, items }: { title: string; items: PanelItem[] }) {
  const { dislikes } = useLibrary();
  const shown = items.filter((item, position) => position === 0 || !dislikes.includes(item.vid));
  return <PlaylistPanel slug="mix" title={`Mix: ${title}`} items={shown} index={0} label="Mix" query="mix=1" titleHref={null} />;
}
