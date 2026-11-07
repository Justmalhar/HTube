# HTube

Formerly OpenHackerTube.

A catalogue of YouTube videos that Hacker News keeps recommending. There is no account. Likes, dislikes, watch later, history, theme, and the middle-frame toggle stay in this browser (`localStorage`). The shared catalogue is the official export, split into an index and 16 shards.

Playback uses the YouTube privacy-enhanced embed. The app does not host video files, and it does not publish YouTube durations, view counts, like counts, or upload dates.

## Setup

```bash
bun install
bun dev
```

The committed files in `data/catalog` are enough to run. `bun run import` rebuilds them from a local snapshot at `/tmp/oht-extract/hackertube-complete.json`.

```bash
bun test
bun run typecheck
bun run lint
bun run build
```

See `docs/setup.md` and `design.md`.
