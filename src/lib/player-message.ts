export const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

/** True when a window message is the YouTube IFrame API reporting that playback ended (state 0). */
export function isPlayerEnded(origin: string, data: unknown): boolean {
  if (origin !== PLAYER_ORIGIN || typeof data !== "string") return false;
  try {
    const message = JSON.parse(data) as { event?: string; info?: unknown };
    if (message.event === "onStateChange") return message.info === 0;
    const info = message.info as { playerState?: number } | null;
    return message.event === "infoDelivery" && info?.playerState === 0;
  } catch {
    return false;
  }
}

export type PlayerInfo = { currentTime?: number; duration?: number; playerState?: number; muted?: boolean };

/** Player fields from an infoDelivery message, or null for anything else (wrong origin, junk, other events). */
export function parsePlayerInfo(origin: string, data: unknown): PlayerInfo | null {
  if (origin !== PLAYER_ORIGIN || typeof data !== "string") return null;
  try {
    const message = JSON.parse(data) as { event?: string; info?: Record<string, unknown> | null };
    if (message.event !== "infoDelivery" || !message.info || typeof message.info !== "object") return null;
    const { currentTime, duration, playerState, muted } = message.info;
    const out: PlayerInfo = {};
    if (typeof currentTime === "number") out.currentTime = currentTime;
    if (typeof duration === "number") out.duration = duration;
    if (typeof playerState === "number") out.playerState = playerState;
    if (typeof muted === "boolean") out.muted = muted;
    return out;
  } catch {
    return null;
  }
}

/** Serialized IFrame API command, ready for postMessage. */
export function playerCommand(func: string, args: unknown[] = []): string {
  return JSON.stringify({ event: "command", func, args });
}

export type WatchAction =
  | { type: "toggle" }
  | { type: "seek"; by: number }
  | { type: "seekPercent"; percent: number }
  | { type: "mute" }
  | { type: "fullscreen" }
  | { type: "next" }
  | { type: "previous" };

/** Maps a key to a watch-page action (YouTube bindings); null when the key is not one. */
export function watchAction(key: string, shift: boolean): WatchAction | null {
  if (shift) return key === "N" ? { type: "next" } : key === "P" ? { type: "previous" } : null;
  switch (key) {
    case "k":
    case " ":
      return { type: "toggle" };
    case "j":
      return { type: "seek", by: -10 };
    case "l":
      return { type: "seek", by: 10 };
    case "ArrowLeft":
      return { type: "seek", by: -5 };
    case "ArrowRight":
      return { type: "seek", by: 5 };
    case "m":
      return { type: "mute" };
    case "f":
      return { type: "fullscreen" };
    default:
      return /^[0-9]$/.test(key) ? { type: "seekPercent", percent: Number(key) * 10 } : null;
  }
}

/** Seek target in seconds, clamped to [0, duration] (duration 0 or unknown means no upper bound). */
export function seekTarget(current: number, duration: number, action: { by: number } | { percent: number }): number {
  const raw = "by" in action ? current + action.by : (duration * action.percent) / 100;
  return Math.min(Math.max(raw, 0), duration > 0 ? duration : Infinity);
}
