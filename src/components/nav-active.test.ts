import { expect, test } from "bun:test";

import { activeHref } from "./nav-active";

const links = [
  { href: "/" },
  { href: "/browse?dur=xlong" },
  { href: "/browse" },
  { href: "/later", match: ["/later", "/history", "/liked"] },
];
const at = (url: string) => {
  const u = new URL(url, "http://x");
  return activeHref(links, u.pathname, u.searchParams);
};

test("exactly one nav item is current", () => {
  expect(at("/")).toBe("/");
  expect(at("/browse")).toBe("/browse");
  expect(at("/browse?sort=hn")).toBe("/browse");
  expect(at("/browse?dur=xlong")).toBe("/browse?dur=xlong");
  expect(at("/browse?sort=hn&dur=xlong")).toBe("/browse?dur=xlong");
  expect(at("/history")).toBe("/later");
  expect(at("/watch/abc")).toBeUndefined();
  expect(activeHref(links, "/browse", null)).toBeUndefined();
});
