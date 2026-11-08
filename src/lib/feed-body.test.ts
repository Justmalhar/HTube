import { expect, test } from "bun:test";

import { parseFeedBody } from "./feed-body";

test("feed POST keeps the id lists used to rank and drops the rest of the library", () => {
  const parsed = parseFeedBody({
    likes: ["a", 1, "b"],
    dislikes: ["d"],
    seen: ["s"],
    later: ["l"],
    seed: 7,
    offset: 24,
    subs: ["chan"],
    seenAt: { s: 1_700_000_000_000 },
    frames: false,
    paused: true,
  });
  expect(parsed.library).toEqual({ likes: ["a", "b"], dislikes: ["d"], seen: ["s"], later: ["l"] });
  expect(Object.keys(parsed.library).sort()).toEqual(["dislikes", "later", "likes", "seen"]);
  expect(parsed.seed).toBe(7);
  expect(parsed.offset).toBe(24);
});

test("feed POST treats a missing body as empty and caps each list at 2000 ids", () => {
  expect(parseFeedBody(null)).toEqual({ library: { likes: [], dislikes: [], seen: [], later: [] }, seed: 0, offset: 0 });
  const capped = parseFeedBody({ likes: Array.from({ length: 2001 }, (_, index) => String(index)), seed: "nope" });
  expect(capped.library.likes).toHaveLength(2000);
  expect(capped.library.likes[0]).toBe("0");
  expect(capped.seed).toBe(0);
});
