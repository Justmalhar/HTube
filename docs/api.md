# API

HTube has no accounts and no stored server state. Pages are server-rendered from `data/catalog`. Route handlers live in `src/app/api`. None of them read `data/private`. Card objects below are the `Card` type in `src/lib/types.ts` (camelCase fields: `vid`, `title`, `channel`, `channelSlug`, `contentType`, `level`, `shelfLife`, `primaryTopic`, `tags`, `categories`, `score`, `recommenders`, `recMonths`, `strongRecs`, `mentions`, `firstYear`, `lastYear`, `whyHn`, `summary`, `quote`, `shard`). A feed card adds optional `reason` and `via`. Cards never include views, likes, durations or publish dates.

## Pages and their query keys

Browse, search, category, area and channel lists share these keys:

| Key | Meaning |
| --- | --- |
| `q` | Search text (`/search`) |
| `type` | Content type such as `talk` or `lecture` |
| `level` | Level |
| `area`, `category`, `channel` | Id or slug filters (pinned by `/a/[id]`, `/c/[id]`, `/channel/[slug]`) |
| `shelf` | `evergreen`, `dated` or `news` |
| `evergreen` | `1` keeps evergreen only |
| `gems` | `insistent` (or `1`) for hidden gems |
| `sort` | `hn` (default), `recent`, `title`, `oldest` |
| `news`, `cited` | `show` includes news and uncited videos; default hides them |
| `offset` | Item offset, 24 per batch |

`/browse?dur=xlong` is the Longs link; `dur` is not applied as a filter. Other page keys: `/watch/[vid]` takes `list`, `mix` and `rel=channel`; `/channel/[slug]` and `/u/[author]` take `tab`; `/trending` takes `tab`.

## GET /api/feed

Continuation for list pages and the anonymous home feed.

Query: `path` (required: `/`, `/browse`, `/search`, `/c/<id>`, `/a/<id>` or `/channel/<slug>`), plus the keys above and `seed` for `/`.

Response `200`: `{ "items": FeedCard[], "offset": number, "total": number }`. Unknown `path`: `404 { "error": "Unknown feed" }`.

## POST /api/feed

Personalized home feed. The library is request-only and is not stored.

Request body:

```json
{ "likes": ["vid"], "dislikes": ["vid"], "seen": ["vid"], "later": ["vid"], "seed": 123, "offset": 0 }
```

Each list keeps string entries only, at most 2000. `seed` and `offset` default to 0 when missing or not numeric. An invalid body is treated as empty.

Response `200`:

```json
{
  "items": [], "offset": 0, "total": 0,
  "because": { "title": "Last liked video", "items": [] },
  "later": []
}
```

`because` and `later` appear only when `offset` is 0. `because` is null when nothing is liked or no neighbours exist; `later` has up to 12 cards, newest first, without disliked ones. Offsets above 0 return only `items`, `offset` and `total`.

## GET /api/suggest

Query: `q`. Empty or blank returns no items. Response `200`, cached for 5 minutes (`Cache-Control: public, max-age=300`):

```json
{ "items": [{ "kind": "query" | "channel" | "topic", "text": "Rust", "href": "/search?q=Rust" }] }
```

At most 10 items; `channel` links to `/channel/<slug>`, `topic` to `/c/<id>`.

## GET /api/subscriptions

Query: `slugs` (comma-separated channel slugs, at most 500) and `offset` (default 0).

Response `200`:

```json
{ "items": [], "offset": 0, "total": 0, "channels": [{ "slug": "x", "name": "X" }] }
```

`items` are 24 cards from those channels, newest on HN first. `channels` lists the known subscribed channels and is empty when `offset` is above 0.

## GET /api/cards

Query: `ids` (comma-separated video ids, at most 500). Response `200`: `{ "items": Card[] }` in request order, unknown ids skipped. Used by You, History and the library pages to turn local ids into cards.

## Sync

These copy the catalogue to the device. `index`, `taxonomy`, `playlists` and `shard` send `cache-control: public, max-age=86400`.

| Route | Body |
| --- | --- |
| `GET /api/sync/manifest` | Version, shard list and counts |
| `GET /api/sync/index` | Slim index, one row per video |
| `GET /api/sync/taxonomy` | Areas and categories |
| `GET /api/sync/playlists` | The 27 playlists |
| `GET /api/sync/shard/[id]` | One shard (`00` to `15`): videos, mentions, related edges. Unknown id returns `404 { "error": "Unknown shard" }` |

## Catalogue files

| File | Holds |
| --- | --- |
| `data/catalog/index.json` | One slim row per video, including `shard` |
| `data/catalog/shards/00.json` to `15.json` | Videos, mentions, related edges |
| `data/catalog/taxonomy.json` | Areas and categories |
| `data/catalog/playlists.json` | Playlist order and notes |
| `data/catalog/channels.json` | Channel slug and video count |
| `data/catalog/manifest.json` | Shard map |
| `data/catalog/import-report.json` | Counts from the last import |

`data/private/youtube-meta.jsonl` is gitignored. Do not add a route that returns it.
