# Changelog

## Unreleased

Rebrand
- Renamed to HTube with a new H play mark; page title template, manifest and accessible names updated.
- Removed the `/data` page and in-app source attribution; unknown routes return a real 404.

Features
- Personalized home feed: seeded ranker over likes, decayed watch history, dislikes and co-recommendations; fresh seed on every load; 30% exploration; channel and category diversity caps. `POST /api/feed` carries the local library.
- Search suggestions (`/api/suggest`) with recent searches.
- Channel subscriptions, `/subscriptions` feed and `/api/subscriptions`.
- Trending page ranked by decayed HN stance weights, with tabs.
- Playlist mode, autoplay with a 5 second Up next countdown, Subscribe on watch.
- Mix, Queue, and watch keyboard shortcuts (player postMessage control); shortcuts list moved to Settings.
- Commenter profiles at `/u/[author]`; channel pages with Home, Videos and About tabs; related topics, similar channels, top channels.
- History with date groups, search, remove, clear with Undo, and pause.
- You hub and an installable manifest with icons.
- Infinite scrolling replaces pagination; Play all and Shuffle on saved lists.

UI polish
- Shared primitives: `ui.ts` class strings and type scale, `Avatar` size enum, `IdentityHeader`, `UnderlineTabs`, `Section`, `CardShelf`, `ChipBar`, `StatusPanel`, one `useSnackbar`, one `PlaylistSidebar`.
- Type scale fixed: card title 15px, list row 16px (14px on phones), related 14px, section 18px, page title 20px.
- Filter chips are single-select. Gradient fades under the sticky chip row removed.
- Compact grid for profile and channel video lists.

Fixes
- Drawer focus trap, header search keeps the query, mobile bar updated.
- Client-side links on cards, full-width search cards on phones, stable hidden-card height, shelf arrows, categories layout.
- First-row thumbnails prioritized; catalogue sync deferred to idle time.
- Catalogue sync, browse offsets and library API caps fixed.

Docs
- README, PRD, architecture, API, design and AGENTS.md rewritten to match the code. Storage keys corrected to `oht.library.v1`.
- Privacy copy matches the feed route. Preferences stay in browser storage, and the server ranks from a POST. Removed the claims that watch history never leaves the device and that the home feed is ranked on-device.

## Earlier

- Catalogue split into `index.json` and 16 shards; sync routes under `/api/sync`.
- Browser-only library, lexical search, derived `hq2.jpg` thumbnails and youtube-nocookie embeds. No YouTube counts or dates are shown.
