import { PAGE, browse, buildFeed, search as searchCatalog } from "@/lib/engine";
import { browseFromParams, feedBase, first } from "@/lib/query";
import { getEngine } from "@/lib/server-catalog";

export function paramsRecord(search: Record<string, string | string[] | undefined>) {
  const record: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(search)) record[key] = first(value) || undefined;
  return record;
}

export function browsePage(search: Record<string, string | string[] | undefined>) {
  const record = paramsRecord(search);
  const query = browseFromParams(new URLSearchParams(Object.entries(record).filter((entry): entry is [string, string] => Boolean(entry[1]))));
  return { record, query, page: browse(getEngine(), query) };
}

export function homeFeed() {
  return buildFeed(getEngine(), { likes: [], dislikes: [], seen: [], offset: 0, limit: 24 });
}

export function searchPage(search: Record<string, string | string[] | undefined>) {
  const record = paramsRecord(search);
  const query = browseFromParams(new URLSearchParams(Object.entries(record).filter((entry): entry is [string, string] => Boolean(entry[1]))));
  const q = record.q?.trim() ?? "";
  return { record, q, page: searchCatalog(getEngine(), { ...query, q }) };
}

/** The batch a feed page renders at `search.offset`, or null when `path` has no feed. Mirrors the page files. */
export function feedPage(path: string, search: Record<string, string | string[] | undefined>) {
  // Home continues its own feed order (classics, recent, gems, then everything else) as you scroll.
  if (path === "/") {
    const offset = Number(first(search.offset)) || 0;
    return buildFeed(getEngine(), { likes: [], dislikes: [], seen: [], offset, limit: PAGE });
  }
  const base = feedBase(path);
  if (!base) return null;
  return path === "/search" ? searchPage(search).page : browsePage({ ...search, ...base }).page;
}
