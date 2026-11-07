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

export function buildFeed(engine: Engine, query: FeedQuery): PageResult<FeedCard> {
  const dislikes = new Set(query.dislikes);
  const seen = new Set(query.seen);
  const likes = query.likes.filter((id) => engine.byId.has(id));
  const pool = engine.cards.filter((card) => eligible(card, dislikes));
  const used = new Set<string>();
  const explored = new Set<string>();

  for (const id of likes) {
    const card = engine.byId.get(id);
    card?.categories.forEach((category) => explored.add(category));
  }

  const classics = pool
    .filter(
      (card) =>
        card.shelfLife === "evergreen" &&
        card.recMonths >= 10 &&
        card.lastYear - card.firstYear >= 4 &&
        card.recommenders >= 8,
    )
    .sort(byScore);

  if (!likes.length) {
    for (const card of classics.slice(0, 15)) {
      const primary = card.categories[0];
      if (primary) explored.add(primary);
    }
  }

  const similar = likes.length
    ? pool
        .filter((card) => !likes.includes(card.vid) && card.categories.some((id) => explored.has(id)))
        .sort(byScore)
    : [];

  const alsoIds = new Map<string, number>();
  for (const id of likes) {
    for (const edge of engine.related.get(id) ?? []) {
      alsoIds.set(edge.vid, Math.max(alsoIds.get(edge.vid) ?? 0, edge.shared_recommenders));
    }
  }
  const also = [...alsoIds.entries()]
    .filter(([vid]) => engine.byId.has(vid) && eligible(engine.byId.get(vid) as Card, dislikes))
    .sort((a, b) => b[1] - a[1] || byScore(engine.byId.get(a[0]) as Card, engine.byId.get(b[0]) as Card))
    .map(([vid]) => engine.byId.get(vid) as Card);

  const recent = pool
    .filter((card) => card.firstYear >= 2024 && card.recommenders >= 2)
    .sort(byScore);
  const gems = pool
    .filter(
      (card) =>
        card.shelfLife === "evergreen" &&
        card.recommenders >= 3 &&
        card.recommenders <= 8 &&
        card.strongRecs >= Math.ceil(card.recommenders * 0.5),
    )
    .sort(byScore);
  const fresh = pool
    .filter((card) => card.categories.every((id) => !explored.has(id)))
    .sort(byScore);

  const lanes: { reason: Reason; cards: Card[] }[] = likes.length
    ? [
        { reason: REASONS.similar, cards: similar },
        { reason: REASONS.also, cards: also },
        { reason: REASONS.classic, cards: classics },
        { reason: REASONS.recent, cards: recent },
        { reason: REASONS.gem, cards: gems },
        { reason: REASONS.fresh, cards: fresh },
      ]
    : [
        { reason: REASONS.classic, cards: classics },
        { reason: REASONS.recent, cards: recent },
        { reason: REASONS.gem, cards: gems },
        { reason: REASONS.fresh, cards: fresh },
      ];

  const ordered: FeedCard[] = [];
  const pointers = lanes.map(() => 0);
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (let index = 0; index < lanes.length; index += 1) {
      const lane = lanes[index];
      if (!lane) continue;
      while (pointers[index]! < lane.cards.length && used.has(lane.cards[pointers[index]!]?.vid ?? "")) {
        pointers[index] = (pointers[index] ?? 0) + 1;
      }
      const pointer = pointers[index] ?? 0;
      const next = lane.cards[pointer];
      if (!next) continue;
      pointers[index] = pointer + 1;
      if (used.has(next.vid)) continue;
      used.add(next.vid);
      ordered.push({ ...next, reason: lane.reason });
      progressed = true;
    }
  }

  for (const card of pool) {
    if (used.has(card.vid)) continue;
    used.add(card.vid);
    ordered.push({ ...card, reason: REASONS.more });
  }

  const unseen = ordered.filter((card) => !seen.has(card.vid));
  const watched = ordered.filter((card) => seen.has(card.vid));
  const final = unseen.concat(watched);
  return slice(final, query.offset, query.limit);
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
  if ((query.news ?? "hide") !== "show" && card.shelfLife === "news") return false;
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
  const start = Math.max(0, offset);
  const size = Math.max(1, Math.min(limit, 60));
  return { items: items.slice(start, start + size), total: items.length, offset: start, limit: size };
}

export function categoryName(engine: Engine, id: string): string {
  return engine.categories.get(id)?.name ?? id;
}

export function areaForCategory(engine: Engine, id: string): Area | undefined {
  return engine.areas.find((area) => area.categories.some((category) => category.id === id));
}
