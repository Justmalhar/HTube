import { expect, test } from "bun:test";

import { subscriptionCards } from "@/lib/subscriptions";
import type { Card } from "@/lib/types";

const c = (vid: string, channelSlug: string, lastYear: number, score: number) => ({ vid, channelSlug, lastYear, score }) as Card;

test("filters to subscribed channels, newest then highest score", () => {
  const out = subscriptionCards([c("a", "x", 2020, 5), c("b", "y", 2024, 1), c("c", "x", 2024, 9), c("d", "z", 2025, 9)], ["x", "y"]);
  expect(out.map((card) => card.vid)).toEqual(["c", "b", "a"]);
});
