export type NavMatch = { href: string; match?: readonly string[] };

function pathMatches(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * The single most specific link for the current URL: its path (or one of `match`) must
 * contain the pathname and every query pair in its href must be present. More query
 * pairs wins, so `/browse?dur=xlong` beats `/browse` on `/browse?dur=xlong&sort=hn`.
 * `params` is null while search params are unknown (prerender); then nothing is current.
 */
export function activeHref(links: readonly NavMatch[], pathname: string, params: Pick<URLSearchParams, "get"> | null): string | undefined {
  if (!params) return undefined;
  let best: string | undefined;
  let score = -1;
  for (const link of links) {
    const [path, qs = ""] = link.href.split("?");
    if (!(link.match ?? [path]).some((candidate) => pathMatches(pathname, candidate))) continue;
    const pairs = [...new URLSearchParams(qs)];
    if (!pairs.every(([key, value]) => params.get(key) === value)) continue;
    if (pairs.length > score) {
      best = link.href;
      score = pairs.length;
    }
  }
  return best;
}
