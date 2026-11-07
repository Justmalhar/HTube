import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { PlaylistSidebar } from "@/components/playlist-sidebar";
import { RankedList } from "@/components/ranked-list";
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
  return (
    <div>
      <PageHeader title={playlist.title} />
      <div className="flex flex-col gap-6 min-[801px]:flex-row">
        <PlaylistSidebar title={playlist.title} ids={entries.map((entry) => entry.card.vid)} list={slug} />
        <div className="min-w-0 flex-1">
          {playlist.intro || playlist.pitch ? <p className="mb-6 max-w-3xl text-sm">{playlist.intro || playlist.pitch}</p> : null}
          <RankedList
            items={entries.map(({ card, note }) => ({
              card,
              href: `/watch/${card.vid}?list=${slug}`,
              extra: note ? <p className="mt-2 line-clamp-3 text-sm">{note}</p> : null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
