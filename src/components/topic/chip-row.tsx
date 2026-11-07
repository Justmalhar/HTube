import { chipClass } from "@/components/ui";

export function ChipRow({ label, items }: { label: string; items: { id: string; name: string }[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label={label} className="no-scrollbar mb-3 -mx-4 flex gap-2 overflow-x-auto px-4 min-[801px]:mx-0 min-[801px]:flex-wrap min-[801px]:px-0">
      {items.map((item) => (
        <a key={item.id} href={`/c/${item.id}`} className={chipClass}>{item.name}</a>
      ))}
    </nav>
  );
}
