# Architecture

HTube is a Next.js App Router application (Next 16, React 19, Tailwind 4) run with bun. Visual decisions live in `design.md` and surface as CSS variables in `src/app/globals.css`. Components use semantic tokens only.

## High-level design

```text
Browser                                   Next.js server
-------                                   --------------
localStorage  oht.library.v1  ----POST /api/feed (library in body)--->  ranker (src/lib/engine.ts)
sessionStorage oht.queue                  data/catalog (index, shards, taxonomy, playlists)
IndexedDB openhackertube <---GET /api/sync/*--- copied once, shard by shard
YouTube embed (iframe) <--postMessage--> watch page Player
```

Functional requirements are in `docs/prd.md`. Non-functional goals:

- No accounts and no server state. The server is stateless apart from in-memory indexes built from `data/catalog` (rebuilt when file mtimes change).
- Personal data never persists on the server. The library is sent in a POST body, used for ranking, and discarded.
- First paint is server-rendered. The personalized feed swaps in after hydration with a crossfade.
- Works at 375px with no horizontal overflow; respects `prefers-reduced-motion` and `prefers-contrast`.
- Low cost: static-ish pages, cacheable sync files (`max-age=86400`), no database.

## Routes

| Page | Path | Notes |
| --- | --- | --- |
| Home | `/` | Server renders a fresh-seed feed; client replaces it with the personalized feed |
| Browse | `/browse` | Filters in the query string; `?dur=xlong` is Longs |
| Search | `/search` | `q` plus filters, list rows |
| Categories, category, area | `/categories`, `/c/[id]`, `/a/[id]` | |
| Playlists, playlist | `/playlists`, `/p/[slug]` | Playlist sidebar with Play all and Shuffle |
| Watch | `/watch/[vid]` | Query: `list=<slug>` playlist mode, `mix=1` mix, `rel=channel` related from the same channel |
| Channel | `/channel/[slug]` | `tab=videos` or `tab=about`, default Home |
| Commenter profile | `/u/[author]` | `tab=comments`, default Videos; 404 for invalid or unknown names |
| Subscriptions | `/subscriptions` | |
| Trending | `/trending` | `tab=talks`, `lectures`, `documentaries`, `programming`; default Now |
| You | `/you` | Hub of history, watch later, liked and subscriptions shelves |
| History, Watch later, Liked | `/history`, `/later`, `/liked` | Client-rendered from the local library |
| Settings | `/settings` | Theme, frames, keyboard shortcuts |
| About | `/about` | |
| Metadata | `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` | Manifest is `src/app/manifest.ts` |

API routes are in `docs/api.md`: `GET` and `POST /api/feed`, `GET /api/suggest`, `GET /api/subscriptions`, `GET /api/cards`, and `GET /api/sync/{manifest,index,taxonomy,playlists,shard/[id]}`.

## Catalogue

`bun run import` (`scripts/import_licensed.py`) writes `data/catalog`: `index.json` (slim row per video), `shards/00.json` to `15.json` (videos, mentions, related edges), `taxonomy.json`, `playlists.json`, `channels.json`, `manifest.json`, `import-report.json`. YouTube view, like, duration and publish fields go only to gitignored `data/private/youtube-meta.jsonl`, which no code reads.

`src/lib/server-catalog.ts` loads the files, builds an `Engine` (cards, `byId`, categories, areas, playlists, related edges) and caches it keyed on file mtime. The browser builds the same `Engine` from IndexedDB in `src/lib/client-catalog.ts` (database `openhackertube`, stores `kv` and `shards`, schema version 2). Sync is deferred to idle time and downloads shards one at a time. A watch page needs only its own shard.

Thumbnails are derived: `https://i.ytimg.com/vi/<vid>/hq2.jpg` (middle frame, default) or `hqdefault.jpg` when frames are off. Embeds use `https://www.youtube-nocookie.com/embed/<vid>`.

`score` is distinct months with a recommendation plus 0.5 per month with a strong recommendation. `shelfLife` `news` marks single-event videos.

## Home feed ranker

`buildFeed` in `src/lib/engine.ts`. Deterministic for a given library and seed.

Eligible pool: not disliked, not `news` shelf, `recommenders > 0`.

Profile (a sparse weight map). Each video contributes features: `ch:<channel>` 1, `t:<contentType>` 0.3, `l:<level>` 0.2, `c:<category>` 1 for each category, and `a:<area>` 0.5 for each category's area. Signals scale those features:

