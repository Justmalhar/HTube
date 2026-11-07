import { ChipBar } from "@/components/filters";

/** Topic/channel links as a chip row: scrolls on phones, wraps on desktop. Not sticky (inline in a page). */
export function ChipRow({ label, items }: { label: string; items: { id: string; name: string }[] }) {
  if (!items.length) return null;
  return <ChipBar label={label} sticky={false} wrap chips={items.map((item) => ({ href: `/c/${item.id}`, label: item.name }))} />;
}
