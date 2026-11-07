import { relatedTo, type Engine } from "@/lib/engine";
import type { Card } from "@/lib/types";

/** Deterministic mix: the seed's co-recommendation neighbours, then theirs (breadth first), deduped. */
export function buildMix(engine: Engine, seed: string, dislikes: string[] = [], limit = 25): Card[] {
  const seen = new Set([seed]);
  const out: Card[] = [];
  const frontier = [seed];
  for (let head = 0; head < frontier.length && out.length < limit; head++) {
    for (const card of relatedTo(engine, frontier[head], dislikes, 8)) {
      if (seen.has(card.vid) || out.length >= limit) continue;
      seen.add(card.vid);
      out.push(card);
      frontier.push(card.vid);
    }
  }
  return out;
}
