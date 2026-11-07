import type {
  Area,
  BrowseQuery,
  Card,
  Category,
  FeedCard,
  FeedQuery,
  PageResult,
  Playlist,
  RelatedEdge,
  SearchQuery,
  SearchResult,
} from "@/lib/types";

export type Engine = {
  cards: Card[];
  byId: Map<string, Card>;
  categories: Map<string, Category>;
  areas: Area[];
  playlists: Playlist[];
  related: Map<string, RelatedEdge[]>;
  categoryDescription: Map<string, string>;
};

export const PAGE = 24;

const REASONS = {
  similar: "Similar to videos you liked",
  also: "People who recommended your likes also recommend this",
  classic: "HN classic",
  recent: "Recent HN favorite",
  gem: "Hidden gem, few mentions and mostly strong recommendations",
  fresh: "A topic you have not explored",
  more: "More from the catalogue",
} as const;

export type Reason = (typeof REASONS)[keyof typeof REASONS];

export function buildEngine(input: {
  cards: Card[];
  areas: Area[];
  categories: Category[];
  playlists: Playlist[];
  related: { vid: string; related: RelatedEdge[] }[];
}): Engine {
  const byId = new Map(input.cards.map((card) => [card.vid, card]));
  const categories = new Map(input.categories.map((category) => [category.id, category]));
  const categoryDescription = new Map(
    input.categories.map((category) => [category.id, category.description || ""]),
  );
  const related = new Map(input.related.map((row) => [row.vid, row.related]));
  return {
    cards: input.cards,
    byId,
    categories,
    areas: input.areas,
    playlists: input.playlists,
    related,
    categoryDescription,
  };
}

function eligible(card: Card, dislikes: Set<string>): boolean {
  if (dislikes.has(card.vid)) return false;
  if (card.shelfLife === "news") return false;
  if (card.recommenders <= 0) return false;
  return true;
}

const WEIGHT = { quality: 1, affinity: 1.6, neighbour: 0.8, fresh: 0.3, noise: 0.3 };
const WINDOW = 12;
const MAX_CHANNEL = 2;
const MAX_CATEGORY = 4;
const EXPLORE_RATE = 0.2;
const HALF_LIFE = 20;
const SEEN_PENALTY = 5;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Affinity features of a card: channel, format, level, categories and their areas. */
function features(engine: Engine, card: Card): [string, number][] {
  const out: [string, number][] = [
    [`ch:${card.channelSlug}`, 1],
    [`t:${card.contentType}`, 0.3],
    [`l:${card.level}`, 0.2],
  ];
  for (const id of card.categories) {
    out.push([`c:${id}`, 1]);
    const area = engine.categories.get(id)?.area_id;
    if (area) out.push([`a:${area}`, 0.5]);
  }
  return out;
}

type Ranked = { card: Card; rank: number; aff: number; nb: number; outside: boolean };

/**
 * Rule-based ranker. Quality + interest affinity (likes, decayed watch history, dislikes) +
 * co-recommendation neighbours + freshness + seeded Gumbel noise, then a greedy pass that enforces
 * channel/category diversity and mixes in exploration picks. Deterministic for a given seed and library.
 */