| Signal | Weight |
| --- | --- |
| Like | +3 |
| Watched (last 60 of `seen`, not disliked) | `0.5^(age / 20)`, age counted in positions from the newest |
| Dislike | -2 |

Positive signals also add co-recommendation neighbours: each related edge adds `weight * shared_recommenders` to that neighbour.

Score per candidate:

```text
rank = 1.0 * quality + 1.6 * affinity + 0.8 * neighbour + 0.3 * fresh + 0.6 * gumbel
       - 5 if seen
quality   = card.score / max score in pool
affinity  = sum(profile[feature] * share) / max |affinity|
neighbour = neighbour weight / max neighbour weight
fresh     = 0.5 if evergreen + 0.5 if firstYear >= 2024
gumbel    = -ln(-ln(u)), u = mulberry32(seed xor fnv1a(vid))
```

Affinity is 0 when the profile is empty (no likes, history or dislikes).

Selection is a greedy pass over the ranked list:

- Diversity: within the last 11 picks plus the candidate (window 12), at most 2 videos per channel and at most 4 per category. If nothing fits in the next 400 candidates, the top remaining item is taken.
- Exploration: when personal, each slot draws `rng() < 0.3` from `mulberry32(seed xor 0x9e3779b9)`. On a hit it takes from the "outside" list: videos none of whose categories have a positive profile weight and that are unseen. Otherwise it takes from the exploit list.
- Paging: only the prefix up to `offset + limit` (limit capped at 60) is built, then sliced. `PAGE` is 24.

Seeds: `freshSeed()` (random 32 bit) on the server render, and `crypto.getRandomValues` once per page load on the client (`pageSeed` in `home-feed.tsx`). Requests within one load reuse that seed so infinite scroll never repeats. `dailySeed()` (days since epoch) backs the anonymous `GET /api/feed?path=/` continuation.

Reasons shown on cards: co-recommended ("People who recommended your likes also recommend this"), similar (affinity above 0.3), unexplored topic, HN classic (evergreen, 10+ months, 8+ recommenders), recent favorite (first year 2024 or later, 2+ recommenders), else "More from the catalogue".

`personalFeed` in `src/lib/pages.ts` adds, on the first page only, `because` (the last liked video and its `relatedTo` neighbours) and `later` (up to 12 watch-later cards, newest first, minus dislikes). It validates the body with `parseFeedBody` (arrays of strings, 2000 max each).

## Search and suggestions

`search` scores each card: title phrase +50; per term title +8, channel +6, primary topic +6, tag +5, why-HN +3, summary +2, category name +4; category description phrase match +6 (shown as "Topic match"). Results with a top score under 12 are flagged weak.

`suggest` (`src/lib/suggest.ts`): trims, lowercases, caps the query at 80 characters. Matches titles (non-news, recommended), channel names and category names. Rank is prefix (0), word start (1), substring (2); ties by score. The result has at most 2 channels and 2 topics, the rest titles, 10 total, sorted by rank. Title suggestions link to `/search?q=`, channels to `/channel/<slug>`, topics to `/c/<id>`. Recent searches live in `oht.recentSearches`.

## Trending

`rankTrending` in `src/lib/trending.ts`, over all mentions, window of 24 months ending at the newest month in the data:

```text
sum  = sum over mentions of stanceWeight * 0.5^(ageMonths / 6)
people = distinct authors with weight >= 1.5 inside the window
score = sum * (1 + 0.1 * min(people, 10)) / (1 + allTimeMentions)^0.35
```

Stance weights: `strong_rec` 2, `rec` 1.5, `reference` 0.5, `critical` 0.25, `joke` 0. Videos with `sum <= 0` are dropped. `lastYear` counts mentions in the last 12 months. The page filters by tab and keeps the top 50.

## Author index

`getAuthorMentions` and `getTopAuthors` in `server-catalog.ts` build, once per catalogue mtime, a map from HN author to their kept mentions plus a count-sorted author list. `/u/[author]` validates the name with `isAuthor` (`^[A-Za-z0-9_-]{1,15}$`), 404s when there are no mentions, and derives videos, comment count and active years from them.

## Channels

