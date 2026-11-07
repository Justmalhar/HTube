import type { Category } from "@/lib/types";

export type ExploreTopic = { id: string; name: string; count: number; vid?: string };

const PER_AREA = 2;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded weighted sample of categories outside `watched`, at most 2 per area. Weight is video_count,
 * via Efraimidis-Spirakis keys (u^(1/w)), so populous categories win more often but not always.
 */
export function pickExplore(categories: Category[], watched: Set<string>, seed: number, n = 11): Category[] {
  const next = rng(seed ^ 0x51ed270b);
  const keyed = categories
    .filter((c) => c.video_count > 0 && !watched.has(c.id))
    .map((c) => ({ c, key: Math.pow(Math.max(next(), 1e-9), 1 / c.video_count) }))
    .sort((a, b) => b.key - a.key || a.c.id.localeCompare(b.c.id));
  const perArea = new Map<string, number>();
  const out: Category[] = [];
  for (const { c } of keyed) {
    const used = perArea.get(c.area_id) ?? 0;
    if (used >= PER_AREA) continue;
    perArea.set(c.area_id, used + 1);
    out.push(c);
    if (out.length === n) break;
  }
  return out;
}
