import { PlayIcon } from "@/components/icons";
import { Section } from "@/components/section";
import { ShelfScroller } from "@/components/shelf-scroller";
import { tileWidth } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { videos } from "@/lib/format";
import type { FeedCard, Playlist } from "@/lib/types";

const thumb = (vid: string) => `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
const zoom =
  "size-full object-cover transition-transform duration-300 ease-out-quart motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100";
// Moved to ui.ts and lib/format.ts; re-exported so existing imports keep working.
export { countChipClass } from "@/components/ui";
export { videos } from "@/lib/format";

export function Shelf({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <Section title={title} href={href}>
      <ShelfScroller>{children}</ShelfScroller>
    </Section>
  );
}

/** Shelf of video cards, one tile width everywhere. Renders nothing when empty. */
export function CardShelf({ title, href, items }: { title: string; href?: string; items: FeedCard[] }) {
  if (!items.length) return null;
  return (
    <Shelf title={title} href={href}>
      {items.map((item) => (
        <li key={item.vid} className={tileWidth}>
          <VideoCard item={item} />
        </li>
      ))}
    </Shelf>
  );
}

export function TopicTile({ href, name, count, vid }: { href: string; name: string; count: number; vid?: string }) {
  return (
    <li className={tileWidth}>
      <a href={href} className="group/tile relative block aspect-video overflow-hidden rounded-xl bg-surface press">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnails */}
        {vid ? <img src={thumb(vid)} alt="" width={480} height={360} loading="lazy" decoding="async" className={`${zoom} group-hover/tile:scale-[1.03]`} /> : null}
        <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="line-clamp-2 wrap-anywhere text-base font-bold leading-5">{name}</span>
          <span className="mt-1 block text-xs text-white/80">{videos(count)}</span>
        </span>
      </a>
    </li>
  );
}

export function PlaylistTile({ playlist, wide = false }: { playlist: Playlist; wide?: boolean }) {
  const cover = playlist.cover[0] ?? playlist.items[0]?.vid;
  const body = (
    <a href={`/p/${playlist.slug}`} className="group/tile block rounded-xl press">
      <div className="relative pt-2">
        <span className="absolute inset-x-4 top-0 h-3 rounded-t-xl bg-surface-hover" />
        <span className="absolute inset-x-2 top-1 h-3 rounded-t-xl bg-line" />
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnails */}
          {cover ? <img src={thumb(cover)} alt="" width={480} height={360} loading="lazy" decoding="async" className={`${zoom} group-hover/tile:scale-[1.03]`} /> : null}
          <span className="absolute bottom-2 right-2 inline-flex h-6 items-center gap-1 rounded-md bg-black/80 px-1.5 text-xs font-medium text-white">
            <PlayIcon />
            {videos(playlist.items.length)}
          </span>
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 wrap-anywhere text-base font-medium leading-[22px]">{playlist.title}</h3>
      <p className="mt-1 text-sm text-muted">View full playlist</p>
    </a>
  );
  if (wide) return <li>{body}</li>;
  return <li className={tileWidth}>{body}</li>;
}
