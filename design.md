---
name: HTube
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
  focus-light: "#E85D00"
typography:
  fontFamily: "Roboto, Arial, sans-serif"
  baseSize: "14px"
  cardTitleSize: "15px"
  rowTitleSize: "16px"
  relatedTitleSize: "14px"
  sectionTitleSize: "18px"
  pageTitleSize: "20px"
  titleWeight: "500"
  titleLines: 2
  wordmarkSize: "19px"
avatars:
  xs: "24px"
  sm: "32px"
  md: "40px"
  row: "56px"
  lg: "80px"
  xl: "80px, 128px from 801px"
  comment: "32px, 40px from 640px"
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

# HTube design system

YouTube's density and chrome, with Hacker News orange instead of YouTube red. Dark is the cinematic default. Light uses the same geometry and the light tokens above. Every screen reads `design.md` through the CSS variables in `src/app/globals.css`. Do not invent a second palette in a component.

## Logo

The mark is an orange (#FF6600, `primary`) rounded square with a 7/32 corner radius, holding a bold white "H" (two 4 unit pillars joined by an 8 unit crossbar) with a small orange play triangle cut into the crossbar as the video cue. It is drawn on a 32 unit grid with whole-unit edges so it stays crisp at 16px; `src/components/logo.tsx` and `src/app/icon.svg` share that geometry and change together. The wordmark is the 24px mark, a 6px gap, then "H" bold and "Tube" medium at 19px with -0.015em tracking. In the top bar under 400px only the mark shows. The accessible name is "HTube, home". favicon.ico (16/32/48) and the 180px apple-icon come from the same SVG; the apple-icon has square corners because iOS masks them. The product is not affiliated with Y Combinator, Hacker News, or YouTube. Scrollbars are thin and use the hover surface color; horizontal rows (chips, shelves) hide theirs.

## Chrome

- Top bar is 56px, fixed, no bottom border. Leading edge: menu, wordmark. Center: one pill search field with a `/` hint, 40px tall, max 640px. Trailing edge: the theme icon button. Keyboard shortcuts live in Settings and open with `?`.
- Sidebar is 240px with three groups split by thin lines: browse destinations, "You" (History, Watch later, Liked videos), and Settings. Items are 40px with a 10px radius. The "You" heading is plain text, not a link. Exactly one item is current, matched on path and query (`/browse?dur=xlong` is Longs, not Browse); the rail and bottom bar "You" item is current on any library page.
- At 801 to 1311px the sidebar becomes a 72px mini rail (icon over a 10px label) and the menu opens the full sidebar as a drawer. At 1312px and up the full sidebar is docked and the menu toggles the rail. Watch pages (`/watch/...`) follow YouTube instead: no docked sidebar and no rail at any width, the menu always opens the drawer over a scrim, and content has a 24px left padding from 801px up.
- The drawer is modal: it slides in from the left over a 50% black scrim and leaves along the same path, focus moves into it and returns to the menu button, the page behind is inert and does not scroll, and Escape, the scrim, any navigation, or crossing 1312px closes it. The rail state is set on `<html>` before first paint (`data-rail`), so it never jumps.
- Under 801px the drawer is the only sidebar and a bottom bar holds Home, Longs, Topics, Search, and You as icon over label. The bottom bar pads for the home indicator (`safe-area-inset-bottom`). No horizontal page overflow at any width.
- Stacking uses the named scale in `globals.css` (`--z-raised`, `--z-sticky`, `--z-rail`, `--z-header`, `--z-scrim`, `--z-drawer`, `--z-skip`), never raw numbers. Dialogs are native `<dialog>` in the top layer.
- The chip row under the top bar is sticky. The related column on a watch page is 402px and drops below the player under 1280px.

## Video cards

- Thumbnail radius 12px, 16:9, middle-frame image (`hq2.jpg`) unless the viewer turns frames off. The thumbnail zooms slightly on hover and the whole card gets a 16px radius hover surface.
- Title is 15px, weight 500, two lines. Channel is a separate muted link. Cards carry no avatar (no avatar URLs in the catalogue); letter avatars appear only on channel, profile, You and comment surfaces.
- A clock button on the thumbnail saves to Watch later. A three-dot menu holds Save to Watch later, Not interested, and Open on YouTube. Not interested swaps the card for a "Video hidden" panel with Undo.
- Shelves (topics, playlists, channel rows) scroll sideways with round arrow buttons that only appear when there is more to see.
- View counts, like counts, durations, and upload dates are never shown.

## Page headers

One `PageHeader` for every page that has a title. The title is 20px bold with slightly tight tracking and balanced wrapping. On desktop, actions sit on the title row, vertically centred on it, at one fixed width (`headerActionClass`). The description is one short line under the title (about 30 to 45 characters) and spans the row. On phones, actions go full width under the description. Counts belong in chips, not in the description.

## Controls

- Chips are 32px tall with an 8px radius; the selected chip inverts (`chip-on`). Pills are 36px and icon buttons 40px, both fully round. One trailing action width where a page header has an action, so sibling pages do not jump.
- Icon buttons are circular.
- Focus is a 2px `focus` outline, offset 2px (`#E85D00` in light so it clears 3:1 on white; 3px under `prefers-contrast: more`). Every clickable card is a real link or button.
- Touch targets are at least 40px. Chips and pills keep their visual size and grow their hit area with the `hit` utility.
- Counts and ranges use tabular numerals.
- Filters are links. The URL is the state.

## Type scale

One scale, defined as class strings in `src/components/ui.ts`. Do not set sizes ad hoc.

- Page title 20px bold (`PageHeader`). Identity title (channel, profile, You) 24px on phones, 36px from 801px.
- Section title 18px bold (`sectionTitleClass`). Sub-section 16px medium.
- Video titles, weight 500, two lines: card 15px, list row 14px on phones and 16px from 801px, related row 14px.
- Body and muted lines 14px. Counts use tabular numerals.
- Buttons: chip 32px tall, 8px radius, single-select; pill 36px; icon button 40px circle. Ghost pill for quiet actions ("View all"), inverted pill for the one primary action in a panel.

## Shared components

Reuse these; do not rebuild them per page.

- `Avatar` (`channel/avatar.tsx`): letter avatar with a deterministic color. Sizes are the enum `xs`, `sm`, `md`, `row`, `lg`, `xl`, `comment`; no other sizes.
- `IdentityHeader`: avatar, title, stats, one-line description and an actions slot. Shared by channel, profile and You. Actions sit under the text on desktop and span the width on phones.
- `UnderlineTabs`: link tabs for identity pages (channel Home, Videos, About; profile Videos, Comments).
- `ChipBar`: the one chip row for filters and page tabs (Trending). Sticky by default, solid background. `FilterBar` is single-select: every chip is one choice, "All" clears, picking a chip replaces the previous one (like YouTube). The URL is the state.
- `Section` with optional "View all", and `Shelf` / `CardShelf` for horizontal shelves with one tile width (240px, 280px from 801px).
- `StatusPanel`: the one empty and error state (title, optional body, optional action).
- `useSnackbar`: the one toast, bottom-left above the mobile bar, 5 seconds, optional Undo action.
- `PlaylistSidebar`: cover, title, count, Play all and Shuffle, shared by playlist, Watch later and Liked pages.
- `compactGridClass`: dense auto-fill grid with 14px titles for channel and profile video lists.

## Copy

Short and concrete. "Talks HN keeps recommending", not a paragraph under the logo. No em dashes. No middle dots as separators. No colored left borders on cards or quotes.

## Motion

Hover darkens a surface by one step (`surface-hover`), instantly. Pressed controls scale to 0.97 over 100ms (`press` utility). Animate only transform and opacity, with `ease-out-quart` for small things and `ease-out-expo` for the drawer. No blur bands or gradient fades anywhere under the sticky chip row or the top bar; they sit on a solid background. Nav links show a thin orange bar while a navigation is pending. Under `prefers-reduced-motion` every transition and animation is effectively instant and press scaling is off. Under `prefers-contrast: more` muted text and lines get stronger.

## What not to copy from YouTube

No Shorts shelf, no comment composer, no view-count race. Subscriptions are local channel follows only. The catalogue is Hacker News recommendations. The chrome is only the shell.

## Verification

Check UI changes headlessly, not by eye alone: drive the running app with a headless browser at 375px and a desktop width, assert no horizontal overflow, read computed font sizes against the type scale, confirm exactly one chip is selected after a click, and check the console is clean. Then run `bun test`, `bun run lint` and `bun run typecheck`.
