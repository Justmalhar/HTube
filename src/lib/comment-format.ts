// Pure helpers for the watch page comment list (kept JSX-free so bun test can import them).

/** Muted avatar tones; every one clears 4.5:1 against white text (checked in comment-format.test.ts). */
export const AVATAR_COLORS = ["#9A4A3A", "#3E7050", "#4A649A", "#74539A", "#85601E", "#2E7276", "#964570", "#5C6678"];

/** Deterministic colour for a username (FNV-1a hash), so the same author always gets the same avatar. */
export function avatarColor(name: string) {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) hash = Math.imul(hash ^ name.charCodeAt(i), 16777619);
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}

/** "YYYY-MM" to YouTube-style relative time. The data has no day, so the finest unit is a month. */
export function relativeMonth(month: string, now = new Date()) {
  const [year, mon] = month.split("-").map(Number);
  const months = now.getFullYear() * 12 + now.getMonth() - (year * 12 + mon - 1);
  if (months < 1) return "this month";
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

/** Placeholders the importer left where HN had links, embeds and footnote refs. */
export const PLACEHOLDER = /\[(VIDEO|video|LINK|\^?\d+(?:,\s?\d+)*)\]/g;

/** Splits comment text into plain strings and placeholder chips. */
export function tokenize(text: string): { text: string; chip: boolean }[] {
  const out: { text: string; chip: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    if (match.index > last) out.push({ text: text.slice(last, match.index), chip: false });
    const inner = match[1];
    out.push({ text: /^(video|link)$/i.test(inner) ? inner.toLowerCase() : inner, chip: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), chip: false });
  return out;
}

const STRENGTH: Record<string, number> = { strong_rec: 0, rec: 1, reference: 2, critical: 3, joke: 4 };

/** Top = strongest stance first, data order within a stance. Newest = latest month first. Both stable. */
export function sortMentions<T extends { stance: string; month: string }>(list: T[], order: "top" | "newest") {
  return order === "top"
    ? list.toSorted((a, b) => (STRENGTH[a.stance] ?? 9) - (STRENGTH[b.stance] ?? 9))
    : list.toSorted((a, b) => b.month.localeCompare(a.month));
}
