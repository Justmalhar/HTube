import { PAGE, buildFeed } from "@/lib/engine";
import { freshSeed, exploreTopics } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";
import { HomeFeed } from "@/components/home/home-feed";
import { PlaylistTile, Shelf } from "@/components/shelf";
import { ChipBar } from "@/components/filters";

export const dynamic = "force-dynamic";

const CHIPS = [
  { href: "/", label: "All", on: true },
  { href: "/browse?type=talk", label: "Talks" },
  { href: "/browse?type=lecture", label: "Lectures" },
  { href: "/browse?type=explainer", label: "Explainers" },
  { href: "/browse?type=documentary", label: "Documentaries" },
  { href: "/browse?type=interview", label: "Interviews" },
  { href: "/browse?type=tutorial", label: "Tutorials" },
  { href: "/browse?type=demo", label: "Demos" },
  { href: "/browse?dur=xlong", label: "Longs" },
  { href: "/browse?gems=insistent", label: "Hidden gems" },
  { href: "/browse?sort=recent", label: "Recently shared" },
];

export default function Home() {
  const engine = getEngine();
  const feed = buildFeed(engine, { likes: [], dislikes: [], seen: [], seed: freshSeed(), offset: 0, limit: PAGE });
  const playlists = engine.playlists.filter((playlist) => (playlist.tier || "deep") === "start").concat(
    engine.playlists.filter((playlist) => (playlist.tier || "deep") !== "start"),
  );
  return (
    <div>
      <ChipBar label="Formats" chips={CHIPS} sticky />
      <HomeFeed
        items={feed.items}
        explore={exploreTopics(freshSeed())}
        total={feed.total}
        playlists={
          <Shelf title="Playlists" href="/playlists">
            {playlists.slice(0, 12).map((playlist) => (
              <PlaylistTile key={playlist.slug} playlist={playlist} />
            ))}
          </Shelf>
        }
      />
    </div>
  );
}
