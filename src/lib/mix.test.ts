import { expect, test } from "bun:test";

import type { Engine } from "./engine";
import { buildMix } from "./mix";

const card = (vid: string) => ({ vid, title: vid, score: 1, shelfLife: "evergreen", recommenders: 1 });
const edge = (vid: string) => ({ vid, shared_recommenders: 1 });
const engine = {
  byId: new Map(["a", "b", "c", "d"].map((id) => [id, card(id)])),
  related: new Map([
    ["a", [edge("b"), edge("a")]],
    ["b", [edge("c"), edge("a")]],
    ["c", [edge("d"), edge("b")]],
  ]),
} as unknown as Engine;

test("walks neighbours of neighbours without repeats or the seed", () => {
  expect(buildMix(engine, "a").map((c) => c.vid)).toEqual(["b", "c", "d"]);
});

test("skips dislikes and honours the limit", () => {
  expect(buildMix(engine, "a", ["c"]).map((c) => c.vid)).toEqual(["b"]);
  expect(buildMix(engine, "a", [], 2).map((c) => c.vid)).toEqual(["b", "c"]);
});
