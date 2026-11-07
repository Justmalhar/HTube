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

The mark is inspired by the Hacker News tile: a rounded orange square and a white Y. It is not the Y Combinator logo and the product is not affiliated with Y Combinator, Hacker News, or YouTube. The wordmark is **Hacker** in the text color and **Tube** in `primary`. The accessible name is OpenHackerTube.

## Chrome

- Top bar is 56px, fixed. Leading edge: menu, logo. Center: one search field, 40px tall, pill shaped, max 640px. Trailing edge: theme toggle.
- Sidebar is 240px and collapses to a 72px rail of 24px icons. Labels hide on the rail. The same destinations stay in the same order on every page.
- Mobile (under 800px): sidebar becomes a dialog drawer. A bottom bar holds Home, Longs, Categories, Library, and Search. No horizontal page overflow at 375px.
- Main content clears the top bar. The related column on a watch page is 402px and drops below the player on narrow screens.

## Video cards

- Thumbnail radius 12px, 16:9, middle-frame image (`hq2.jpg`) unless the viewer turns frames off.
- Title is 16px, weight 500, two lines, then clamp.
- Channel is a separate link. Recommendation facts are separate text nodes with a gap. Do not join them with a middle dot, bullet, or em dash.
- Duration, when a local hydration file exists, sits on the thumbnail. View counts, like counts, and upload dates are never shown.

## Page headers

One `PageHeader` for every page that has a title. On desktop, actions sit on the title row. The description is one short line under the title (about 30 to 45 characters) and spans the row. On phones, actions go full width under the description. Counts belong in chips, not in the description.

## Controls

- Buttons and chips are 36px tall with an 18px radius. One trailing action width where a page header has an action, so sibling pages do not jump.
- Icon buttons are circular.
- Focus is a 2px `primary` outline, offset 2px. Every clickable card is a real link or button.
- Filters are links. The URL is the state.

## Copy

Short and concrete. "Talks HN keeps recommending", not a paragraph under the logo. No em dashes. No middle dots as separators. No colored left borders on cards or quotes.

## Motion

Hover darkens a surface by one step (`surface-hover`). Do not add blur bands behind the sticky chip row. A short background fade is enough. Respect `prefers-reduced-motion`.

## What not to copy from YouTube

No Shorts shelf, no subscriptions, no comment composer, no view-count race. The catalogue is Hacker News recommendations. The chrome is only the shell.
