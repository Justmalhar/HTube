# Product requirements

OpenHackerTube is a browser for the HackerTube catalogue: talks and videos that Hacker News actually recommended. The shell follows YouTube's information architecture. The color is Hacker News orange `#FF6600`. People can search, watch through a YouTube embed, and keep a library on this browser only.

## Who it is for

A viewer who wants the HackerTube catalogue without an account. They land on a feed, open a talk, and optionally like it, hide it, or save it for later. The same browser should remember that choice after a reload. A second browser starts fresh.

## Catalogue

The dataset is the HackerTube official export of 2026-10-31, licensed ODC-By 1.0.

- 6454 videos
- 150 categories in 16 areas
- 27 playlists
- 39834 HN mentions
- 3778 related records

Credit HackerTube (https://hackertube.org) and open-index/hacker-news on the about and data pages. Comments remain the work of their authors. Titles and channel names belong to the creators. The product is not affiliated with YouTube, Google, Hacker News, or Y Combinator.

The committed dataset does not include YouTube view counts, durations, likes, or publish dates. Those values live only in gitignored `data/private`, and the interface does not read that file. The interface never shows view counts, like counts, upload dates, or durations.

Thumbnails and embeds are derived YouTube URLs. The default thumbnail is the middle frame `hq2.jpg`. The embed host is `www.youtube-nocookie.com`. The app does not host video files.

Semantic embeddings were named in the official zip manifest and were missing from the delivered combined JSON. They are out of scope.

## Home feed

The feed is a reconstruction. It follows the public client contract (`likes`, `dislikes`, `seen`, `seed`) and the about-page description. It is not a client of the closed `/api/feed`.

Before the viewer likes anything, the feed shows four sections, in this order: classics, recent favorites, hidden gems, unexplored topics. After a like, it adds similar videos and co-recommendations. Similar items share categories, tags, or topic text. Co-recommendations are the related records built from shared HN recommenders. Dislikes and watched ids leave the shelves. The seed keeps an empty-library order stable.

News-shelf videos, the ones tied to a single event, stay out of the default feed. A shelf filter can ask for them.

## Search and browse

The top bar searches titles, summaries, tags, and taxonomy descriptions. Filters for length, area, category, shelf life, and content type live in the URL query string, so a copied link reopens the same list. Longs is `/browse?dur=xlong`.

Category, area, and playlist indexes use list rows. Video results use cards. The server sends one page of cards, never the whole jsonl.

## Watch

A watch page plays the youtube-nocookie embed, shows the HackerTube summary and why HN pointed at it, lists the kept mentions, and shows related videos in a 402px column that drops under the player on a narrow screen. The channel is its own link. Opening the page records history in `localStorage`.

## Library and settings

The local record stores likes, dislikes, watch later, history, theme, and the frame toggle. There is no signup, no sync, and no server profile. Dark is the default theme. Frames default to the middle-frame thumbnail. Settings uses list rows for those two controls.

## Interface

Follow `design.md` and the polish rules in `docs/ui-sources.md`.

- One page header. Actions sit on the title row on desktop and do not change width between pages.
- Descriptions are one short benefit line, about 30 to 45 characters. Example voice: "Talks HN keeps recommending".
- Roboto at 14px. Card titles at 16px, two lines. Top bar 56px. Sidebar 240px, collapsing to a 72px rail. Buttons and chips 36px tall with an 18px radius. Thumbnails with a 12px radius.
- Dark surfaces `#0F0F0F` and `#272727`, plus the light theme.
- Semantic color tokens only.
- No em dashes, no middle-dot separators, no colored left borders.
- Below 800px: drawer sidebar and a bottom bar with Home, Longs, Categories, Library, and Search. No horizontal overflow at 375px.
- The same sidebar destinations, in the same order, on every page.

Copy that does not belong: a Shorts shelf, subscriptions, a comment composer, or a view-count race. The chrome is the shell. The catalogue is Hacker News recommendations.

## Out of scope

- Accounts, comments, uploads, and subscriptions
- Hosting video, audio, or thumbnail files
- Showing or redistributing YouTube view counts, like counts, or publish dates
- Semantic search
- Recrawling hackertube.org, including paths disallowed by the source robots file
- Treating the source sitemap as available (the request returned 404)

## Acceptance

A viewer can open the home feed, search, filter by a query parameter, open a video, like it, and reload. The like is still there, and the feed now includes similar videos and co-recommendations. A private window has an empty library. Public pages credit HackerTube and open-index/hacker-news and do not print YouTube view counts.
