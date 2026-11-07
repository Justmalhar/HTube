import type { Card } from "@/lib/types";

/** Videos from the given channels, newest on HN first (last recommended year, then score). */
export function subscriptionCards(cards: Card[], slugs: string[]): Card[] {
  const set = new Set(slugs);
  return cards.filter((card) => set.has(card.channelSlug)).sort((a, b) => b.lastYear - a.lastYear || b.score - a.score);
}
