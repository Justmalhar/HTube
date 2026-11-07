// Shared class strings. `press` and `hit` are utilities defined in globals.css.

export const chipClass =
  "press hit inline-flex h-8 shrink-0 items-center rounded-lg bg-surface px-3 text-sm font-medium hover:bg-surface-hover";
export const chipOnClass =
  "press hit inline-flex h-8 shrink-0 items-center rounded-lg bg-chip-on px-3 text-sm font-medium text-chip-on-text";
export const pillClass =
  "press hit inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-surface px-4 text-sm font-medium hover:bg-surface-hover";
/** Inverted pill for the one primary action in a dialog or panel. */
export const pillOnClass =
  "press hit inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-chip-on px-4 text-sm font-medium text-chip-on-text";
export const iconButtonClass =
  "press grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface";
export const panelClass = "rounded-2xl bg-surface";
export const gridClass = "grid grid-cols-1 gap-x-4 gap-y-10 min-[720px]:grid-cols-2 min-[1180px]:grid-cols-3";
/** Dense channel-style grid (YouTube channel Videos tab): auto-fill columns, 14px titles. */
export const compactGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 gap-y-8 [&_h2]:text-sm [&_h2]:leading-5";

/** PageHeader action: full width on phones, one fixed width on desktop so sibling pages do not jump. */
export const headerActionClass = `${pillClass} w-full min-[801px]:w-36`;
/** Space under every PageHeader, so the first content offset matches across list pages. */
export const headerGapClass = "mb-3";
/** Reading-width cap shared by Settings and About. */
export const readingClass = "max-w-3xl";
/** Muted secondary line (descriptions, counts, notes). */
export const mutedTextClass = "text-sm text-muted";
/** Counts and ranges: digits that do not jitter. */
export const countClass = "tabular-nums";

/** Primary high-contrast pill: the one main action in a panel. */
export const primaryPillClass = pillOnClass;
/** Quiet pill for secondary text actions ("View all", "Clear"): no resting background. */
export const ghostPillClass =
  "press hit inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium hover:bg-surface-hover";
/** Pill for use on a `bg-surface` panel, where the default pill would vanish. */
export const pillBgClass =
  "press hit inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-background px-4 text-sm font-medium hover:bg-surface-hover";
/** Static count chip (not a link). Counts go here, never in a page description. */
export const countChipClass = "inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-surface px-3 text-sm font-medium tabular-nums";

/** Heading scale: page title 20px bold (PageHeader), section 18px bold, sub-section 16px medium. */
export const sectionTitleClass = "text-lg font-bold leading-7";
export const subTitleClass = "text-base font-medium leading-6";
/** Vertical gap between sibling sections. */
export const sectionGapClass = "mt-8";

/** Video titles: card 15px, list row 14px phone / 16px desktop, related row 14px; all weight 500. */
export const cardTitleClass = "line-clamp-2 wrap-anywhere text-[15px] font-medium leading-[21px]";
export const rowTitleClass = "line-clamp-2 wrap-anywhere text-sm font-medium leading-5 min-[801px]:text-base min-[801px]:leading-6";
export const relatedTitleClass = "line-clamp-2 wrap-anywhere text-sm font-medium leading-5";

/** Menu-like list row (non-navigation): 44px min height, 12px radius. */
export const listRowClass = "press flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-surface-hover";
/** Row lists (search, playlists, trending, library). */
export const listWidthClass = "max-w-[1100px]";
export const rowListClass = `flex ${listWidthClass} flex-col gap-4`;
/** Shelf tile width, one value for every horizontal shelf. */
export const tileWidth = "w-[240px] shrink-0 snap-start min-[801px]:w-[280px]";
