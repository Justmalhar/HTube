import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlayIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { countChipClass, videos } from "@/components/shelf";
import { headerActionClass } from "@/components/ui";
import { VideoRow } from "@/components/video-card";
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
  // YouTube's anonymous playlist URL accepts up to 50 ids.
  const ids = entries.slice(0, 50).map(({ card }) => card.vid).join(",");
  return (
    <div>
      <PageHeader
        title={playlist.title}
        actions={
          <>
            <span className={countChipClass}>{videos(entries.length)}</span>
            {ids ? (
              <a className={headerActionClass} href={`https://www.youtube.com/watch_videos?video_ids=${ids}`} target="_blank" rel="noreferrer">
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
            <VideoRow item={card}>
              {note ? <p className="mt-2 line-clamp-3 text-sm">{note}</p> : null}
            </VideoRow>
          </li>
        ))}
      </ol>
    </div>
  );
}
