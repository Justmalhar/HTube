export type TrendMention = { vid: string; month: string; author: string; stance: string };
export type Trending = { vid: string; score: number; lastYear: number };

const WEIGHT: Record<string, number> = { strong_rec: 2, rec: 1.5, reference: 0.5, critical: 0.25, joke: 0 };
const WINDOW = 24;
const HALF_LIFE = 6;

const idx = (month: string) => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7));

/**
 * Per video, over the 24 months ending at the newest month in the data:
 * sum(stanceWeight * 0.5^(ageMonths / 6)), times (1 + 0.1 * min(distinct recent recommenders, 10)),
 * divided by (1 + allTimeMentions)^0.35 so evergreen giants do not always win.
 * lastYear is the count of mentions in the final 12 months.
 */
export function rankTrending(mentions: TrendMention[]): Trending[] {
  if (!mentions.length) return [];
  const now = Math.max(...mentions.map((m) => idx(m.month)));
  const by = new Map<string, { sum: number; all: number; last: number; people: Set<string> }>();
  for (const m of mentions) {
    const e = by.get(m.vid) ?? { sum: 0, all: 0, last: 0, people: new Set<string>() };
    by.set(m.vid, e);
    e.all++;
    const age = now - idx(m.month);
    if (age >= WINDOW) continue;
    const w = WEIGHT[m.stance] ?? 0;
    e.sum += w * 0.5 ** (age / HALF_LIFE);
    if (age < 12) e.last++;
    if (w >= 1.5) e.people.add(m.author);
  }
  return [...by]
    .filter(([, e]) => e.sum > 0)
    .map(([vid, e]) => ({
      vid,
      lastYear: e.last,
      score: (e.sum * (1 + 0.1 * Math.min(e.people.size, 10))) / (1 + e.all) ** 0.35,
    }))
    .sort((a, b) => b.score - a.score || a.vid.localeCompare(b.vid));
}
