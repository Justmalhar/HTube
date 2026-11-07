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

import { parsePlayerInfo, playerCommand, seekTarget, watchAction } from "./player-message";

test("parses infoDelivery fields and rejects the rest", () => {
  const data = JSON.stringify({ event: "infoDelivery", info: { currentTime: 12.5, duration: 100, playerState: 1, muted: true, volume: 50 } });
  expect(parsePlayerInfo(PLAYER_ORIGIN, data)).toEqual({ currentTime: 12.5, duration: 100, playerState: 1, muted: true });
  expect(parsePlayerInfo("https://evil.test", data)).toBeNull();
  expect(parsePlayerInfo(PLAYER_ORIGIN, JSON.stringify({ event: "onReady" }))).toBeNull();
  expect(parsePlayerInfo(PLAYER_ORIGIN, "nope")).toBeNull();
});

test("builds commands", () => {
  expect(JSON.parse(playerCommand("seekTo", [5, true]))).toEqual({ event: "command", func: "seekTo", args: [5, true] });
  expect(JSON.parse(playerCommand("playVideo"))).toEqual({ event: "command", func: "playVideo", args: [] });
});

test("maps keys to actions", () => {
  expect(watchAction("k", false)).toEqual({ type: "toggle" });
  expect(watchAction(" ", false)).toEqual({ type: "toggle" });
  expect(watchAction("j", false)).toEqual({ type: "seek", by: -10 });
  expect(watchAction("ArrowRight", false)).toEqual({ type: "seek", by: 5 });
  expect(watchAction("4", false)).toEqual({ type: "seekPercent", percent: 40 });
  expect(watchAction("N", true)).toEqual({ type: "next" });
  expect(watchAction("P", true)).toEqual({ type: "previous" });
  expect(watchAction("x", false)).toBeNull();
  expect(watchAction("a", true)).toBeNull();
});

test("clamps seeks", () => {
  expect(seekTarget(3, 100, { by: -10 })).toBe(0);
  expect(seekTarget(95, 100, { by: 10 })).toBe(100);
  expect(seekTarget(50, 200, { percent: 30 })).toBe(60);
  expect(seekTarget(50, 0, { by: 10 })).toBe(60);
});
