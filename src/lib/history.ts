export const GROUPS = ["Today", "Yesterday", "This week", "This month", "Earlier"] as const;
export type Group = (typeof GROUPS)[number];

const startOfDay = (time: number) => {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

/** Bucket a watch time by local calendar day. No time (legacy entries) is "Earlier". */
export function groupFor(at: number | undefined, now: number): Group {
  if (!at) return "Earlier";
  const days = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  const a = new Date(at);
  const n = new Date(now);
  return a.getFullYear() === n.getFullYear() && a.getMonth() === n.getMonth() ? "This month" : "Earlier";
}

/** Group ids (already newest first) under date headings, dropping empty groups. */
export function groupHistory(ids: string[], seenAt: Record<string, number>, now: number) {
  const out = new Map<Group, string[]>();
  for (const id of ids) {
    const group = groupFor(seenAt[id], now);
    out.set(group, [...(out.get(group) ?? []), id]);
  }
  return GROUPS.flatMap((group) => (out.has(group) ? [{ group, ids: out.get(group)! }] : []));
}