export function buildFeed(engine: Engine, query: FeedQuery): PageResult<FeedCard> {
  const dislikes = new Set(query.dislikes);
  const seen = new Set(query.seen);
  const likes = query.likes.filter((id) => engine.byId.has(id));
  const likeSet = new Set(likes);
  const seed = query.seed ?? 0;
  const pool = engine.cards.filter((card) => eligible(card, dislikes));

  const profile = new Map<string, number>();
  const neighbours = new Map<string, number>();
  const signal = (id: string, weight: number) => {
    const card = engine.byId.get(id);
    if (!card) return;
    for (const [key, share] of features(engine, card)) profile.set(key, (profile.get(key) ?? 0) + weight * share);
    if (weight <= 0) return;
    for (const edge of engine.related.get(id) ?? []) {
      neighbours.set(edge.vid, (neighbours.get(edge.vid) ?? 0) + weight * edge.shared_recommenders);
    }
  };
  for (const id of likes) signal(id, 3);
  const watched = query.seen.filter((id) => !dislikes.has(id)).slice(-60);
  watched.forEach((id, index) => signal(id, 0.5 ** ((watched.length - 1 - index) / HALF_LIFE)));
  for (const id of dislikes) signal(id, -2);

  const personal = profile.size > 0;
  let maxQuality = 1;
  for (const card of pool) maxQuality = Math.max(maxQuality, card.score);
  let maxAff = 0;
  let maxNb = 0;
  const raw = pool.map((card) => {
    let aff = 0;
    if (personal) for (const [key, share] of features(engine, card)) aff += (profile.get(key) ?? 0) * share;
    const nb = neighbours.get(card.vid) ?? 0;
    maxAff = Math.max(maxAff, Math.abs(aff));
    maxNb = Math.max(maxNb, nb);
    return { card, aff, nb };
  });

  const ranked: Ranked[] = raw.map(({ card, aff, nb }) => {
    const u = Math.min(Math.max(mulberry32(seed ^ hash(card.vid))(), 1e-9), 1 - 1e-9);
    const gumbel = -Math.log(-Math.log(u));
    const fresh = (card.shelfLife === "evergreen" ? 0.5 : 0) + (card.firstYear >= 2024 ? 0.5 : 0);
    const affN = maxAff ? aff / maxAff : 0;
    const nbN = maxNb ? nb / maxNb : 0;
    let rank =
      WEIGHT.quality * (card.score / maxQuality) +
      WEIGHT.affinity * affN +
      WEIGHT.neighbour * nbN +
      WEIGHT.fresh * fresh +
      WEIGHT.noise * gumbel;
    if (seen.has(card.vid)) rank -= SEEN_PENALTY;
    const outside = personal && card.categories.every((id) => (profile.get(`c:${id}`) ?? 0) <= 0);
    return { card, rank, aff: affN, nb: nbN, outside };
  });
  ranked.sort((a, b) => b.rank - a.rank || a.card.vid.localeCompare(b.card.vid));

  const lists = {
    exploit: { items: ranked, at: 0 },
    explore: { items: ranked.filter((row) => row.outside && !seen.has(row.card.vid)), at: 0 },
  };
  const used = new Set<string>();
  const out: Ranked[] = [];
  const fits = (card: Card) => {
    const tail = out.slice(-(WINDOW - 1));
    if (tail.filter((row) => row.card.channelSlug === card.channelSlug).length >= MAX_CHANNEL) return false;
    return card.categories.every((id) => tail.filter((row) => row.card.categories.includes(id)).length < MAX_CATEGORY);
  };
  const take = (list: { items: Ranked[]; at: number }) => {
    while (list.at < list.items.length && used.has(list.items[list.at]!.card.vid)) list.at += 1;
    const first = list.items[list.at];
    if (!first) return undefined;
    for (let i = list.at; i < Math.min(list.items.length, list.at + 400); i += 1) {
      const row = list.items[i]!;
      if (!used.has(row.card.vid) && fits(row.card)) return row;
    }
    return first;
  };

  const rng = mulberry32(seed ^ 0x9e3779b9);
  const need = Math.min(pool.length, Math.max(0, Math.floor(query.offset) || 0) + Math.max(1, Math.min(query.limit, 60)));
  while (out.length < need) {
    const wantExplore = personal && rng() < EXPLORE_RATE;
    const row = (wantExplore ? take(lists.explore) : undefined) ?? take(lists.exploit);
    if (!row) break;
    used.add(row.card.vid);
    out.push(row);
  }

  const cards = out.map((row): FeedCard => ({ ...row.card, reason: reasonFor(row, likeSet) }));
  // Totals and offsets mirror slice(); only the prefix up to this page was ranked.
  const page = slice(cards, query.offset, query.limit);
  return { ...page, total: pool.length };
}

function reasonFor(row: Ranked, likeSet: Set<string>): Reason {
  const card = row.card;
  if (row.nb > 0 && !likeSet.has(card.vid)) return REASONS.also;
  if (row.aff > 0.3) return REASONS.similar;
  if (row.outside) return REASONS.fresh;
  if (card.shelfLife === "evergreen" && card.recMonths >= 10 && card.recommenders >= 8) return REASONS.classic;
  if (card.firstYear >= 2024 && card.recommenders >= 2) return REASONS.recent;
  return REASONS.more;
}

/** Videos co-recommended with `vid`, strongest overlap first. */
export function relatedTo(engine: Engine, vid: string, dislikes: string[], limit: number): FeedCard[] {
  const hidden = new Set(dislikes);
  return (engine.related.get(vid) ?? [])
    .map((edge) => ({ edge, card: engine.byId.get(edge.vid) }))
    .filter((row): row is { edge: RelatedEdge; card: Card } => Boolean(row.card) && row.card!.vid !== vid && eligible(row.card!, hidden))
    .sort((a, b) => b.edge.shared_recommenders - a.edge.shared_recommenders || byScore(a.card, b.card))
    .slice(0, limit)
    .map((row) => row.card);
}

