"use client";

import { clearQueue, useQueue } from "@/lib/queue-store";

export function QueuePanel() {
  const queue = useQueue();
  if (!queue.length) return null;
  return (
    <section aria-label="Queue" className="overflow-hidden rounded-xl border border-line bg-surface/40">
      <header className="flex items-center gap-1 bg-surface py-2 pl-3 pr-2">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold leading-6">Queue</h2>
          <p className="text-xs text-muted tabular-nums">{queue.length} {queue.length === 1 ? "video" : "videos"}</p>
        </div>
        <button type="button" className="press h-8 rounded-full px-3 text-sm font-medium hover:bg-surface-hover" onClick={clearQueue}>
          Clear
        </button>
      </header>
      <ol className="max-h-[240px] overflow-y-auto">
        {queue.map((item, position) => (
          <li key={item.vid}>
            <a href={`/watch/${item.vid}`} className="flex min-w-0 items-center gap-2 py-2 pl-1 pr-3 hover:bg-surface-hover">
              <span className="grid w-6 shrink-0 place-items-center text-xs tabular-nums text-muted">{position + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnails */}
              <img src={`https://i.ytimg.com/vi/${item.vid}/default.jpg`} alt="" width={96} height={72} loading="lazy" decoding="async" className="aspect-video w-[100px] shrink-0 rounded-md bg-surface object-cover" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-5 wrap-anywhere">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">{item.channel}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
