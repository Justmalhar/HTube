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

/** PageHeader action: full width on phones, one fixed width on desktop so sibling pages do not jump. */
export const headerActionClass = `${pillClass} w-full min-[801px]:w-36`;
/** Muted secondary line (descriptions, counts, notes). */
export const mutedTextClass = "text-sm text-muted";
/** Counts and ranges: digits that do not jitter. */
export const countClass = "tabular-nums";
