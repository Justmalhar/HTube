import { PageHeader } from "@/components/page-header";
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
            <h2 className="text-base font-medium">{title}</h2>
            <p className="mb-3 text-sm text-muted">{detail}</p>
            <ul className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
              {items.map((playlist) => (
                <li key={playlist.slug}>
                  <a href={`/p/${playlist.slug}`} className="block rounded-[16px] bg-surface p-3">
                    <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-[12px]">
                      {playlist.cover.slice(0, 4).map((vid) => (
                        <img key={vid} src={`https://i.ytimg.com/vi/${vid}/hq2.jpg`} alt="" className="aspect-video object-cover" />
                      ))}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-5">{playlist.title}</h3>
                    <p className="mt-1 text-sm text-muted">{playlist.items.length} videos</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{playlist.pitch}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
