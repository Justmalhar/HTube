import { expect, test } from "bun:test";

import { rankTrending } from "./trending";

const m = (vid: string, month: string, stance = "rec", author = "a") => ({ vid, month, stance, author });

test("recent beats old, jokes and out-of-window are dropped", () => {
  const r = rankTrending([m("old", "2020-01"), m("new", "2025-12"), m("joke", "2025-12", "joke"), m("now", "2026-01")]);
  expect(r.map((x) => x.vid)).toEqual(["now", "new"]);
});

test("evergreen volume is damped and distinct recommenders boost", () => {
  const many = [...Array.from({ length: 40 }, () => m("giant", "2015-01")), m("giant", "2026-01", "strong_rec", "x"), m("giant", "2026-01", "rec", "y")];
  const few = [m("fresh", "2026-01", "strong_rec", "x"), m("fresh", "2026-01", "rec", "y")];
  const r = rankTrending([...many, ...few]);
  expect(r[0].vid).toBe("fresh");
  expect(r.find((x) => x.vid === "giant")!.lastYear).toBe(2);
});
