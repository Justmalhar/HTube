import { describe, expect, test } from "bun:test";

import { browse, buildEngine, buildFeed, search } from "@/lib/engine";
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
