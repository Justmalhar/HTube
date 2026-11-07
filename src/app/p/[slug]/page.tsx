import { notFound } from "next/navigation";

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
        description={`${playlist.items.length} videos, in order`}
        actions={
          <a className="inline-flex h-9 items-center rounded-[18px] bg-surface px-4" href={`https://www.youtube.com/watch_videos?video_ids=${ids}`} target="_blank" rel="noreferrer">
            Play on YouTube
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
