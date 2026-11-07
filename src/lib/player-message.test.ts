import { expect, test } from "bun:test";

import { isPlayerEnded, PLAYER_ORIGIN } from "./player-message";

test("detects ended from infoDelivery and onStateChange", () => {
  expect(isPlayerEnded(PLAYER_ORIGIN, JSON.stringify({ event: "infoDelivery", info: { playerState: 0 } }))).toBe(true);
  expect(isPlayerEnded(PLAYER_ORIGIN, JSON.stringify({ event: "onStateChange", info: 0 }))).toBe(true);
});

test("ignores other states, origins, and junk", () => {
  expect(isPlayerEnded(PLAYER_ORIGIN, JSON.stringify({ event: "infoDelivery", info: { playerState: 1 } }))).toBe(false);
  expect(isPlayerEnded(PLAYER_ORIGIN, JSON.stringify({ event: "onStateChange", info: 1 }))).toBe(false);
  expect(isPlayerEnded("https://evil.test", JSON.stringify({ event: "onStateChange", info: 0 }))).toBe(false);
  expect(isPlayerEnded(PLAYER_ORIGIN, "nope")).toBe(false);
  expect(isPlayerEnded(PLAYER_ORIGIN, { event: "onStateChange", info: 0 })).toBe(false);
});
