export type FeedLibrary = { likes: string[]; dislikes: string[]; seen: string[]; later: string[] };

const ids = (value: unknown) => (Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 2000) : []);

/**
 * The only library fields `POST /api/feed` accepts. Subscriptions, watch times,
 * the frame toggle and the history pause flag are not part of this body.
 */
export function parseFeedBody(body: unknown) {
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const library: FeedLibrary = { likes: ids(raw.likes), dislikes: ids(raw.dislikes), seen: ids(raw.seen), later: ids(raw.later) };
  return { library, seed: Number(raw.seed) || 0, offset: Number(raw.offset) || 0 };
}
