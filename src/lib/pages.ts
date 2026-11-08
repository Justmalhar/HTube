import { PAGE, browse, buildFeed, relatedTo, search as searchCatalog } from "@/lib/engine";
import { pickExplore, type ExploreTopic } from "@/lib/explore";
import { parseFeedBody, type FeedLibrary } from "@/lib/feed-body";
import { browseFromParams, feedBase, first } from "@/lib/query";
import { getEngine } from "@/lib/server-catalog";

export { parseFeedBody };
export type Library = FeedLibrary;

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

/** Anonymous and server-rendered order: one shuffle per day. */
export const dailySeed = () => Math.floor(Date.now() / 86_400_000);
/** A new seed per request so every home load (and refresh) gets a different mix. */
export const freshSeed = () => Math.floor(Math.random() * 2 ** 32);

/** Explore picks for the home shelf: categories outside the viewer's likes and watch history. */
export function exploreTopics(seed: number, library?: Library): ExploreTopic[] {
  const engine = getEngine();
  const watched = new Set<string>();
  for (const id of [...(library?.likes ?? []), ...(library?.seen ?? [])]) for (const c of engine.byId.get(id)?.categories ?? []) watched.add(c);
  return pickExplore([...engine.categories.values()], watched, seed).map((c) => ({
    id: c.id,
    name: c.name,
    count: c.video_count,
    vid: browse(engine, { category: c.id, offset: 0, limit: 1 }).items[0]?.vid,
  }));
}

export function personalFeed(library: Library, seed: number, offset: number) {
  const engine = getEngine();
  const page = buildFeed(engine, { ...library, seed, offset, limit: PAGE });
  if (offset > 0) return { items: page.items, offset: page.offset, total: page.total };
  const liked = library.likes.findLast((id) => engine.byId.has(id));
  const because = liked ? { title: engine.byId.get(liked)!.title, items: relatedTo(engine, liked, library.dislikes, 12) } : null;
  const hidden = new Set(library.dislikes);
  const later = library.later
    .toReversed()
    .map((id) => engine.byId.get(id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card) && !hidden.has(card!.vid))
    .slice(0, 12);
  return {
    items: page.items,
    offset: page.offset,
    total: page.total,
    because: because?.items.length ? because : null,
    later,
    explore: exploreTopics(seed, library),
  };
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
    const seed = Number(first(search.seed)) || dailySeed();
    return buildFeed(getEngine(), { likes: [], dislikes: [], seen: [], seed, offset, limit: PAGE });
  }
  const base = feedBase(path);
  if (!base) return null;
  return path === "/search" ? searchPage(search).page : browsePage({ ...search, ...base }).page;
}
