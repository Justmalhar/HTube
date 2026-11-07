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

The importer expects `/tmp/oht-extract/hackertube-complete.json` on that machine. It does not call hackertube.org. Do not run a recrawl as part of deploy. The source robots file disallowed `/api/` and `/download/`, and the source sitemap returned 404.

## What to ship

Ship the Next.js build and the committed `data/catalog` files:

- 6454 videos in `videos.jsonl`
- 150 categories
- 16 areas
- 27 playlists
- 39834 mentions
- 3778 related records

Do not ship `data/private`. That directory is gitignored. It holds `youtube-meta.jsonl` (duration, view count, like count, publish time) and any local export zip. Those YouTube fields are not part of the ODC-By catalogue and must not be baked into the deployment artefact or into a public cache.

If the private file is absent, watch pages simply omit the duration badge. They still must not show view counts, like counts, or upload dates.

Do not ship `embeddings.npy`. Those vectors were listed on the official zip manifest and were not in the delivered combined JSON.

## Runtime

Give the Node process enough memory to read the catalogue on the server. Mention text is the bulky part (the upstream mentions file is about 35 MB). Keep that parse on the server. Do not upload the jsonl files into a client bundle or an edge function that would send them to the browser.

Search and filters are query parameters, so a CDN can cache public HTML for a given URL. Vary that cache on the feed query (`likes`, `dislikes`, `seen`, `seed`) if the home page is rendered on the server from those parameters. Library pages can be cached as shells because the ids are filled in from `localStorage`.

No environment variable is required for the public catalogue. Do not set a YouTube Data API key on the public server. Refreshing private metadata is a local task and the key stays in a developer shell.

## External hosts

Thumbnails load from `i.ytimg.com`. Embeds load from `www.youtube-nocookie.com`. A Content-Security-Policy, if you add one, needs image and frame access for those hosts. No video, audio, or image file from YouTube is stored in this repo.

## Attribution

`/about` and `/data` on the deployed site must credit HackerTube (https://hackertube.org) and open-index/hacker-news, name the ODC-By 1.0 license, and state that the product is not affiliated with YouTube, Google, Hacker News, or Y Combinator.

## Checks after deploy

Open `/`, `/browse?dur=xlong`, a category, a playlist, and one `/watch/[vid]` URL. Confirm the player is a youtube-nocookie embed, the thumbnail is an `hq2.jpg` URL, and the page does not print a view count. Confirm `/data` shows the catalogue counts above. Search for a title word and reload. The `q` parameter must still be in the address bar.
