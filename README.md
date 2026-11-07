# HTube

Formerly OpenHackerTube.

A YouTube-style catalogue of the videos Hacker News keeps recommending: 6454 videos, 150 categories, 27 playlists. There are no accounts. Everything personal stays in this browser.

Playback uses the YouTube privacy-enhanced embed. The app does not host video files and does not show YouTube durations, view counts, like counts, or upload dates.

## Features

- Home feed ranked from your likes, dislikes and watch history. The order is reshuffled on every load, and about 30% of picks explore topics you have not touched.
- Search with typeahead suggestions (videos, channels, topics) and recent searches.
- Subscriptions to channels, with a feed of their videos.
- Trending, ranked by recent HN activity, with Now, Talks, Lectures, Documentaries and Programming tabs.
- Playlists with playlist mode (Up next stays inside the list), Play all and Shuffle. Autoplay shows an Up next countdown when a video ends.
- Mix, a chain of co-recommended videos starting from the one you are watching.
- Queue for the current tab session.
- Keyboard shortcuts for the watch page and the app, listed in Settings and opened with `?`.
- Commenter profiles at `/u/[author]` with Videos and Comments tabs.
- Channel pages with Home, Videos and About tabs, related topics and similar channels.
- History grouped by date, with search and a pause switch.
- A You hub for history, watch later, liked videos and subscriptions.
- An installable web app manifest.
- Dark and light themes, single-select filter chips, infinite scrolling.

## Setup

```bash
bun install
bun dev
```

The committed `data/catalog` is enough to run. `bun run import` rebuilds it from a local snapshot at `/tmp/oht-extract/hackertube-complete.json`.

```bash
bun test
bun run lint
bun run typecheck
bun run build
```

## Layout

```text
src/app          App Router pages, route handlers (src/app/api), manifest, sitemap
src/components   UI. Shared primitives: ui.ts, channel/avatar, identity-header, tabs, section, shelf, filters (ChipBar), status-panel, snackbar
src/lib          Pure logic: engine (ranker, search), trending, mix, suggest, channels, history, player-message, queue-store, client-catalog
data/catalog     Committed catalogue: index.json, 16 shards, taxonomy, playlists, channels, manifest
docs             prd, architecture, api, setup, testing, changelog
design.md        Visual spec
```

## Where data lives

No account and no server profile. The server only reads `data/catalog`.

| Store | Key | Holds |
| --- | --- | --- |
| localStorage | `oht.library.v1` | `likes`, `dislikes`, `later`, `seen` (last 500 ids, oldest first), `subs` (channel slugs), `frames`, `seenAt` (watch time per id), `paused` |
| localStorage | `oht.theme` | `light` or `dark` |
| localStorage | `oht.autoplay` | `off` disables autoplay; absent means on |
| localStorage | `oht.recentSearches` | Recent search strings |
| localStorage | `oht.rail` | `1` keeps the sidebar collapsed to the rail |
| sessionStorage | `oht.queue`, `oht.queue.meta` | Queue ids and their title and channel, cleared when the tab closes |
| IndexedDB | database `openhackertube` | Copy of the index, taxonomy, playlists and shards for on-device reads |

Clearing site data resets all of it.

## Docs

`docs/prd.md`, `docs/architecture.md`, `docs/api.md`, `docs/setup.md`, `docs/testing.md`, `docs/changelog.md`, `design.md`.
