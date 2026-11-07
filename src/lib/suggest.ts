import type { Engine } from "@/lib/engine";

export type Suggestion = { kind: "query" | "channel" | "topic"; text: string; href: string };

export const MAX_Q = 80;
const LIMIT = 10;
const QUOTA = { channel: 2, topic: 2 };

const channelCache = new WeakMap<Engine, { name: string; slug: string; score: number }[]>();

function channels(engine: Engine) {
  let rows = channelCache.get(engine);
  if (!rows) {
    const by = new Map<string, { name: string; slug: string; score: number }>();
    for (const card of engine.cards) {
      const row = by.get(card.channelSlug);
      if (row) row.score = Math.max(row.score, card.score);
      else by.set(card.channelSlug, { name: card.channel, slug: card.channelSlug, score: card.score });
    }
    rows = [...by.values()];
    channelCache.set(engine, rows);
  }
  return rows;
}

/** 0 prefix, 1 word start, 2 substring, -1 no match. */
export function rankText(text: string, q: string): number {
  const t = text.toLowerCase();
  const i = t.indexOf(q);
  if (i < 0) return -1;
  if (i === 0) return 0;
  for (let at = i; at >= 0; at = t.indexOf(q, at + 1)) {
    if (/[^\p{L}\p{N}]/u.test(t[at - 1] ?? "")) return 1;
  }
  return 2;
}

type Hit = Suggestion & { rank: number; score: number };

function top(hits: Hit[], n: number) {
  return hits.sort((a, b) => a.rank - b.rank || b.score - a.score || a.text.localeCompare(b.text)).slice(0, n);
}

/** Typeahead: video titles, channels and topics. Matches by prefix, then word start, then substring; ties by card score. */
export function suggest(engine: Engine, input: string): Suggestion[] {
  const q = input.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_Q);
  if (!q) return [];
  const titles: Hit[] = [];
  const seen = new Set<string>();
  for (const card of engine.cards) {
    if (card.recommenders <= 0 || card.shelfLife === "news") continue;
    const rank = rankText(card.title, q);
    if (rank < 0) continue;
    const key = card.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push({ kind: "query", text: card.title, href: "", rank, score: card.score });
  }
  const chans: Hit[] = [];
  for (const c of channels(engine)) {
    const rank = rankText(c.name, q);
    if (rank >= 0) chans.push({ kind: "channel", text: c.name, href: `/channel/${c.slug}`, rank, score: c.score });
  }
  const topics: Hit[] = [];
  for (const c of engine.categories.values()) {
    const rank = rankText(c.name, q);
    if (rank >= 0) topics.push({ kind: "topic", text: c.name, href: `/c/${c.id}`, rank, score: c.video_count });
  }
  const picked = [...top(chans, QUOTA.channel), ...top(topics, QUOTA.topic)];
  const rest = top(titles, LIMIT - picked.length);
  return [...picked, ...rest]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, LIMIT)
    .map(({ kind, text, href }) => ({ kind, text, href: href || `/search?${new URLSearchParams({ q: text })}` }));
}
