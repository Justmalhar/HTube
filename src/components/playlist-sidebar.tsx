"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlayIcon, ShuffleIcon } from "@/components/icons";
import { pillClass, primaryPillClass } from "@/components/ui";
import { videos } from "@/lib/format";

/** Playlist side block shared by /p/<slug>, Watch later and Liked: cover, title, count, Play all, Shuffle. */
export function PlaylistSidebar({ title, ids, list }: { title: string; ids: string[]; /** Playlist slug, carried into watch links. */ list?: string }) {
  const router = useRouter();
  if (!ids.length) return null;
  const watch = (vid: string) => `/watch/${vid}${list ? `?list=${list}` : ""}`;
  const shuffle = () => router.push(watch(ids[Math.floor(Math.random() * ids.length)]));
  return (
    <aside className="flex flex-col gap-4 rounded-2xl bg-surface p-4 min-[801px]:sticky min-[801px]:top-20 min-[801px]:w-[340px] min-[801px]:shrink-0 min-[801px]:self-start">
      <Link href={watch(ids[0])} prefetch={false} className="block aspect-video overflow-hidden rounded-xl bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnail */}
        <img src={`https://i.ytimg.com/vi/${ids[0]}/hqdefault.jpg`} alt="" className="size-full object-cover" />
      </Link>
      <div>
        <h2 className="text-xl font-bold leading-7 wrap-anywhere">{title}</h2>
        <p className="mt-1 text-sm text-muted tabular-nums">{videos(ids.length)}</p>
      </div>
      <div className="flex gap-2 *:flex-1">
        <Link href={watch(ids[0])} prefetch={false} className={primaryPillClass}>
          <PlayIcon />
          Play all
        </Link>
        <button type="button" className={pillClass} onClick={shuffle}>
          <ShuffleIcon />
          Shuffle
        </button>
      </div>
    </aside>
  );
}
