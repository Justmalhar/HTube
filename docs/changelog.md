# Changelog

## Unreleased

- Removed the `/data` page and in-app attribution; not-found pages now return 404; pagination replaced with infinite scrolling; new HN logo and Lucide icons.
- Documented the app as a Next.js App Router project run with bun and styled with Tailwind, using the `design.md` chrome: Hacker News orange `#FF6600`, Roboto at 14px, a 56px top bar, a 240px sidebar that collapses to a 72px rail, 12px thumbnail radius, 18px pill controls, and dark surfaces `#0F0F0F` and `#272727` plus a light theme.
- Recorded the polish rules used for pages: one page header, stable action width, short benefit lines, list rows for settings, playlists, and categories, semantic color tokens, and no em dashes, middle-dot separators, or colored left borders.
- Recorded the committed catalogue as the official export: 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 HN mentions, and 3778 related records.
- Recorded that `bun run import` rebuilds `data/catalog` and writes duration, view count, like count, and publish time only to gitignored `data/private/youtube-meta.jsonl`. Those YouTube fields are not part of the committed dataset. The UI does not show view counts, like counts, or upload dates.
- Recorded derived media URLs: `hq2.jpg` middle frames by default, `hqdefault.jpg` when the frame toggle is off, and youtube-nocookie embeds. No video files are hosted.
- Recorded the home feed as a local reconstruction from `likes`, `dislikes`, `seen`, and `seed`, with sections for classics, recent favorites, hidden gems, unexplored topics, then similar videos and co-recommendations after likes. The closed `/api/feed` source is not used.
- Recorded lexical search over titles, summaries, tags, and taxonomy descriptions. Semantic embeddings were on the official zip manifest, were absent from the delivered combined JSON, and are not shipped.
- Recorded a browser-only library in `localStorage` (`openhackertube`): likes, dislikes, watch later, history, theme, and frame toggle. There is no account system.
- Split the committed catalogue into `index.json` and 16 shards (`data/catalog/shards/00.json` through `15.json`) so comment text is not one 33 MB file. Sync routes are `/api/sync/manifest`, `/api/sync/index`, `/api/sync/taxonomy`, `/api/sync/playlists`, and `/api/sync/shard/:id`.
- Recorded the source constraint from the capture: robots.txt disallowed `/api/` and `/download/`, this project does not recrawl, and the sitemap request returned 404.
