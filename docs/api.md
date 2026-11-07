# API

OpenHackerTube has no accounts, no write API, and no proxy to hackertube.org. Pages are server-rendered from `data/catalog`. The browser receives HTML for one view, plus the small library record it already stores. Large JSON stays on the server.

The closed HackerTube `/api/feed` route is not implemented and is not called. The source `robots.txt` disallowed `/api/` and `/download/`. This app does not fetch either prefix. The source sitemap returned 404 and is not republished here.

## Feed

`GET /`

The feed is reconstructed in this process from the public client contract and the about-page section list.

| Query | Meaning |
| --- | --- |
| `likes` | Comma-separated video ids the viewer liked |
| `dislikes` | Comma-separated video ids the viewer disliked |
| `seen` | Comma-separated video ids the viewer already opened |
| `seed` | Opaque string that keeps anonymous order stable |

Empty parameters mean an empty list or the default seed. Ids that are not in the catalogue are ignored. Disliked and seen ids are omitted from every section.

Section order with no likes: classics, recent favorites, hidden gems, unexplored topics. When `likes` is non-empty, the response adds similar videos (shared categories, tags, or topic text) and co-recommendations from `data/catalog/related.jsonl`.

The response is the home page, not the full catalogue.

## Browse and search

`GET /browse`

| Query | Meaning |
| --- | --- |
| `q` | Lexical query |
| `dur` | Length filter. `xlong` is the Longs view and reads duration only from local private metadata |
| `area` | Area id |
| `category` | Category id |
| `shelf` | `shelf_life` value: `evergreen`, `dated`, or `news` |
| `type` | `content_type` value such as `talk` or `lecture` |
| `page` | 1-based page index |

`q` is matched against titles, summaries, tags, and taxonomy descriptions. Matching is case-insensitive. Semantic embeddings are not loaded. Private view counts, like counts, and publish dates are not searchable and are not returned.

`GET /browse?dur=xlong` is the Longs page linked from the sidebar and the mobile bar.

Category, area, and playlist pages:

- `GET /categories`
- `GET /c/[id]`
- `GET /a/[id]`
- `GET /playlists`
- `GET /p/[slug]`

`[id]` and `[slug]` are the ids and slugs stored in `data/catalog`. Unknown ids return a not-found page. These list pages may also take `page`, `q`, `shelf`, and `type`.

## Watch

`GET /watch/[vid]`

`[vid]` is the 11-character YouTube id, equal to `videos.vid`. The page includes:

- title, channel, channel link, summary, `why_hn`, tags, categories, score, and the kept HN quote when one exists
- embed URL `https://www.youtube-nocookie.com/embed/<vid>`
- thumbnail URL derived as `hq2.jpg` or `hqdefault.jpg` (see frame toggle below)
- the kept mentions for that video (at most 20)
- related videos for that `vid`, ordered by `shared_recommenders`, at most 20

The page omits view count, like count, and publish time. It includes duration only when `data/private/youtube-meta.jsonl` exists on that server. A public deployment must omit the private file, so public watch pages omit duration as well.

The player is an embed. The response does not contain video bytes.

## Library pages

`GET /liked`, `GET /later`, and `GET /history` render the shell. The ids come from the `openhackertube` localStorage record in the browser. The server does not store them and there is no cookie session.

`GET /settings` renders the theme control and the frame toggle. Those values are also local only.

Frame toggle off means the derived thumbnail is `https://i.ytimg.com/vi/<vid>/hqdefault.jpg`. Frame toggle on, the default, means `https://i.ytimg.com/vi/<vid>/hq2.jpg`.

## Card fields

A card sent to the browser can include:

- `vid`, `title`, `channel`, `channel_slug`
- `summary` (the HackerTube summary, not a YouTube description)
- `why_hn`, `score`, `content_type`, `level`, `shelf_life`, `primary_topic`
- `tags` and category ids and names
- derived `thumbnail_url` and `embed_url`
- HN recommendation facts that are already on the video record: recommender count, recommendation months, strong recommendations, first year, last year

A card must not include `views`, `likes`, `published`, or a stored thumbnail URL from the pre-import snapshot. Mention `text` belongs on the watch page for that video, not on every card in a grid.

## Catalogue files

These files are server inputs, not public downloads:

| File | Row |
| --- | --- |
| `data/catalog/videos.jsonl` | One licensed video |
| `data/catalog/mentions.jsonl` | One HN comment linked to a `vid` |
| `data/catalog/related.jsonl` | One video's co-recommendations |
| `data/catalog/categories.json` | One category, with `video_count` and description |
| `data/catalog/areas.json` | One area and its categories |
| `data/catalog/playlists.json` | One playlist: slug, title, pitch, intro, items |
| `data/catalog/channels.json` | One channel slug and video count |
| `data/catalog/import-report.json` | Counts from the last import |

`data/private/youtube-meta.jsonl` lines look like `{ "vid", "duration_s", "views", "likes", "published" }`. Treat that file as local hydration. Do not add a route that returns it.

## Credits on data responses

Any about or data view should state that the catalogue is ODC-By 1.0 from HackerTube and that HN text is from open-index/hacker-news. Comments stay attributed to their authors. The UI is not affiliated with YouTube, Google, Hacker News, or Y Combinator.
