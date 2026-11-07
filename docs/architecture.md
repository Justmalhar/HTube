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
| Data | `/data` | License, counts, and credits |

Search text and filters are query parameters. See `docs/api.md` for the keys. Library membership is not a query parameter. It lives in the browser.

## Catalogue

The committed catalogue is the HackerTube official export generated 2026-10-31, under the Open Data Commons Attribution License (ODC-By) 1.0. Credit HackerTube (https://hackertube.org) and the [open-index/hacker-news](https://huggingface.co/datasets/open-index/hacker-news) dataset. Hacker News comments remain the work of their authors. Titles and channel names belong to their creators.

`bun run import` runs `scripts/import_licensed.py`. The script reads the delivered combined snapshot at `/tmp/oht-extract/hackertube-complete.json` and writes:

- `data/catalog/videos.jsonl`
- `data/catalog/mentions.jsonl`
- `data/catalog/related.jsonl`
- `data/catalog/categories.json`
- `data/catalog/areas.json`
- `data/catalog/playlists.json`
- `data/catalog/channels.json`
- `data/catalog/import-report.json`

The importer refuses to finish unless the snapshot contains 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 HN mentions, and 3778 related records.

These YouTube fields are removed from the committed videos: `published`, `duration_s`, `views`, `likes`, `thumbnail`, and `minutes`. Duration, view count, like count, and publish time are written only to gitignored `data/private/youtube-meta.jsonl`. The UI may show duration on a thumbnail when that local file is present. View counts, like counts, and upload dates are never shown.

Thumbnails are not stored. The default image is the derived middle frame `https://i.ytimg.com/vi/<vid>/hq2.jpg`. The frame toggle switches to the derived uploader image `https://i.ytimg.com/vi/<vid>/hqdefault.jpg`. The player uses the privacy-enhanced embed `https://www.youtube-nocookie.com/embed/<vid>` (also stored as `embed_url`). No video files are hosted.

`videos.score` is the HackerTube ranking signal: distinct months with a recommendation, plus half a point for each month that includes a strong recommendation. Only mention stances `rec` and `strong_rec` are recommendations. `shelf_life` of `news` marks a video that only matters around one event. The home feed prefers evergreen and dated talks. At most 20 mentions are kept per video, and mention text is cut at 1500 characters.

The official zip manifest listed `embeddings.npy` and `embedding_ids.json`. Those arrays were not in the delivered combined JSON. The importer does not write them, and the app does not ship semantic search.

Server code reads `data/catalog`. A page receives one page of cards, the open video, or one playlist. The combined JSON and the jsonl files stay on the server and are not imported into a client component.

This project does not recrawl hackertube.org. The captured `data/source/robots.txt` disallows `/api/` and `/download/`. The source sitemap request returned 404, which `data/source/coverage.json` records. Personal likes, history, and watch later were never public records on the source.

## Home feed

The home feed is rebuilt in this app from the public HackerTube client contract and the about-page description. The closed `/api/feed` source is not called.

Query inputs are `likes`, `dislikes`, `seen`, and `seed`. Each of `likes`, `dislikes`, and `seen` is a comma-separated list of 11-character video ids. `seed` is an opaque string stored in the browser so a reload keeps the same anonymous order.

With an empty library the sections are, in order: classics, recent favorites, hidden gems, unexplored topics. After the viewer likes at least one video, the feed adds similar videos and co-recommendations. Similar videos share categories, tags, or topic text with the liked videos. Co-recommendations come from `related.jsonl` (`shared_recommenders`), most overlap first. Disliked ids and seen ids drop out of the shelves. The seed only shuffles within a section. It does not change which section a video belongs to.

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
