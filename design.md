---
name: OpenHackerTube
source: YouTube Modern, recolored
colors:
  primary: "#FF6600"
  primary-hover: "#E85D00"
  on-primary: "#FFFFFF"
  background: "#0F0F0F"
  background-light: "#FFFFFF"
  surface: "#272727"
  surface-light: "#F2F2F2"
  surface-hover: "#3F3F3F"
  surface-hover-light: "#E5E5E5"
  text: "#FFFFFF"
  text-light: "#0F0F0F"
  text-muted: "#AAAAAA"
  text-muted-light: "#606060"
  line: "#303030"
  line-light: "#E5E5E5"
  chip: "#272727"
  chip-light: "#F2F2F2"
  chip-on: "#F1F1F1"
  chip-on-light: "#0F0F0F"
  chip-on-text: "#0F0F0F"
  chip-on-text-light: "#FFFFFF"
  focus: "#FF6600"
typography:
  fontFamily: "Roboto, Arial, sans-serif"
  baseSize: "14px"
  titleSize: "16px"
  titleWeight: "500"
  titleLines: 2
  wordmarkSize: "18px"
  pageTitleSize: "20px"
rounded:
  card: "12px"
  button: "18px"
  search: "40px"
  iconButton: "9999px"
  logo: "8px"
layout:
  topbarHeight: "56px"
  sidebarWidth: "240px"
  sidebarRail: "72px"
  relatedRail: "402px"
  gridMin: "300px"
  icon: "24px"
  pagePaddingX: "16px"
  mobileMax: "800px"
---

# OpenHackerTube design system

YouTube's density and chrome, with Hacker News orange instead of YouTube red. Dark is the cinematic default. Light uses the same geometry and the light tokens above. Every screen reads `design.md` through the CSS variables in `src/app/globals.css`. Do not invent a second palette in a component.

## Logo

The wordmark is an orange rounded "Y" badge followed by **HackerTube** in bold, 19px. It nods to the Hacker News Y without copying the Y Combinator mark, and the product is not affiliated with Y Combinator, Hacker News, or YouTube. The accessible name is OpenHackerTube. Scrollbars are thin and use the hover surface color; horizontal rows (chips, shelves) hide theirs.

## Chrome

- Top bar is 56px, fixed, no bottom border. Leading edge: menu, wordmark. Center: one pill search field with a `/` hint, 40px tall, max 640px. Trailing edge: shortcuts and theme icon buttons.
- Sidebar is 240px with three groups split by thin lines: browse destinations, "You" (History, Watch later, Liked videos), and Settings. Items are 40px with a 10px radius.
- At 801 to 1311px the sidebar becomes a 72px mini rail (icon over a 10px label) and the menu opens the full sidebar as a drawer. At 1312px and up the full sidebar is docked and the menu toggles the rail.
- Under 801px the drawer is the only sidebar and a bottom bar holds Home, Longs, Topics, Search, and You as icon over label. No horizontal page overflow at any width.
- The chip row under the top bar is sticky. The related column on a watch page is 402px and drops below the player under 1280px.

## Video cards

- Thumbnail radius 12px, 16:9, middle-frame image (`hq2.jpg`) unless the viewer turns frames off. The thumbnail zooms slightly on hover and the whole card gets a 16px radius hover surface.
- Title is 15px, weight 500, two lines. Channel is a separate muted link. No avatars: the catalogue has no channel ids or avatar URLs, and fetching them needs a YouTube Data API key.
- A clock button on the thumbnail saves to Watch later. A three-dot menu holds Save to Watch later, Not interested, and Open on YouTube. Not interested swaps the card for a "Video hidden" panel with Undo.
- Shelves (topics, playlists, channel rows) scroll sideways with round arrow buttons that only appear when there is more to see.
- View counts, like counts, durations, and upload dates are never shown.

## Page headers

One `PageHeader` for every page that has a title. On desktop, actions sit on the title row. The description is one short line under the title (about 30 to 45 characters) and spans the row. On phones, actions go full width under the description. Counts belong in chips, not in the description.

## Controls

- Chips are 32px tall with an 8px radius; the selected chip inverts (`chip-on`). Pills and icon buttons are 36px and fully round. One trailing action width where a page header has an action, so sibling pages do not jump.
- Icon buttons are circular.
- Focus is a 2px `primary` outline, offset 2px. Every clickable card is a real link or button.
- Filters are links. The URL is the state.

## Copy

Short and concrete. "Talks HN keeps recommending", not a paragraph under the logo. No em dashes. No middle dots as separators. No colored left borders on cards or quotes.

## Motion

Hover darkens a surface by one step (`surface-hover`). Do not add blur bands behind the sticky chip row. A short background fade is enough. Respect `prefers-reduced-motion`.

## What not to copy from YouTube

No Shorts shelf, no subscriptions, no comment composer, no view-count race. The catalogue is Hacker News recommendations. The chrome is only the shell.
