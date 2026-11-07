import type { Playlist } from "@/lib/types";
import { ChevronIcon, PlayIcon } from "@/components/icons";
import { ShelfScroller } from "@/components/shelf-scroller";

const thumb = (vid: string) => `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

export function Shelf({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="my-8 border-t border-line pt-6 first:mt-2 first:border-t-0">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold tracking-[-0.2px]">{title}</h2>
        {href ? (
          <a href={href} className="ml-auto inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium hover:bg-surface">
            View all
            <ChevronIcon />
          </a>
        ) : null}
      </div>
      <ShelfScroller>{children}</ShelfScroller>
    </section>
  );
}

export function TopicTile({ href, name, count, vid }: { href: string; name: string; count: number; vid?: string }) {
  return (
    <li className="w-[240px] shrink-0 snap-start min-[801px]:w-[280px]">
      <a href={href} className="group/tile relative block aspect-video overflow-hidden rounded-xl bg-surface">
        {vid ? <img src={thumb(vid)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-105" /> : null}
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="block text-base font-bold leading-5">{name}</span>
          <span className="mt-1 block text-xs text-white/80">{count} videos</span>
        </span>
      </a>
    </li>
  );
}

export function PlaylistTile({ playlist, wide = false }: { playlist: Playlist; wide?: boolean }) {
  const cover = playlist.cover[0] ?? playlist.items[0]?.vid;
  const body = (
    <a href={`/p/${playlist.slug}`} className="group/tile block">
      <div className="relative pt-2">
        <span className="absolute inset-x-4 top-0 h-3 rounded-t-xl bg-surface-hover" />
        <span className="absolute inset-x-2 top-1 h-3 rounded-t-xl bg-line" />
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
          {cover ? <img src={thumb(cover)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]" /> : null}
          <span className="absolute bottom-2 right-2 inline-flex h-6 items-center gap-1 rounded-md bg-black/80 px-1.5 text-xs font-medium text-white">
            <PlayIcon />
            {playlist.items.length} videos
          </span>
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 text-[15px] font-medium leading-[21px]">{playlist.title}</h3>
      {playlist.pitch ? <p className="mt-1 line-clamp-2 text-sm text-muted">{playlist.pitch}</p> : null}
    </a>
  );
  if (wide) return <li>{body}</li>;
  return <li className="w-[240px] shrink-0 snap-start min-[801px]:w-[280px]">{body}</li>;
}