function byScore(a: Card, b: Card): number {
  return b.score - a.score || a.title.localeCompare(b.title);
}

export function browse(engine: Engine, query: BrowseQuery): PageResult<FeedCard> {
  let rows = engine.cards.filter((card) => matches(engine, card, query));
  rows = sortCards(rows, query.sort ?? "hn");
  return slice(rows, query.offset, query.limit);
}

export function search(engine: Engine, query: SearchQuery): SearchResult {
  const q = query.q.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { card: FeedCard; rank: number }[] = [];
  for (const card of engine.cards) {
    if (!matches(engine, card, query)) continue;
    const hit = scoreCard(engine, card, q, terms);
    if (hit.score <= 0) continue;
    scored.push({
      rank: hit.score,
      card: { ...card, via: hit.via, reason: hit.via ? `Topic match, ${hit.via}` : undefined },
    });
  }
  scored.sort((a, b) => b.rank - a.rank || b.card.score - a.card.score || a.card.title.localeCompare(b.card.title));
  const weak = scored.length > 0 && (scored[0]?.rank ?? 0) < 12;
  const page = slice(
    scored.map((row) => row.card),
    query.offset,
    query.limit,
  );
  return { ...page, weak };
}

function scoreCard(
  engine: Engine,
  card: Card,
  phrase: string,
  terms: string[],
): { score: number; via?: string } {
  let score = 0;
  const title = card.title.toLowerCase();
  if (phrase && title.includes(phrase)) score += 50;
  for (const term of terms) {
    if (title.includes(term)) score += 8;
    if (card.channel.toLowerCase().includes(term)) score += 6;
    if (card.primaryTopic.toLowerCase().includes(term)) score += 6;
    if (card.tags.some((tag) => tag.toLowerCase().includes(term))) score += 5;
    if (card.whyHn.toLowerCase().includes(term)) score += 3;
    if (card.summary.toLowerCase().includes(term)) score += 2;
    if (card.categories.some((id) => engine.categories.get(id)?.name.toLowerCase().includes(term))) {
      score += 4;
    }
  }
  const direct = score;
  let via: string | undefined;
  for (const id of card.categories) {
    const description = engine.categoryDescription.get(id)?.toLowerCase() ?? "";
    const name = engine.categories.get(id)?.name;
    if (!description || !name) continue;
    if (phrase && description.includes(phrase)) {
      score += 6;
      if (!direct) via = name;
    }
  }
  return { score, via };
}

function matches(engine: Engine, card: Card, query: BrowseQuery): boolean {
  if (query.type && card.contentType !== query.type) return false;
  if (query.level && card.level !== query.level) return false;
  if (query.shelf && card.shelfLife !== query.shelf) return false;
  if (query.evergreen && card.shelfLife !== "evergreen") return false;
  // An explicit shelf=news filter implies showing news.
  if ((query.news ?? "hide") !== "show" && query.shelf !== "news" && card.shelfLife === "news") return false;
  if ((query.cited ?? "hide") !== "show" && card.recommenders <= 0) return false;
  if (query.category && !card.categories.includes(query.category)) return false;
  if (query.area) {
    const area = engine.areas.find((item) => item.id === query.area);
    const ids = new Set(area?.categories.map((category) => category.id) ?? []);
    if (!card.categories.some((id) => ids.has(id))) return false;
  }
  if (query.channel && card.channelSlug !== query.channel) return false;
  if (query.gems === "insistent") {
    if (
      !(
        card.recommenders >= 3 &&
        card.recommenders <= 8 &&
        card.strongRecs >= Math.ceil(card.recommenders * 0.5)
      )
    ) {
      return false;
    }
  }
  return true;
}

function sortCards(rows: Card[], sort: BrowseQuery["sort"]): Card[] {
  const copy = [...rows];
  if (sort === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }
  if (sort === "recent") {
    copy.sort((a, b) => b.lastYear - a.lastYear || b.recMonths - a.recMonths || b.score - a.score);
    return copy;
  }
  copy.sort(byScore);
  return copy;
}

function slice<T>(items: T[], offset: number, limit: number): PageResult<T> {
  // Offsets come from the URL: drop fractions, NaN, and Infinity.
  const start = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  const size = Math.max(1, Math.min(limit, 60));
  return { items: items.slice(start, start + size), total: items.length, offset: start, limit: size };
}

export function categoryName(engine: Engine, id: string): string {
  return engine.categories.get(id)?.name ?? id;
}

export function areaForCategory(engine: Engine, id: string): Area | undefined {
  return engine.areas.find((area) => area.categories.some((category) => category.id === id));
}
