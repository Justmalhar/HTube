# Tasks

Work is done when `bun test`, `bun run typecheck`, `bun run lint`, and `bun run build` pass, and the acceptance lines in `docs/prd.md` hold. Do not recrawl the source site.

## Catalogue

- [x] `scripts/import_licensed.py` reads `/tmp/oht-extract/hackertube-complete.json` and writes `data/catalog` plus gitignored `data/private/youtube-meta.jsonl`.
- [x] The importer checks 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 mentions, and 3778 related records.
- [x] Committed video rows drop `published`, `duration_s`, `views`, `likes`, `thumbnail`, and `minutes`.
- [ ] `bun run import` is the command contributors run for that script.
- [ ] `data/private` stays gitignored, including `youtube-meta.jsonl` and any export zip.
- [x] Server loaders read `data/catalog` shards and `index.json`. Client components do not import those files. They use `/api/sync/*`.
- [ ] Do not add `embeddings.npy`. It was on the official zip manifest and was not in the delivered combined JSON.

## Shell

- [ ] Map `design.md` onto semantic variables in `src/app/globals.css`. Components consume tokens, not a second palette.
- [ ] Roboto at 14px. Primary `#FF6600`. Dark background `#0F0F0F`, surface `#272727`, and the light pair from `design.md`.
- [ ] Fixed 56px top bar: menu, logo, one pill search (max 640px), theme toggle.
- [ ] Sidebar 240px with destinations in this order: Home, Longs, Categories, Playlists, Liked, Watch later, History, Settings. Collapse to a 72px rail of 24px icons.
- [ ] Below 800px, use a drawer and a bottom bar: Home, Longs, Categories, Library, Search. No horizontal overflow at 375px.
- [ ] One `PageHeader`. Desktop actions share one width. Descriptions stay one short benefit line.
- [ ] List rows for settings, playlists, and categories. Video cards for talks. 12px thumbnail radius. 18px button and chip radius.
- [ ] Separate text nodes for channel and recommendation facts. No middle-dot separators, no em dashes, no colored left borders.
- [ ] Hover uses `surface-hover`. No blur band behind the chip row. Honor `prefers-reduced-motion`.

## Pages

- [ ] `/` reconstructs the feed from `likes`, `dislikes`, `seen`, and `seed`. Sections: classics, recent favorites, hidden gems, unexplored topics, then similar and co-recommendations after a like. Do not call `/api/feed`.
- [ ] `/browse` applies `q`, `dur`, `area`, `category`, `shelf`, `type`, and `page`. Longs is `dur=xlong`.
- [ ] Lexical search covers titles, summaries, tags, and taxonomy descriptions only.
- [ ] `/categories`, `/c/[id]`, `/a/[id]`, `/playlists`, `/p/[slug]` read the committed catalogue.
- [ ] `/watch/[vid]` embeds `youtube-nocookie`, shows the summary, kept mentions, and related videos in a 402px column.
- [ ] Default thumbnail `hq2.jpg`. Frame toggle off uses `hqdefault.jpg`. Never render view count, like count, or upload date. Duration only from local private metadata.
- [ ] `/liked`, `/later`, `/history`, and `/settings` read and write the `openhackertube` localStorage record. No account UI.

## Tests

- [ ] Catalogue count and restricted-field tests.
- [ ] Feed section order, seed stability, dislike and seen suppression, and post-like similar plus co-recommendation tests.
- [ ] Search hits a taxonomy description and misses private YouTube statistics.
- [ ] Query-string round trip for search and filters.
- [ ] localStorage survives reload for likes, watch later, history, theme, and frames.
- [ ] A browse response does not contain the full video file.

## Deploy

- [ ] `bun run build` and `bun run start` serve the app with `data/catalog` present and `data/private` absent.
- [ ] Public pages still omit YouTube statistics.
