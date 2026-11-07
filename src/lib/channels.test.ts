import { expect, test } from "bun:test";

import { buildEngine } from "./engine";
import { channelDescription, channelStats, curators, relatedCategories, similarChannels, topChannelsInArea } from "./channels";
import type { Card } from "./types";

const card = (vid: string, ch: string, categories: string[], score = 1, y = 2020): Card =>
  ({ vid, title: vid, channel: ch.toUpperCase(), channelSlug: ch, categories, score, mentions: 2, firstYear: y, lastYear: y + 1, contentType: "talk" }) as Card;
const engine = buildEngine({
  cards: [card("a", "x", ["m", "p"], 5, 2015), card("b", "x", ["m"], 3), card("c", "y", ["p"]), card("d", "z", ["q"])],
  areas: [{ id: "A", name: "A", video_count: 4, categories: [{ id: "m", name: "M", description: "", video_count: 2 }, { id: "q", name: "Q", description: "", video_count: 1 }] }],
  categories: [{ id: "m", name: "M" }, { id: "p", name: "P" }, { id: "q", name: "Q" }] as never,
  playlists: [],
  related: [{ vid: "a", related: [{ vid: "c", shared_recommenders: 4 }, { vid: "d", shared_recommenders: 1 }, { vid: "b", shared_recommenders: 9 }] }],
});

test("stats, description, span", () => {
  const s = channelStats(engine, "x");
  expect(s).toMatchObject({ videos: 2, comments: 4, firstYear: 2015, lastYear: 2021 });
  expect(channelDescription(s)).toBe("Talks on M and P");
});
test("similar channels exclude self and rank by shared recommenders", () => {
  expect(similarChannels(engine, "x").map((c) => c.slug)).toEqual(["y", "z"]);
});
test("related categories: siblings then co-occurring", () => {
  expect(relatedCategories(engine, "m").map((c) => c.id)).toEqual(["q", "p"]);
});
test("top channels in area and curators", () => {
  expect(topChannelsInArea(engine, "A")[0]).toMatchObject({ slug: "x", count: 2 });
  const m = (author: string) => ({ author }) as never;
  expect(curators(engine, (v) => (v === "a" ? [m("u"), m("u"), m("w")] : []), "x", 1)).toEqual([{ author: "u", count: 2 }]);
});
