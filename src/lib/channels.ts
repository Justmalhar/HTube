// Derived channel and topic data. Pure (no server-only imports) so bun test can run it;
// results are memoized per Engine instance, which is rebuilt only when the catalog changes.
import type { Engine } from "@/lib/engine";
import type { Card, Mention } from "@/lib/types";

export type ChannelRef = { slug: string; name: string; count: number };

const memo = new WeakMap<Engine, Map<string, unknown>>();
function cached<T>(engine: Engine, key: string, make: () => T): T {
  let m = memo.get(engine);
  if (!m) memo.set(engine, (m = new Map()));
  if (!m.has(key)) m.set(key, make());
  return m.get(key) as T;
}

const tally = <K>(keys: Iterable<K>) => {
  const map = new Map<K, number>();
  for (const k of keys) map.set(k, (map.get(k) ?? 0) + 1);
  return map;
};
const desc = <K>(map: Map<K, number>) => [...map].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

function byChannel(engine: Engine) {
  return cached(engine, "by-channel", () => {
    const map = new Map<string, Card[]>();
    for (const card of engine.cards) {
      const list = map.get(card.channelSlug);
      if (list) list.push(card);
      else map.set(card.channelSlug, [card]);
    }
    return map;
  });
}

export function channelCards(engine: Engine, slug: string): Card[] {
  return byChannel(engine).get(slug) ?? [];
}

export function channelStats(engine: Engine, slug: string) {
  return cached(engine, `stats:${slug}`, () => {
    const cards = channelCards(engine, slug);
    const topics = desc(tally(cards.flatMap((c) => c.categories))).slice(0, 8).map(([id, count]) => ({ id, name: engine.categories.get(id)?.name ?? id, count }));
    return {
      name: cards[0]?.channel ?? slug,
      videos: cards.length,
      comments: cards.reduce((sum, c) => sum + c.mentions, 0),
      firstYear: Math.min(...cards.map((c) => c.firstYear)),
      lastYear: Math.max(...cards.map((c) => c.lastYear)),
      topics,
      format: desc(tally(cards.map((c) => c.contentType)))[0]?.[0] ?? "",
    };
  });
}

const FORMATS: Record<string, string> = { talk: "Talks", lecture: "Lectures", course: "Courses", explainer: "Explainers", documentary: "Documentaries", interview: "Interviews", tutorial: "Tutorials", demo: "Demos", commentary: "Commentary", comedy: "Comedy", music: "Music" };

/** "Courses on Pure mathematics and Recreational math", or null when the data gives nothing to say. */
export function channelDescription(stats: ReturnType<typeof channelStats>): string | null {
  const names = stats.topics.slice(0, 2).map((t) => t.name);
  if (!names.length) return null;
  const head = FORMATS[stats.format] ?? "Videos";
  return `${head} on ${names.join(" and ")}`;
}

export function channelsFor(engine: Engine, key: string, pick: (card: Card) => boolean, limit = 12): ChannelRef[] {
  return cached(engine, `top:${key}:${limit}`, () => {
    const names = new Map<string, string>();
    const counts = tally(
      engine.cards.filter(pick).map((c) => {
        names.set(c.channelSlug, c.channel);
        return c.channelSlug;
      }),
    );
    return desc(counts).slice(0, limit).map(([slug, count]) => ({ slug, name: names.get(slug) ?? slug, count }));
  });
}

export const topChannelsInCategory = (engine: Engine, id: string) => channelsFor(engine, `c:${id}`, (c) => c.categories.includes(id));
export const topChannelsInArea = (engine: Engine, areaId: string) => {
  const ids = new Set(engine.areas.find((a) => a.id === areaId)?.categories.map((c) => c.id));
  return channelsFor(engine, `a:${areaId}`, (c) => c.categories.some((id) => ids.has(id)));
};

/** Same-area siblings first, then categories that share the most videos with this one. */
export function relatedCategories(engine: Engine, id: string, limit = 14) {
  return cached(engine, `rel-cat:${id}:${limit}`, () => {
    const area = engine.areas.find((a) => a.categories.some((c) => c.id === id));
    const siblings = (area?.categories ?? []).filter((c) => c.id !== id).map((c) => ({ id: c.id, name: c.name }));
    const co = desc(tally(engine.cards.filter((c) => c.categories.includes(id)).flatMap((c) => c.categories.filter((x) => x !== id))))
      .map(([cid]) => ({ id: cid, name: engine.categories.get(cid)?.name ?? cid }));
    const seen = new Set<string>();
    return [...siblings, ...co].filter((c) => !seen.has(c.id) && seen.add(c.id)).slice(0, limit);
  });
}

/** Channels whose videos are most co-recommended with this channel's top videos. */
export function similarChannels(engine: Engine, slug: string, limit = 10): ChannelRef[] {
  return cached(engine, `similar:${slug}:${limit}`, () => {
    const top = channelCards(engine, slug).toSorted((a, b) => b.score - a.score).slice(0, 10);
    const weight = new Map<string, number>();
    const names = new Map<string, string>();
    for (const card of top)
      for (const edge of engine.related.get(card.vid) ?? []) {
        const other = engine.byId.get(edge.vid);
        if (!other || other.channelSlug === slug) continue;
        names.set(other.channelSlug, other.channel);
        weight.set(other.channelSlug, (weight.get(other.channelSlug) ?? 0) + edge.shared_recommenders);
      }
    return desc(weight).slice(0, limit).map(([s, count]) => ({ slug: s, name: names.get(s) ?? s, count }));
  });
}

/** Top commenters who mentioned this channel's videos. */
export function curators(engine: Engine, mentionsOf: (vid: string) => Mention[], slug: string, limit = 5) {
  return cached(engine, `cur:${slug}:${limit}`, () =>
    desc(tally(channelCards(engine, slug).flatMap((c) => mentionsOf(c.vid).map((m) => m.author)))).slice(0, limit).map(([author, count]) => ({ author, count })),
  );
}

export const activeSpan = (first: number, last: number) => (first === last ? `${first}` : `${first} to ${last}`);
