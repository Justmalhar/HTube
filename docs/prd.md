# Product requirements

HTube (formerly OpenHackerTube) is a browser for talks and videos that Hacker News recommended. The shell follows YouTube's information architecture, recolored with Hacker News orange `#FF6600`. People search, watch through a YouTube embed, and keep a library on this browser only. There are no accounts.

## Who it is for

A viewer who wants the catalogue without signing up. They land on a feed, open a talk, and optionally like it, hide it, subscribe to its channel, or save it. The same browser remembers those choices after a reload and uses them to shape the feed. A second browser starts fresh.

## Catalogue

6454 videos, 150 categories in 16 areas, 27 playlists, 39834 HN mentions, 3778 related records. The product is not affiliated with YouTube, Google, Hacker News, or Y Combinator.

The committed dataset has no YouTube view counts, durations, likes, or publish dates. The interface never shows them. Thumbnails and embeds are derived URLs (`hq2.jpg` middle frame by default, `youtube-nocookie.com` embed). No video files are hosted. Semantic embeddings are out of scope.

## Requirements

### Home feed

- A ranked, infinitely scrolling grid. With an empty library it follows quality and freshness. With a library it adds affinity to liked, watched and disliked videos, and co-recommendation neighbours.
- The order is reshuffled on every page load (fresh seed). Scrolling within one load never repeats a video.
- About 30% of picks come from topics the viewer has not engaged with. No channel more than twice and no category more than four times in any 12 consecutive items.
- Disliked and news-shelf videos never appear. Seen videos sink.
- Above the grid: a "Because you liked" shelf and a Watch later shelf when the library has them.
- Acceptance: two reloads give different first rows; after liking a video, its channel and categories show up more often in the next load.

### Search

- Header search with typeahead: up to 10 suggestions mixing at most 2 channels, 2 topics and video titles. Prefix matches rank first, then word start, then substring.
- Focus with no text shows recent searches (stored locally).
- Results are lexical over titles, channels, topics, tags, summaries and category descriptions. The query is in the URL.
- Acceptance: typing "rust" suggests rust titles, channels and topics; Enter opens `/search?q=rust`.

### Browse and filters

- One chip row, single-select like YouTube: All, Recent, Evergreen, Hidden gems, News, and one chip per content type. Picking a chip replaces the previous one. State is in the URL.
- Category, area and playlist pages, plus Longs at `/browse?dur=xlong`.

### Subscriptions

- Subscribe and unsubscribe on watch and channel pages. Subscriptions are channel slugs in the local library.
- `/subscriptions` lists the subscribed channels and their videos, newest on HN first.

### Trending

- `/trending` ranks videos by recent HN recommendations with tabs Now, Talks, Lectures, Documentaries and Programming. Top 50 per tab.

### Watch

- Embed, summary, why HN pointed at it, comments sorted by top, related column (402px, below the player on narrow screens), inline description toggle.
- Playlist mode (`?list=slug`): the page shows the playlist panel, Up next stays in the list, Shift+P goes back.
- Mix (`?mix=1`): a chain of co-recommended videos from the current one, with a Mix panel.
- Queue: the queue always plays before other next candidates. Lives in sessionStorage.
- Autoplay: on by default, toggle in the watch page and persisted. When playback ends, an Up next card counts down 5 seconds and Escape cancels.
- Keyboard shortcuts: k or Space, j and l (10s), Left and Right (5s), 0 to 9 (jump to 0 to 90%), m, f, Shift+N, Shift+P. App shortcuts: `/` search, `h` home, `?` help, Esc close. The list is in Settings.
- Acceptance: finish a video with autoplay on and the next one opens after 5 seconds; with autoplay off nothing happens.

### Channels and commenter profiles

- Channel `/channel/[slug]` with Home, Videos and About tabs, subscribe, related topics, similar channels and top commenters.
- Commenter profile `/u/[author]` with Videos and Comments tabs, identity header, link to the HN profile. Unknown or invalid names return 404.

### Library, history and You

- Likes, dislikes, watch later, history, subscriptions, theme, autoplay and the frame toggle are local.
- History is grouped by Today, Yesterday, This week, This month and Earlier, has search, remove, clear all with Undo, and a pause switch that stops recording.
- Watch later and Liked have Play all and Shuffle in a playlist sidebar.
- `/you` is a hub with shelves for history, watch later, liked and subscriptions, and links to each full page.
- Acceptance: pause history, watch a video, History shows no new entry.

### App shell and install

- Top bar 56px, sidebar 240px collapsing to a 72px rail, drawer and bottom bar under 801px. No horizontal overflow at 375px.
- Sidebar order: Home, Longs, Subscriptions, Trending, Categories, Playlists, Browse; You group (History, Watch later, Liked videos); Settings. Bottom bar: Home, Longs, Topics, Search, You.
- Installable: a web manifest with 192, 512 and maskable icons, standalone display.

### Interface

Follow `design.md`. Shared primitives are reused, not rewritten per page. No em dashes, middle-dot separators or colored left borders anywhere in copy or UI.

## Out of scope

- Accounts, server profiles and sync across devices
- Uploads and a comment composer
- Hosting video, audio or thumbnail files
- Showing YouTube view counts, like counts, durations or publish dates
- Semantic search
- Recrawling the source site

## Acceptance

A viewer opens the feed, searches, opens a video, likes it, subscribes to the channel, and reloads. The like and subscription persist, the feed reorders on every load, History shows dated entries, and a private window starts empty. No public page prints YouTube view counts.
