import type { BrowseQuery, FeedQuery } from "@/lib/types";
import { PAGE } from "@/lib/engine";

const SORTS = new Set(["hn", "recent", "title"]);

export function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function browseFromParams(params: URLSearchParams): BrowseQuery {
  const sort = params.get("sort") ?? "hn";
  const gems = params.get("gems");
  return {
    type: params.get("type") || undefined,
    level: params.get("level") || undefined,
    area: params.get("area") || undefined,
    category: params.get("category") || undefined,
    channel: params.get("channel") || undefined,
    shelf: params.get("shelf") || undefined,
    evergreen: params.get("evergreen") === "1",
    gems: gems === "insistent" || gems === "1" ? "insistent" : "",
    sort: SORTS.has(sort) ? (sort as BrowseQuery["sort"]) : "hn",
    news: params.get("news") === "show" ? "show" : "hide",
    cited: params.get("cited") === "show" ? "show" : "hide",
    offset: Math.max(0, Number(params.get("offset") ?? "0") || 0),
    limit: PAGE,
  };
}

export function unsupportedFilters(params: URLSearchParams): string[] {
  const notes: string[] = [];
  if (params.get("dur")) notes.push("Length filters need YouTube durations, which this catalogue does not ship.");
  if (params.get("date")) notes.push("Upload year stays on YouTube. It is not part of the shared catalogue.");
  const sort = params.get("sort");
  if (sort === "views" || sort === "date" || sort === "old" || sort === "liked") {
    notes.push("That sort uses YouTube stats. This app sorts by HN recommendations, recency on HN, or title.");
  }
  if (params.get("gems") === "1") {
    notes.push("HackerTube's hidden gems are under 100k views. View counts are not included, so this is the stand-in: few mentions, mostly strong recommendations.");
  }
  return notes;
}

export function withQuery(path: string, current: URLSearchParams, patch: Record<string, string>): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (!value) next.delete(key);
    else next.set(key, value);
  }
  next.delete("offset");
  const qs = next.toString();
  return qs ? `${path}?${qs}` : path;
}

export function feedQuery(input: { likes: string[]; dislikes: string[]; seen: string[] }, offset: number): FeedQuery {
  return { ...input, offset, limit: PAGE };
}
