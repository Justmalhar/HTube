# Architecture

OpenHackerTube is a Next.js App Router application. bun installs and runs it. Tailwind styles it. Visual decisions come from `design.md` and are exposed as CSS variables in `src/app/globals.css`. Components use those semantic tokens. Hex values stay in the token layer.

The layout follows YouTube's information architecture: a fixed top bar, a collapsible sidebar, video cards, and a watch page with a player and a related column. The accent is Hacker News orange `#FF6600`. Dark cinematic surfaces are the default (`#0F0F0F` background, `#272727` surface). A light theme uses the same geometry with the light tokens in `design.md`.

## Chrome

The top bar is 56px and fixed. The leading edge holds the menu button and the logo. The center holds one search field, 40px tall, pill shaped, at most 640px wide. The trailing edge holds the theme toggle.

The sidebar is 240px. It collapses to a 72px rail of 24px icons, and the labels hide on the rail. Destinations stay in this order on every page: Home, Longs, Categories, Playlists, Liked, Watch later, History, Settings. Below 800px the sidebar becomes a dialog drawer, and a bottom bar holds Home, Longs, Categories, Library, and Search. Pages must not scroll sideways at 375px.

Main content clears the top bar. On a watch page the related column is 402px and moves below the player when the screen is narrow. Video grids keep each card at least 300px wide and choose columns from the container width, so an open sidebar does not crush the titles.

The logo is a rounded orange square with a white Y, plus the wordmark **Hacker** in the text color and **Tube** in the primary color. The accessible name is OpenHackerTube. The mark is not the Y Combinator logo. The product is not affiliated with Y Combinator, Hacker News, YouTube, or Google.

## Page structure

Every page that has a title uses one `PageHeader`. On desktop the actions sit on the title row, vertically centered on the heading, with one shared action width so sibling pages do not jump. The description is a single short benefit line under the title, about 30 to 45 characters, and it spans the row. On phones the actions stack full width under the description. Counts belong in chips, not in the description.

Settings, playlists, and categories are list rows: icon or swatch, name, one short line, and the control or link. Video results stay cards. A video card is one link to `/watch/[vid]`. The channel is a separate link. Recommendation facts are separate text nodes with a gap. Do not join them with a middle dot, a bullet, or an em dash. Do not use a colored left border on cards, quotes, or callouts.

Buttons and chips are 36px tall with an 18px radius. Icon buttons are circles. Focus is a 2px primary outline, offset 2px. Filters are links, and the URL query string is the filter state.

Hover darkens a surface by one step (`surface-hover`). The sticky chip row does not use a blur band. A short fade of the background color is enough. Animations respect `prefers-reduced-motion`.

Type is Roboto, with Arial and sans-serif as fallbacks, at a 14px base. Card titles are 16px, weight 500, clamped to two lines. The wordmark is 18px. Page titles are 20px. Thumbnail radius is 12px, in a 16:9 frame.

## Routes

| Page | Path | What it shows |
| --- | --- | --- |
| Home | `/` | Reconstructed feed |
| Browse and search | `/browse` | Catalogue, search, and filters |
| Longs | `/browse?dur=xlong` | Long videos |
| Categories | `/categories` | 150 categories as list rows |
| Category | `/c/[id]` | Videos in one category |
| Area | `/a/[id]` | Categories in one of 16 areas |
| Playlists | `/playlists` | 27 playlists as list rows |
| Playlist | `/p/[slug]` | Ordered videos in that playlist |
| Watch | `/watch/[vid]` | Embed, summary, mentions, related |
| Liked | `/liked` | Local likes |
| Watch later | `/later` | Local watch later list |
| History | `/history` | Local watch history |
| Settings | `/settings` | Theme and frame toggle |
| About | `/about` | What the catalogue is |

Search text and filters are query parameters. See `docs/api.md` for the keys. Library membership is not a query parameter. It lives in the browser.

## Catalogue

The committed catalogue is the official export generated 2026-10-31.

`bun run import` runs `scripts/import_licensed.py`. The script reads the delivered combined snapshot at `/tmp/oht-extract/hackertube-complete.json` and writes a small database, not one combined dump:

