import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlayIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { countChipClass, videos } from "@/components/shelf";
import { headerActionClass } from "@/components/ui";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

const findPlaylist = (slug: string) => getEngine().playlists.find((item) => item.slug === slug);

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const playlist = findPlaylist((await params).slug);
  return playlist ? { title: playlist.title, description: playlist.pitch || undefined } : { title: "Not found" };
}

export default async function PlaylistPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const engine = getEngine();
  const playlist = findPlaylist(slug);
  if (!playlist) notFound();
  // Drop ids the catalogue no longer has, so numbering stays contiguous and Play matches the list.
  const entries = playlist.items.flatMap((item) => {
    const card = engine.byId.get(item.vid);
    return card ? [{ card, note: item.note }] : [];
  });
  const watch = (vid: string) => `/watch/${vid}?list=${slug}`;
  return (
    <div>
      <PageHeader
        title={playlist.title}
        actions={
          <>
            <span className={countChipClass}>{videos(entries.length)}</span>
            {entries.length ? (
              <a className={headerActionClass} href={watch(entries[0].card.vid)}>
                <PlayIcon />
                Play all
              </a>
            ) : null}
          </>
        }
      />
      {playlist.intro || playlist.pitch ? <p className="mb-6 max-w-3xl text-sm">{playlist.intro || playlist.pitch}</p> : null}
      <ol className="flex max-w-[1100px] flex-col gap-4">
        {entries.map(({ card, note }, index) => (
          <li key={card.vid} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 min-[801px]:grid-cols-[2rem_minmax(0,1fr)] min-[801px]:gap-3">
            <span className="pt-1 text-sm tabular-nums text-muted">{index + 1}</span>
            <article className="flex min-w-0 gap-3 min-[801px]:gap-4">
              <a href={watch(card.vid)} tabIndex={-1} aria-hidden className="block aspect-video w-[40%] max-w-[360px] shrink-0 overflow-hidden rounded-xl bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote ytimg thumbnails */}
                <img src={`https://i.ytimg.com/vi/${card.vid}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" className="size-full object-cover" />
              </a>
              <div className="min-w-0 flex-1">
                <a href={watch(card.vid)} className="block rounded-md">
                  <h2 className="line-clamp-2 wrap-anywhere text-sm font-medium leading-5 min-[801px]:text-lg min-[801px]:font-normal min-[801px]:leading-[26px]">{card.title}</h2>
                </a>
                <a href={`/channel/${card.channelSlug}`} className="mt-1 block truncate text-xs text-muted hover:text-foreground min-[801px]:mt-2">
                  {card.channel}
                </a>
                {note ? <p className="mt-2 line-clamp-3 text-sm">{note}</p> : null}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
