# HTube

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJustmalhar%2FHTube&project-name=htube&repository-name=htube)

A self-hosted version of [HackerTube](https://hackertube.org): the YouTube videos Hacker News keeps telling each other to watch, in a YouTube-style app you can run on your own box.

6,454 videos, 150 categories, 27 playlists, drawn from 20 years of HN comments. No accounts, no tracking, no server-side profile. Everything personal stays in your browser.

## Why this exists

In November 2026 Andrej Karpathy shipped HackerTube as a weekend hack:

> I was annoyed with YouTube's recommendations so I had Claude filter down 43M comments over 20 years of HN to 6,454 videos that keep being recommended. *Significantly* better viewing experience, ~2 hours with Opus 5.5.
>
> Excellent recs without any logins (state is kept in local browser session) [...] Underlying data from the comment analysis as one zip file, point your Claude at it and ask for your own version.
>
> [@karpathy on X](https://x.com/karpathy/status/2116957135661945283)

HTube is that "own version". It takes the published HackerTube dataset and wraps it in an open-source Next.js app you can read, fork and host yourself. It adds a personal ranker, subscriptions, playlists, a mix and queue, trending and keyboard shortcuts. The choice of algorithm sits in code you control, and your watch history never leaves your device.

## Features

- **Home feed** ranked on-device from your likes, dislikes and watch history. It reshuffles on every load, and about 30% of picks explore topics you have not touched yet.
- **Search** with typeahead for videos, channels and topics, plus recent searches.
- **Subscriptions** to channels, with a feed of their videos.
- **Trending**, ranked by recent HN activity, with Now, Talks, Lectures, Documentaries and Programming tabs.
- **Playlists** with playlist mode, Play all and Shuffle. Autoplay counts down to the next video.
- **Mix**, a chain of co-recommended videos seeded from what you are watching, and a per-tab **Queue**.
- **HN comments** on every video, threaded the way YouTube shows them, with a link back to the original thread.
- **Commenter profiles** at `/u/[author]` and **channel pages** with related topics and similar channels.
- **History** grouped by date, with search and a pause switch, and a **You** hub that collects history, watch later, likes and subscriptions.
- **Keyboard shortcuts** (press `?`), dark and light themes, infinite scroll, and an installable web app.

Playback uses YouTube's privacy-enhanced embed (`youtube-nocookie.com`). The app hosts no video files and never shows YouTube durations, view counts, like counts or upload dates.

## Self-hosting

You need [Bun](https://bun.sh). The catalogue is committed in `data/catalog`, so there is nothing to download, no database and no API key.

```bash
git clone https://github.com/Justmalhar/HTube.git
cd HTube
bun install
bun dev            # http://localhost:3000
```

Production build:

```bash
bun run build
bun run start      # binds 3000, or $PORT
```

Hosting options:

- **Vercel**: click **Deploy with Vercel** at the top of this page. It clones the repo into your GitHub account and deploys it. The defaults work and no environment variables are needed.
- **Any VPS or Node host**: run the two commands above behind a reverse proxy. Give the process enough memory to read the 16 catalogue shards (about 35 MB of comment text).

If you add a Content-Security-Policy, allow images from `i.ytimg.com` and frames from `www.youtube-nocookie.com`. See [docs/deployment.md](docs/deployment.md) for caching notes and post-deploy checks.

### Rebuilding the catalogue

`bun run import` rebuilds `data/catalog` from a local HackerTube export at `/tmp/oht-extract/hackertube-complete.json`. The raw dataset, its schema and a guide for agents are in [data/source/DATA.md](data/source/DATA.md).

### Checks

```bash
bun test
bun run lint
bun run typecheck
```

## Where your data lives

The server only reads `data/catalog`. Personal state is client-side only:

| Store | Key | Holds |
| --- | --- | --- |
| localStorage | `oht.library.v1` | Likes, dislikes, watch later, the last 500 watched ids, subscriptions, watch times, history pause |
| localStorage | `oht.theme`, `oht.autoplay`, `oht.rail`, `oht.recentSearches` | Theme, autoplay, collapsed sidebar, recent searches |
| sessionStorage | `oht.queue`, `oht.queue.meta` | The current tab's queue |
| IndexedDB | `openhackertube` | Offline copy of the catalogue for on-device reads |

The home feed sends your likes and history in a POST body to `/api/feed` so the server can rank. Nothing is stored. Clearing site data resets everything.

## Project layout

```text
src/app          App Router pages, route handlers (src/app/api), manifest, sitemap
src/components   UI and shared primitives (ui.ts, Avatar, IdentityHeader, Tabs, Section, ChipBar, StatusPanel, Snackbar)
src/lib          Pure logic: ranker and search (engine), trending, mix, suggest, channels, history, player messages
data/catalog     Committed catalogue: index, 16 shards, taxonomy, playlists, channels
docs             PRD, architecture, API, setup, testing, deployment, changelog
design.md        Visual spec
```

Stack: Next.js 16 App Router, React 19, Tailwind CSS 4, lucide-react, Bun.

## Credits

- [HackerTube](https://hackertube.org) by Andrej Karpathy, for the idea and the dataset.
- [open-index/hacker-news](https://huggingface.co/datasets/open-index/hacker-news), the HN archive the dataset is derived from. Hacker News data is provided by Y Combinator, and comments remain the work of their authors.
- The data is released under the [Open Data Commons Attribution License (ODC-By) v1.0](https://opendatacommons.org/licenses/by/1-0/). Video titles and thumbnails belong to their creators on YouTube.

## About me

I'm Malhar Ujawane, a software engineer who builds AI-first products and interfaces.

- X: [@justmalhar](https://x.com/justmalhar)
- LinkedIn: [linkedin.com/in/justmalhar](https://www.linkedin.com/in/justmalhar)
- GitHub: [github.com/justmalhar](https://github.com/justmalhar)
- Website: [justmalhar.com](https://www.justmalhar.com)

If you host your own HTube or fork the ranker, tag me on X. I'd like to see it.
