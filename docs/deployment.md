# Deployment

The production app is a Next.js server. It reads `data/catalog` from disk, renders pages, and sends the browser to YouTube for images and playback. There is no database and no user service.

## Build

On the deploy host, or in CI:

```bash
bun install
bun run typecheck
bun run lint
bun test
bun run build
bun run start
```

`bun run build` runs `next build`. `bun run start` serves that build. Configure the host to run the start command and to expose the port Next.js binds (3000 unless `PORT` is set).

Import before you build a box that should contain videos:

```bash
bun run import
```

The importer expects `/tmp/oht-extract/hackertube-complete.json` on that machine. It does not call the source site. Do not run a recrawl as part of deploy. The source robots file disallowed `/api/` and `/download/`, and the source sitemap returned 404.

## What to ship

Ship the Next.js build and the committed `data/catalog` files:

- `index.json` plus `shards/00.json` through `shards/15.json`
- `taxonomy.json`, `playlists.json`, `channels.json`, and `manifest.json`
- 6454 videos, 150 categories, 16 areas, 27 playlists, 39834 mentions, 3778 related records, split across those shards

Do not ship `data/private`. That directory is gitignored. It holds `youtube-meta.jsonl` (duration, view count, like count, publish time) and any local export zip. Those YouTube fields are not part of the committed catalogue and must not be baked into the deployment artefact or into a public cache.

Do not show durations, view counts, like counts, or upload dates, whether or not the private file is on disk.

Do not ship `embeddings.npy`. Those vectors were listed on the official zip manifest and were not in the delivered combined JSON.

## Runtime

Give the Node process enough memory to read the 16 shards on the server. Comment text is still about 35 MB in total, just split. Do not import those shard files into a client bundle. The browser fetches them through `/api/sync/shard/:id` and stores them in IndexedDB.

Search and filters are query parameters, so a CDN can cache public HTML for a given URL. Vary that cache on the feed query (`likes`, `dislikes`, `seen`, `seed`) if the home page is rendered on the server from those parameters. Library pages can be cached as shells because the ids are filled in from `localStorage`.

No environment variable is required for the public catalogue. Do not set a YouTube Data API key on the public server. Refreshing private metadata is a local task and the key stays in a developer shell.

## External hosts

Thumbnails load from `i.ytimg.com`. Embeds load from `www.youtube-nocookie.com`. A Content-Security-Policy, if you add one, needs image and frame access for those hosts. No video, audio, or image file from YouTube is stored in this repo.

## Checks after deploy

Open `/`, `/browse?dur=xlong`, a category, a playlist, and one `/watch/[vid]` URL. Confirm the player is a youtube-nocookie embed, the thumbnail is an `hq2.jpg` URL, and the page does not print a view count. Search for a title word and reload. The `q` parameter must still be in the address bar.
