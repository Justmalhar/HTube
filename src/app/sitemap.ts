import type { MetadataRoute } from "next";

import { getEngine } from "@/lib/server-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const engine = getEngine();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPaths = ["", "/browse", "/categories", "/playlists", "/about", "/data", "/settings"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}` })),
    ...engine.areas.map((area) => ({ url: `${base}/a/${area.id}` })),
    ...[...engine.categories.keys()].map((id) => ({ url: `${base}/c/${id}` })),
    ...engine.playlists.map((playlist) => ({ url: `${base}/p/${playlist.slug}` })),
    ...engine.cards.map((card) => ({ url: `${base}/watch/${card.vid}` })),
  ];
}
