import { expect, test } from "bun:test";

import { buildEngine } from "@/lib/engine";
import { rankText, suggest } from "@/lib/suggest";
import type { Card } from "@/lib/types";

const base = {
  shard: "00", contentType: "talk", level: "general", shelfLife: "evergreen", primaryTopic: "t",
  tags: [], categories: ["rust"], recommenders: 3, recMonths: 1, strongRecs: 1, mentions: 1,
  firstYear: 2020, lastYear: 2024, whyHn: "", summary: "", quote: null,
};
const card = (vid: string, title: string, channel: string, score: number): Card => ({
  ...base, vid, title, channel, channelSlug: channel.toLowerCase().replace(/\s/g, "-"), score,
});

test("rank order", () => {
  expect(rankText("Rust talk", "rus")).toBe(0);
  expect(rankText("Why Rust", "rus")).toBe(1);
  expect(rankText("Trust", "rus")).toBe(2);
  expect(rankText("Go", "rus")).toBe(-1);
});

test("suggest mixes kinds, ranks prefix first", () => {
  const engine = buildEngine({
    cards: [card("a", "Trust issues", "X", 9), card("b", "Why Rust", "X", 1), card("c", "Rust in 100 seconds", "Rustacean Station", 2)],
    areas: [],
    categories: [{ id: "rust", name: "Rust", description: "", area_id: "", area_name: "", video_count: 3 }],
    playlists: [],
    related: [],
  });
  const out = suggest(engine, " RUS ");
  expect(out.map((s) => s.kind)).toContain("channel");
  expect(out.find((s) => s.kind === "topic")?.href).toBe("/c/rust");
  expect(out.find((s) => s.kind === "channel")?.href).toBe("/channel/rustacean-station");
  const titles = out.filter((s) => s.kind === "query").map((s) => s.text);
  expect(titles).toEqual(["Rust in 100 seconds", "Why Rust", "Trust issues"]);
  expect(suggest(engine, "  ")).toEqual([]);
});
