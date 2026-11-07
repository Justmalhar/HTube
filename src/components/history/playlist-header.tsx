"use client";

import { useRouter } from "next/navigation";

import { PlayIcon, ShuffleIcon } from "@/components/icons";
import { videos } from "@/components/shelf";
import { pillClass, pillOnClass } from "@/components/ui";

/** Playlist-style block for Watch later and Liked: cover, title, count, Play all, Shuffle. */
export function PlaylistHeader({ title, ids }: { title: string; ids: string[] }) {
  const router = useRouter();
  const first = ids[0];
  const shuffle = () => router.push(`/watch/${ids[Math.floor(Math.random() * ids.length)]}`);
  return (
    <aside className="flex flex-col gap-4 rounded-2xl bg-surface p-4 min-[801px]:sticky min-[801px]:top-20 min-[801px]:w-[340px] min-[801px]:shrink-0 min-[801px]:self-start">
      <a href={`/watch/${first}`} className="block aspect-video overflow-hidden rounded-xl bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnail */}
        <img src={`https://i.ytimg.com/vi/${first}/hqdefault.jpg`} alt="" className="size-full object-cover" />
      </a>
      <div>
        <h2 className="text-xl font-bold leading-7 wrap-anywhere">{title}</h2>
        <p className="mt-1 text-sm text-muted tabular-nums">{videos(ids.length)}</p>
      </div>
      <div className="flex gap-2 *:flex-1">
        <a href={`/watch/${first}`} className={pillOnClass}>
          <PlayIcon />
          Play all
        </a>
        <button type="button" className={pillClass} onClick={shuffle}>
          <ShuffleIcon />
          Shuffle
        </button>
      </div>
    </aside>
  );
}
