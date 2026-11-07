import { expect, test } from "bun:test";

import { feedBase } from "./query";

test("feed paths resolve to their pinned filters", () => {
  expect(feedBase("/browse")).toEqual({});
  expect(feedBase("/search")).toEqual({});
  expect(feedBase("/c/rust")).toEqual({ category: "rust" });
  expect(feedBase("/a/systems")).toEqual({ area: "systems" });
  expect(feedBase("/channel/some.chan-1")).toEqual({ channel: "some.chan-1", news: "show", cited: "show" });
  for (const bad of ["/", "/watch/x", "/c/", "/c/a/b", "/channel/../x", "/browse/x", "https://x/browse"]) expect(feedBase(bad)).toBeNull();
});
