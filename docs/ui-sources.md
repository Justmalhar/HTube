# UI sources

The interface has three written sources: `design.md` in the repo, the polish-ui skill at `.cursor/skills/polish-ui/SKILL.md`, and the public source site as information architecture only. Upstream field notes in `data/source/DATA.md` decide thumbnail and embed URLs. Where those sources disagree, `design.md` wins on color, type, and chrome, and the polish skill wins on page headers, copy length, and list rows.

## design.md

`design.md` is the token and chrome spec. It is labeled "YouTube Modern, recolored". Implement it through CSS variables in `src/app/globals.css`. Do not paste a second palette into a component.

Colors:

| Token | Dark default | Light |
| --- | --- | --- |
| primary | `#FF6600` | `#FF6600` |
| primary-hover | `#E85D00` | `#E85D00` |
| on-primary | `#FFFFFF` | `#FFFFFF` |
| background | `#0F0F0F` | `#FFFFFF` |
| surface | `#272727` | `#F2F2F2` |
| surface-hover | `#3F3F3F` | `#E5E5E5` |
| text | `#FFFFFF` | `#0F0F0F` |
| text-muted | `#AAAAAA` | `#606060` |
| line | `#303030` | `#E5E5E5` |
| chip | `#272727` | `#F2F2F2` |
| chip-on | `#F1F1F1` | `#0F0F0F` |
| chip-on-text | `#0F0F0F` | `#FFFFFF` |
| focus | `#FF6600` | `#FF6600` |

Type is Roboto, Arial, sans-serif. Base size 14px. Card titles 16px, weight 500, two lines. Wordmark 18px. Page titles 20px.

Radii: cards and thumbnails 12px, buttons and chips 18px, search field 40px, icon buttons fully round, logo square 8px.

Layout: top bar 56px, sidebar 240px, rail 72px, related column 402px, grid minimum 300px, icons 24px, page padding 16px, mobile breakpoint 800px.

Chrome from that file:

- Top bar leading edge is menu plus logo. Center is one search field, 40px tall, max 640px. Trailing edge is the theme toggle.
- Sidebar order is stable. Labels hide on the rail.
- Under 800px the sidebar is a dialog drawer. The bottom bar is Home, Longs, Categories, Library, and Search.
- Video cards are 16:9. The default image is the middle frame. Duration, if a local hydration file exists, sits on the thumbnail. View counts, like counts, and upload dates are never shown.
- The channel is a separate link. Recommendation facts are separate text nodes.
- Buttons and chips are 36px tall. Focus is a 2px primary outline, offset 2px.
- Hover moves one step to `surface-hover`. No blur band behind a sticky chip row. Respect `prefers-reduced-motion`.

The logo is an orange rounded square with a white H and a play cue; the accessible name is "HTube, home". It is not the Y Combinator logo.

Explicitly rejected from YouTube by `design.md`: a Shorts shelf, subscriptions, a comment composer, and a view-count race.

Short UI copy in that voice, with no trailing full stop: "Talks HN keeps recommending".

## polish-ui skill

The skill at `.cursor/skills/polish-ui/SKILL.md` supplies the consistency rules.

- One page header component. On desktop, actions sit on the title row, centered on the heading, not on the title plus description block. On phones, actions go full width under the description.
- Sibling pages share container width, title size, description style, and header action width. One trailing control width. A badge must fit inside that width so a filter does not resize the button.
- Descriptions are one short benefit line, about 30 to 45 characters, and they end before the search field. They say what the viewer gets. Counts are chips, not descriptions. Short UI lines have no trailing full stop. Longer body paragraphs keep their periods.
- One section heading style under the header. Drop headings that repeat the page title.
- Settings, playlists, and categories are list rows, like a settings list: name, one line, control. Video talks stay cards because `design.md` specifies that density. Each row or card has a one-line tagline. Longer copy waits for the watch page or the playlist page.
- The whole video card is the link to the watch page. Nested links, such as the channel, stay clickable above that target and show a visible focus ring.
- Grids follow container width and keep cards near the 300px minimum so a 1024px window with the sidebar open still fits titles.
- Color changes go through semantic tokens such as `--background` and the surface tokens. After a token edit, check the rail and the panel beside it.
- Writing and UI bans from the skill: no em dash (and no en dash or double hyphen used as a stand-in), no middle dot or bullet used to join metadata, no colored left border as an accent on cards, quotes, or callouts.

The watch page is the detail view for a video. Do not put another detail modal in front of the player. `design.md` already specifies the player and the 402px related column.

## Public source site

The capture in `data/source` records the public site on 7 November 2026. HTML routes were JS-rendered shells. The records that fill them are the dataset, not the HTML.

Routes observed, and used here as the information architecture:

- `/` home
- `/browse` and `/browse?dur=xlong` for longs
- `/categories`, `/c/<id>`, `/a/<id>`
- `/playlists`, `/p/<slug>`
- `/watch/<vid>`
- `/liked`, `/later`, `/history`, `/settings`
- `/about`

This app keeps search and filters in the query string (`q`, `dur`, `area`, `category`, `shelf`, `type`, `page`) so a reload restores the list. The sample search URL on the source was a path (`/search/test`). The query-string contract in `docs/api.md` is the one to implement.

The home feed follows the public client inputs `likes`, `dislikes`, `seen`, and `seed`, and the about-page section list: classics, recent favorites, hidden gems, unexplored topics, then similar videos and co-recommendations after likes. That is a reconstruction in this repo. The closed `/api/feed` body was not copied.

`data/source/robots.txt` disallows `/api/` and `/download/` for crawlers. This project does not recrawl those paths. `data/source/coverage.json` records the sitemap request as HTTP 404. Personal likes, history, and watch later on the source were browser state, which is why this app stores them in `localStorage` and not on a server.

## Data notes for media

`data/source/DATA.md` documents the two thumbnail URLs and the embed:

- Middle frame, the source default: `https://i.ytimg.com/vi/<vid>/hq2.jpg`
- Uploader image, used when the viewer turns frames off: `https://i.ytimg.com/vi/<vid>/hqdefault.jpg`
- Embed: `https://www.youtube-nocookie.com/embed/<vid>`

The same file says YouTube view counts, durations, like counts, and publish dates are not in the redistributable export. This repo follows that split. `scripts/import_licensed.py` parks duration, views, likes, and publish time in gitignored `data/private/youtube-meta.jsonl` and drops them from `data/catalog`. The UI hides view counts, like counts, upload dates, and durations. The private metadata file is not read by the app.

`DATA.md` also describes `embeddings.npy`. The export manifest in `data/source/export.json` lists that file. It was not in the delivered combined JSON, so there is no semantic-search UI.

## How to check a screen

Compare the screen to `design.md` first, then to a sibling page (same header geometry, same row pattern). Search the changed UI for an em dash, a middle dot used as a separator, and a colored left border. Those three are defects even if the layout matches.
