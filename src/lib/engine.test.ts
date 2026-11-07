import { describe, expect, test } from "bun:test";

import { browse, buildEngine, buildFeed, relatedTo, search } from "@/lib/engine";
import type { Card } from "@/lib/types";

function card(partial: Partial<Card> & Pick<Card, "vid" | "title">): Card {
  return {
    shard: "00",
    channel: "Channel",
    channelSlug: "channel",
    contentType: "talk",
    level: "general",
    shelfLife: "evergreen",
    primaryTopic: "topic",
    tags: [],
    categories: ["cat-a"],
    score: 1,
    recommenders: 4,
    recMonths: 4,
    strongRecs: 2,
    mentions: 4,
    firstYear: 2018,
    lastYear: 2024,
    whyHn: "why",
    summary: "summary",
    quote: null,
    ...partial,
  };
}

const engine = buildEngine({
  areas: [
    {
      id: "software",
      name: "Software",
      video_count: 2,
      categories: [
        { id: "cat-a", name: "Compilers", description: "compilers and distributed systems", video_count: 2 },
        { id: "cat-b", name: "History", description: "old machines", video_count: 1 },
      ],
    },
  ],
  categories: [
    { id: "cat-a", name: "Compilers", description: "compilers and distributed systems", area_id: "software", area_name: "Software", video_count: 2 },
    { id: "cat-b", name: "History", description: "old machines", area_id: "software", area_name: "Software", video_count: 1 },
  ],
  playlists: [],
  related: [{ vid: "like1", related: [{ vid: "also1", shared_recommenders: 3 }] }],
  cards: [
    card({ vid: "classic1", title: "Classic talk", score: 30, recMonths: 14, recommenders: 12, firstYear: 2012, lastYear: 2026, strongRecs: 9 }),
    card({ vid: "recent1", title: "New talk", score: 8, firstYear: 2025, lastYear: 2026, recommenders: 3, recMonths: 3 }),
    card({ vid: "gem1", title: "Gem talk", score: 5, recommenders: 4, strongRecs: 3, recMonths: 4 }),
    card({ vid: "news1", title: "News clip", shelfLife: "news", score: 99, recommenders: 9 }),
    card({ vid: "cited1", title: "Only cited", recommenders: 0, strongRecs: 0, score: 1 }),
    card({ vid: "like1", title: "Liked seed", categories: ["cat-b"], score: 7, recommenders: 5 }),
    card({ vid: "also1", title: "Co recommended", categories: ["cat-b"], score: 6, recommenders: 5 }),
    card({ vid: "systems1", title: "Raft explained", summary: "no phrase here", categories: ["cat-a"], score: 4 }),
  ],
});

describe("feed", () => {
  test("hides news, cited-only videos, and dislikes", () => {
    const page = buildFeed(engine, { likes: [], dislikes: ["gem1"], seen: [], offset: 0, limit: 20 });
    const ids = page.items.map((item) => item.vid);
    expect(ids).not.toContain("news1");
    expect(ids).not.toContain("cited1");
    expect(ids).not.toContain("gem1");
  });

  test("stable order and seen videos sink", () => {
    const first = buildFeed(engine, { likes: [], dislikes: [], seen: [], offset: 0, limit: 10 });
    const second = buildFeed(engine, { likes: [], dislikes: [], seen: [], offset: 0, limit: 10 });
    expect(second.items.map((item) => item.vid)).toEqual(first.items.map((item) => item.vid));
    const seen = buildFeed(engine, { likes: [], dislikes: [], seen: [first.items[0]!.vid], offset: 0, limit: 10 });
    expect(seen.items.at(-1)?.vid).toBe(first.items[0]?.vid);
  });

  test("likes pull co-recommendations forward", () => {
    const page = buildFeed(engine, { likes: ["like1"], dislikes: [], seen: [], offset: 0, limit: 6 });
    const match = page.items.find((item) => item.vid === "also1");
    expect(match).toBeTruthy();
    expect(match?.reason === "Similar to videos you liked" || match?.reason?.includes("also recommend")).toBe(true);
  });
});

