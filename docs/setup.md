# Setup

HTube uses bun, Next.js App Router, and Tailwind. The repo pins bun in the `packageManager` field (`bun@1.4.4`). Current app packages are Next.js 16.4.5, React 19.3, and Tailwind 4.

## Requirements

Install bun 1.4.4 or newer, then clone the repo. No database, no account provider, and no API key are required to browse the committed catalogue. Playback loads a YouTube embed in the browser. This app does not host video files.

## Install and run

From the repo root:

```bash
bun install
bun dev
```

`bun dev` starts the Next.js dev server. Open http://localhost:3000.

The first paint can use an empty `data/catalog`. Import the catalogue before expecting videos, categories, or playlists.

## Import the catalogue

The importer reads a local combined snapshot. It does not download the snapshot and it does not recrawl the source site.

Place the delivered combined JSON at:

```text
/tmp/oht-extract/hackertube-complete.json
```

Then run:

```bash
bun run import
```

That command runs `scripts/import_licensed.py`. It writes the committed files under `data/catalog/` and writes YouTube duration, views, likes, and publish time only to `data/private/youtube-meta.jsonl`. It checks these counts before it exits: 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 mentions, 3778 related records.

The official zip listed semantic embedding files. They were not in the delivered combined JSON, so the import does not create them.

Keep `data/private` gitignored. Do not commit `youtube-meta.jsonl` or any export zip stored beside it. The committed catalogue is enough to run the app. The running app does not show durations, view counts, like counts, or upload dates.

## Everyday commands

```bash
bun dev
bun run lint
bun run typecheck
bun test
bun run import
bun run build
```

`bun run lint` runs ESLint. `bun run typecheck` typechecks the TypeScript project. `bun test` runs the bun test files. `bun run build` produces the production Next.js build. After a build, `bun run start` serves it.

## Browser data

Likes, dislikes, watch later, history, theme, and the frame toggle are stored in `localStorage` under `oht.library.v1`. Clearing site data resets that library. There is no login to restore it.

Theme defaults to dark. Frames default to on, which requests the YouTube middle frame `hq2.jpg`.

## Source notes

Field notes for the upstream files live in `data/source/DATA.md`.
