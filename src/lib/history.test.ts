import { expect, test } from "bun:test";

import { groupFor, groupHistory } from "@/lib/history";

const now = new Date(2026, 10, 15, 10, 0).getTime(); // Sun 15 Nov 2026, local
const day = (d: number, h = 12) => new Date(2026, 10, d, h).getTime();

test("buckets by local calendar day", () => {
  expect(groupFor(day(15, 0), now)).toBe("Today");
  expect(groupFor(day(14, 23), now)).toBe("Yesterday");
  expect(groupFor(day(10), now)).toBe("This week");
  expect(groupFor(day(9), now)).toBe("This week");
  expect(groupFor(day(8), now)).toBe("This month");
  expect(groupFor(day(1), now)).toBe("This month");
  expect(groupFor(new Date(2026, 9, 31).getTime(), now)).toBe("Earlier");
  expect(groupFor(undefined, now)).toBe("Earlier");
});

test("keeps order and drops empty groups", () => {
  const groups = groupHistory(["a", "b", "c", "d"], { a: day(15), b: day(15, 1), c: day(2) }, now);
  expect(groups).toEqual([
    { group: "Today", ids: ["a", "b"] },
    { group: "This month", ids: ["c"] },
    { group: "Earlier", ids: ["d"] },
  ]);
});