describe("search and browse", () => {
  test("category description finds distributed systems", () => {
    const result = search(engine, {
      q: "distributed systems",
      offset: 0,
      limit: 10,
      news: "hide",
      cited: "hide",
    });
    expect(result.items.some((item) => item.vid === "systems1")).toBe(true);
    expect(result.items.find((item) => item.vid === "systems1")?.via).toBe("Compilers");
  });

  test("browse category and title sort", () => {
    const page = browse(engine, { category: "cat-b", sort: "title", offset: 0, limit: 10, news: "hide", cited: "hide" });
    expect(page.items.every((item) => item.categories.includes("cat-b"))).toBe(true);
  });

  test("shelf=news shows news without news=show", () => {
    const page = browse(engine, { shelf: "news", offset: 0, limit: 10 });
    expect(page.items.map((item) => item.vid)).toEqual(["news1"]);
  });

  test("URL offsets are clamped to whole numbers", () => {
    expect(browse(engine, { offset: 1.5, limit: 2 }).offset).toBe(1);
    expect(browse(engine, { offset: Number.POSITIVE_INFINITY, limit: 2 }).offset).toBe(0);
    expect(browse(engine, { offset: Number.NaN, limit: 2 }).items.length).toBe(2);
  });
});

describe("ranker", () => {
  const cats = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7"];
  const big = buildEngine({
    areas: [{ id: "all", name: "All", video_count: 240, categories: cats.map((id) => ({ id, name: id, description: "", video_count: 30 })) }],
    categories: cats.map((id) => ({ id, name: id, description: "", area_id: "all", area_name: "All", video_count: 30 })),
    playlists: [],
    related: [{ vid: "v0", related: [{ vid: "v8", shared_recommenders: 5 }, { vid: "v16", shared_recommenders: 2 }] }],
    cards: Array.from({ length: 240 }, (_, i) =>
      card({
        vid: `v${i}`,
        title: `Video ${i}`,
        channel: `Ch${i % 20}`,
        channelSlug: `ch${i % 20}`,
        categories: [cats[i % 8]!],
        score: 10 + ((i * 7) % 23),
        recommenders: 5,
      }),
    ),
  });
  const ids = (query: Partial<Parameters<typeof buildFeed>[1]>, limit = 48) =>
    buildFeed(big, { likes: [], dislikes: [], seen: [], offset: 0, limit, ...query }).items;

  test("same seed repeats, different seed reshuffles, pages never overlap", () => {
    const a = ids({ seed: 1 }).map((c) => c.vid);
    expect(ids({ seed: 1 }).map((c) => c.vid)).toEqual(a);
    expect(ids({ seed: 2 }).map((c) => c.vid)).not.toEqual(a);
    const p1 = buildFeed(big, { likes: [], dislikes: [], seen: [], seed: 3, offset: 0, limit: 24 }).items;
    const p2 = buildFeed(big, { likes: [], dislikes: [], seen: [], seed: 3, offset: 24, limit: 24 }).items;
    expect(new Set([...p1, ...p2].map((c) => c.vid)).size).toBe(48);
  });

  test("diversity windows hold over the first 48", () => {
    for (const library of [{}, { likes: ["v0", "v1"], seen: ["v2", "v3", "v4"] }]) {
      const items = ids({ seed: 5, ...library });
      for (let i = 0; i + 12 <= items.length; i += 1) {
        const win = items.slice(i, i + 12);
        for (const ch of new Set(win.map((c) => c.channelSlug))) expect(win.filter((c) => c.channelSlug === ch).length).toBeLessThanOrEqual(2);
        for (const cat of cats) expect(win.filter((c) => c.categories.includes(cat)).length).toBeLessThanOrEqual(4);
      }
    }
  });

  test("dislikes never appear and seen sink", () => {
    const all = buildFeed(big, { likes: [], dislikes: ["v1", "v2"], seen: ["v3"], seed: 9, offset: 0, limit: 60 });
    expect(all.items.map((c) => c.vid)).not.toContain("v1");
    expect(all.total).toBe(238);
    const tail = buildFeed(big, { likes: [], dislikes: [], seen: ["v3"], seed: 9, offset: 230, limit: 10 });
    expect(tail.items.at(-1)?.vid).toBe("v3");
  });

  test("liked categories are over-represented versus cold start", () => {
    const count = (items: { categories: string[] }[]) => items.filter((c) => c.categories.includes("c3")).length;
    const likes = ["v3", "v11", "v19", "v27"];
    let warm = 0;
    let cold = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      warm += count(ids({ seed, likes }, 24));
      cold += count(ids({ seed }, 24));
    }
    expect(warm).toBeGreaterThan(cold);
  });

  test("relatedTo returns strongest co-recommendations first", () => {
    expect(relatedTo(big, "v0", [], 5).map((c) => c.vid)).toEqual(["v8", "v16"]);
    expect(relatedTo(big, "v0", ["v8"], 5).map((c) => c.vid)).toEqual(["v16"]);
  });
});
