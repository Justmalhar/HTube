import type { Metadata } from "next";

import { ChipBar } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { PlaylistTile } from "@/components/shelf";
import { gridClass } from "@/components/ui";
import { first } from "@/lib/query";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Playlists" };

const GROUPS = [
  ["start", "Start here"],
  ["deep", "Deep dives"],
] as const;

const tierOf = (tier: string | undefined) => tier || "deep";

export default async function Playlists({ searchParams }: PageProps<"/playlists">) {
  const playlists = getEngine().playlists;
  const wanted = first((await searchParams).tier);
  const tier = GROUPS.some(([id]) => id === wanted) ? wanted : "";
  // "Start here" first in the All view, matching the home shelf.
  const items = (tier ? playlists.filter((playlist) => tierOf(playlist.tier) === tier) : playlists).toSorted(
    (a, b) => Number(tierOf(b.tier) === "start") - Number(tierOf(a.tier) === "start"),
  );
  const chips = [
    { href: "/playlists", label: "All", on: !tier },
    ...GROUPS.filter(([id]) => playlists.some((playlist) => tierOf(playlist.tier) === id)).map(([id, label]) => ({
      href: `/playlists?tier=${id}`,
      label,
      on: tier === id,
    })),
  ];
  return (
    <div>
      <PageHeader title="Playlists" />
      <ChipBar label="Playlist groups" chips={chips} sticky />
      <ul className={gridClass}>
        {items.map((playlist) => (
          <PlaylistTile key={playlist.slug} playlist={playlist} wide />
        ))}
      </ul>
    </div>
  );
}