- `data/catalog/index.json`: slim row for all 6454 videos (title, channel, scores, category ids, shard id). No comment text and no summary.
- `data/catalog/shards/00.json` through `15.json`: 16 shards. Each holds the licensed video records, HN comments, and co-recommendation edges for that slice (about 3 MB).
- `data/catalog/taxonomy.json`: 16 areas and 150 categories.
- `data/catalog/playlists.json`: 27 playlists, in order, with notes.
- `data/catalog/channels.json`: channel slug and video count.
- `data/catalog/manifest.json`: version, shard sizes, and counts.
- `data/catalog/import-report.json`: the last import check.

The importer refuses to finish unless the snapshot contains 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 HN mentions, and 3778 related records.

These YouTube fields are removed from the committed videos: `published`, `duration_s`, `views`, `likes`, `thumbnail`, and `minutes`. The same fields are written only to gitignored `data/private/youtube-meta.jsonl`. The app does not read that file into pages or into IndexedDB. View counts, like counts, upload dates, and durations are not shown.

Thumbnails are not stored. The default image is the derived middle frame `https://i.ytimg.com/vi/<vid>/hq2.jpg`. The frame toggle switches to the derived uploader image `https://i.ytimg.com/vi/<vid>/hqdefault.jpg`. The player uses the privacy-enhanced embed `https://www.youtube-nocookie.com/embed/<vid>` (also stored as `embed_url`). No video files are hosted.

`videos.score` is the source ranking signal: distinct months with a recommendation, plus half a point for each month that includes a strong recommendation. Only mention stances `rec` and `strong_rec` are recommendations. `shelf_life` of `news` marks a video that only matters around one event. The home feed prefers evergreen and dated talks. At most 20 mentions are kept per video, and mention text is cut at 1500 characters.

The official zip manifest listed `embeddings.npy` and `embedding_ids.json`. Those arrays were not in the delivered combined JSON. The importer does not write them, and the app does not ship semantic search.

The server reads `data/catalog` and renders one page of cards. After the first visit the browser saves `index.json`, the taxonomy, and the playlists in IndexedDB, then downloads shards one at a time. A watch page needs only the shard named on that video. Comment text is not in the index. YouTube image and embed hosts are the only ongoing media requests once the shards are stored. The combined snapshot is not imported into a client component.

This project does not recrawl the source site. The captured `data/source/robots.txt` disallows `/api/` and `/download/`. The source sitemap request returned 404, which `data/source/coverage.json` records. Personal likes, history, and watch later were never public records on the source.

## Home feed

The home feed is rebuilt in this app from the public source client contract and the about-page description. The closed `/api/feed` source is not called.

Query inputs are `likes`, `dislikes`, `seen`, and `seed`. Each of `likes`, `dislikes`, and `seen` is a comma-separated list of 11-character video ids. `seed` is an opaque string stored in the browser so a reload keeps the same anonymous order.

With an empty library the lanes are, in order: classics, recent favorites, hidden gems (few mentions, mostly strong recommendations), then topics outside that first classic set. After a like, similar videos (shared categories) and co-recommendations come first. Co-recommendations are the `related` edges stored in the same shard as the video (`shared_recommenders`). Disliked ids are dropped. Seen ids move to the end. The public mix uses a fixed order so the server page and the on-device copy match. Hidden gems here are not the source's "under 100k views" cut, because view counts are not in the catalogue.

## Search

Lexical search matches `q` against titles, summaries, tags, and taxonomy descriptions. Category descriptions in the taxonomy are included because they list synonyms. Embeddings are not consulted. Channel names, mention bodies, and private YouTube statistics are not part of the query.

## Library

There are no accounts and no server session. One `localStorage` key, `openhackertube`, holds:

```json
{
  "likes": [],
  "dislikes": [],
  "watchLater": [],
  "history": [],
  "theme": "dark",
  "frames": true
}
```

`likes`, `dislikes`, and `watchLater` are arrays of video ids. `history` is an array of `{ "vid", "at" }` with `at` as an ISO timestamp, newest first. `theme` is `dark` or `light`. `frames` defaults to `true`, which selects the `hq2.jpg` middle frame. Opening a watch page appends history. The feed reads this record when it builds `likes`, `dislikes`, and `seen`.
