# Testing

Run the checks from the repo root:

```bash
bun test
bun run typecheck
bun run lint
bun run build
```

`bun test` is the functional suite. `bun run typecheck` must pass with no TypeScript errors. `bun run lint` must pass ESLint. `bun run build` must finish a production build. Import changes should also pass `bun run import` against the local snapshot at `/tmp/oht-extract/hackertube-complete.json`.

## Catalogue

Assert the imported report and the files under `data/catalog` match the official export:

- 6454 videos
- 150 categories
- 16 areas
- 27 playlists
- 39834 HN mentions
- 3778 related records

Assert a committed video row has no `published`, `duration_s`, `views`, `likes`, `thumbnail`, or `minutes` field. Assert `data/private/youtube-meta.jsonl` is the only output that carries duration, views, likes, and publish time, and that this file is gitignored.

Assert every video id is unique, every mention and related id points at a video, and every playlist item points at a video. Assert category ids on videos exist in `taxonomy.json`. Assert the 16 shard files together contain every video, and that `index.json` names the same ids.

Assert thumbnail URLs are built as `https://i.ytimg.com/vi/<vid>/hq2.jpg` when frames are on, and `https://i.ytimg.com/vi/<vid>/hqdefault.jpg` when frames are off. Assert embed URLs use `https://www.youtube-nocookie.com/embed/<vid>`. Assert no test fixture or page response is a video file.

## Feed and search

The home feed is local. Tests should call the reconstruction directly and assert it never requests the upstream `/api/feed`.

With an empty library and a fixed `seed`, the section order is classics, then recent favorites, then hidden gems, then unexplored topics. The same seed and the same inputs return the same ids. A dislike or a seen id removes that video from the shelves. After a like, similar videos and co-recommendations appear. Co-recommendations must come from that video's `related` list, highest `shared_recommenders` first. Similar videos must be explainable from shared categories, tags, or topic text. Tests must not require an embedding file.

Lexical search must match on titles, summaries, tags, and taxonomy descriptions, including a synonym that appears only in a category description. A query that matches only a YouTube view count or a publish date must not hit, because those fields are not in the committed catalogue.

Search and filter state round-trips through the query string. Loading `/browse?q=vectors&category=pure-mathematics&dur=xlong&page=2` restores that text, category, length, and page. `/browse?dur=xlong` is the Longs view.

## Library

Use a fresh browser context so `localStorage` starts empty. Like, dislike, save to watch later, and open a watch page. Reload. The same ids are still in the `openhackertube` record, history has grown by that watch, and no request created an account.

Toggle theme and the frame switch. Reload. Dark or light and the thumbnail host path both stick. The watch page still embeds youtube-nocookie.

## UI

On Home, Browse, Categories, Playlists, Library, and Settings:

- There is one page heading, and header actions share one width so the bar does not jump between those pages.
- The description under a title is one short line. Counts sit in chips.
- Categories, playlists, and settings are list rows.
- Video cards show title, channel, and recommendation facts as separate text. A card does not show a view count, a like count, or an upload date.
- Thumbnails use a 12px radius. Header controls use an 18px radius. The top bar is 56px. The expanded sidebar is 240px and the rail is 72px.
- Keyboard focus is visible. Card and row targets are links or buttons.
- Copy and markup contain no em dash, no middle dot used as a separator, and no colored left border used as an accent.
- Colors come from the semantic variables defined from `design.md`.

At 375px the page does not scroll horizontally, the sidebar is a drawer, and the bottom bar shows Home, Longs, Categories, Library, and Search. With the sidebar open near 1024px, card titles still fit.

A reduced-motion preference disables non-essential transitions.

## Server boundary

View the page source for the home page and confirm it contains one page of cards, not a shard file and not `index.json`. Sync responses are separate requests the browser stores in IndexedDB.

## What a green run does not prove

`bun test` does not prove the private YouTube file is licensed for redistribution. Keep that file local. A green run also does not prove semantic search, because embeddings are not shipped.
