import { notFound } from "next/navigation";

import { PlayIcon, pillClass } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { VideoCard } from "@/components/video-card";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const engine = getEngine();
  const playlist = engine.playlists.find((item) => item.slug === slug);
  if (!playlist) notFound();
  const ids = playlist.items.map((item) => item.vid).slice(0, 50).join(",");
  return (
    <div>
      <PageHeader
        title={playlist.title}
        description="In this order"
        actions={
          <a className={pillClass} href={`https://www.youtube.com/watch_videos?video_ids=${ids}`} target="_blank" rel="noreferrer">
            <PlayIcon />
            <span className="pr-1">Play</span>
          </a>
        }
      />
      <p className="mb-4 max-w-3xl text-sm">{playlist.intro || playlist.pitch}</p>
      <ol className="flex flex-col gap-4">
        {playlist.items.map((item, index) => {
          const card = engine.byId.get(item.vid);
          if (!card) return null;
          return (
            <li key={item.vid} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="pt-2 text-sm text-muted">{index + 1}</span>
              <div>
                <VideoCard item={card} />
                {item.note ? <p className="mt-2 text-sm">{item.note}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
