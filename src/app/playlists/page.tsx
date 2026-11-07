import { PageHeader } from "@/components/page-header";
import { PlaylistTile } from "@/components/shelf";
import { gridClass } from "@/components/ui";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default function Playlists() {
  const playlists = getEngine().playlists;
  const groups = [
    ["start", "Start here", "Short lists for a first visit"],
    ["deep", "Deep dives", "One subject, in a set order"],
  ] as const;
  return (
    <div>
      <PageHeader title="Playlists" description="Watch them in order" />
      {groups.map(([tier, title, detail]) => {
        const items = playlists.filter((playlist) => (playlist.tier || "deep") === tier);
        if (!items.length) return null;
        return (
          <section key={tier} className="mb-8">
            <h2 className="text-xl font-bold tracking-[-0.2px]">{title}</h2>
            <p className="mb-4 text-sm text-muted">{detail}</p>
            <ul className={gridClass}>
              {items.map((playlist) => (
                <PlaylistTile key={playlist.slug} playlist={playlist} wide />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
