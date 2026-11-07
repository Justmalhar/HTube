import { expect, test } from "bun:test";

import { AVATAR_COLORS, avatarColor, relativeMonth, sortMentions, tokenize } from "./comment-format";

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("avatar colours are deterministic and readable with white text", () => {
  expect(avatarColor("pg")).toBe(avatarColor("pg"));
  expect(AVATAR_COLORS).toContain(avatarColor("dang"));
  for (const hex of AVATAR_COLORS) expect(1.05 / (luminance(hex) + 0.05)).toBeGreaterThanOrEqual(4.5);
});

test("relative month", () => {
  const now = new Date(2026, 10, 7);
  expect(relativeMonth("2026-11", now)).toBe("this month");
  expect(relativeMonth("2026-10", now)).toBe("1 month ago");
  expect(relativeMonth("2026-07", now)).toBe("4 months ago");
  expect(relativeMonth("2025-11", now)).toBe("1 year ago");
  expect(relativeMonth("2020-06", now)).toBe("6 years ago");
});

test("tokenize turns placeholders into chips", () => {
  expect(tokenize("see [LINK] and [1] or [^2] [...]")).toEqual([
    { text: "see ", chip: false },
    { text: "link", chip: true },
    { text: " and ", chip: false },
    { text: "1", chip: true },
    { text: " or ", chip: false },
    { text: "^2", chip: true },
    { text: " [...]", chip: false },
  ]);
});

test("sort orders", () => {
  const list = [
    { stance: "reference", month: "2024-01" },
    { stance: "strong_rec", month: "2019-01" },
    { stance: "rec", month: "2026-02" },
  ];
  expect(sortMentions(list, "top").map((m) => m.stance)).toEqual(["strong_rec", "rec", "reference"]);
  expect(sortMentions(list, "newest").map((m) => m.month)).toEqual(["2026-02", "2024-01", "2019-01"]);
});
