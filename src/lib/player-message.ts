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
