import { describe, expect, test } from "bun:test";

import { pickExplore } from "@/lib/explore";
import type { Category } from "@/lib/types";

const cats: Category[] = Array.from({ length: 60 }, (_, i) => ({
  id: `c${i}`,
  name: `Cat ${i}`,
  description: "",
  area_id: `a${i % 8}`,
  area_name: `Area ${i % 8}`,
  video_count: 1 + (i % 9) * 5,
}));

describe("pickExplore", () => {
  test("excludes watched categories", () => {
    const watched = new Set(cats.slice(0, 30).map((c) => c.id));
    for (let s = 1; s < 20; s += 1) expect(pickExplore(cats, watched, s).some((c) => watched.has(c.id))).toBe(false);
  });
  test("at most 2 per area, up to 11 picks", () => {
    for (let s = 1; s < 20; s += 1) {
      const picks = pickExplore(cats, new Set(), s);
      expect(picks.length).toBe(11);
      const count: Record<string, number> = {};
      for (const c of picks) count[c.area_id] = (count[c.area_id] ?? 0) + 1;
      expect(Math.max(...Object.values(count))).toBeLessThanOrEqual(2);
    }
  });
  test("same seed same result, different seed differs", () => {
    const ids = (s: number) => pickExplore(cats, new Set(), s).map((c) => c.id).join();
    expect(ids(7)).toBe(ids(7));
    expect(ids(7)).not.toBe(ids(8));
  });
});
