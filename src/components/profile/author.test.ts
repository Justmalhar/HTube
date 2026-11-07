import { expect, test } from "bun:test";

import { activeSpan, isAuthor } from "./author";

test("author validator", () => {
  for (const ok of ["pg", "a_b-c", "A1", "x".repeat(15)]) expect(isAuthor(ok)).toBe(true);
  for (const bad of ["", "x".repeat(16), "a b", "a.b", "../x", "é", "a/b", "a%20b"]) expect(isAuthor(bad)).toBe(false);
});

test("active span", () => {
  expect(activeSpan(["2014-03", "2024-01"])).toBe("on HN 2014 to 2024");
  expect(activeSpan(["2019-05", "2019-09"])).toBe("on HN 2019");
});