`src/lib/channels.ts` memoizes per `Engine`: cards by channel, channel stats (videos, comments, years, top topics, main format), a generated description, top channels per category or area, related categories (same-area siblings, then co-occurring), similar channels (co-recommendation weight from the channel's top 10 videos), and top commenters. `subscriptionCards` returns videos from subscribed slugs, sorted by `lastYear` then score.

## Mix

`buildMix` in `src/lib/mix.ts` is a breadth-first walk of `relatedTo` (co-recommended, non-disliked, eligible, 8 neighbours per node) from the seed video, deduplicated, capped at 25. It is deterministic. The watch page builds it for `?mix=1` and the Mix panel shows it.

## Player protocol

The watch iframe is `youtube-nocookie.com/embed/<vid>?rel=0&enablejsapi=1&origin=<site origin>`. `src/lib/player-message.ts` holds the pure parts; `Player` in `watch-actions.tsx` wires them.

- Handshake on iframe load: post `{event:"listening",id:1,channel:"widget"}` then `{event:"command",func:"addEventListener",args:["onStateChange"]}` to the player origin.
- Incoming messages are accepted only from the iframe window and the origin `https://www.youtube-nocookie.com`.
- End detection: `{event:"onStateChange",info:0}` or `infoDelivery` with `playerState` 0 sets `ended`. With autoplay on and a next target, the Up next card counts down 5 seconds and navigates; Escape cancels.
- State tracking: `infoDelivery` supplies `currentTime`, `duration`, `playerState`, `muted`, merged into a ref.
- Commands: `{event:"command",func,args}` for `playVideo`, `pauseVideo`, `seekTo [seconds,true]`, `mute`, `unMute`.
- Shortcuts: `watchAction(key, shift)` maps k or Space (toggle), j and l (-10, +10), Left and Right (-5, +5), 0 to 9 (percent of duration), m, f (fullscreen on the player box), Shift+N and Shift+P (next, previous). `seekTarget` clamps to `[0, duration]`. Keys are ignored while typing in a field. A bubble flashes the action.
- Next target order: queue first, then the playlist's next item, the mix chain, or the top related videos, skipping disliked ones. On mount the video is marked seen and removed from the queue.

## Component layering

1. Tokens: `globals.css` variables and utilities (`press`, `hit`, z-index scale).
2. `src/components/ui.ts`: shared class strings and the type scale (chips, pills, icon buttons, panels, grids, headings, titles, list rows, tile width).
3. Primitives: `channel/avatar.tsx` (`Avatar`, sizes `xs`, `sm`, `md`, `row`, `lg`, `xl`, `comment`), `identity-header.tsx`, `tabs.tsx` (`UnderlineTabs`), `section.tsx` (`Section`), `shelf.tsx` (`Shelf`, `CardShelf`, tiles), `filters.tsx` (`ChipBar`, `FilterBar`, `Pager`), `status-panel.tsx` (`StatusPanel`), `snackbar.tsx` (`useSnackbar`), `page-header.tsx`.
4. Composites: `video-card.tsx`, `library-page.tsx`, `playlist-sidebar.tsx`, `infinite-feed.tsx`, `comments.tsx`, `subscribe-button.tsx`.
5. Page components in `home/`, `channel/`, `profile/`, `history/`, `trending/`, `you/`, `settings/`, `topic/`.
6. Pages in `src/app`.

Server pages stay server components; client islands are the library, player, feeds and search box.

## Client storage schema

`oht.library.v1` (localStorage), parsed defensively with defaults:

```json
{
  "likes": [], "dislikes": [], "later": [], "seen": [],
  "subs": [], "frames": true, "seenAt": {}, "paused": false
}
```

`seen` is oldest first and capped at 500; re-watching moves an id to the end. `seenAt` maps id to epoch milliseconds and is pruned to `seen`. A repeat of the newest id within 60 seconds is ignored, and nothing is recorded while `paused`. Liking removes a dislike and the reverse. Cross-tab changes sync through the `storage` event.

Other keys: `oht.theme`, `oht.autoplay`, `oht.recentSearches`, `oht.rail` (localStorage), `oht.queue` and `oht.queue.meta` (sessionStorage), IndexedDB `openhackertube`.

## Dependencies

next, react, react-dom, lucide-react; dev: tailwindcss with `@tailwindcss/turbopack`, typescript, eslint. Roboto loads through `next/font`. Tests use `bun test`.
