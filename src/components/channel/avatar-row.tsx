import { Avatar } from "@/components/channel/avatar";

type Item = { href: string; name: string; label?: string };

/** Horizontal row of round avatars with a name under each (YouTube "channels" strip). */
export function AvatarRow({ label, items, size = "size-16 text-2xl" }: { label: string; items: Item[]; size?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label={label} className="mb-3">
      <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 py-1 min-[801px]:mx-0 min-[801px]:px-0">
        {items.map((item) => (
          <li key={item.href} className="w-20 shrink-0">
            <a href={item.href} className="press group flex flex-col items-center gap-1.5 text-center">
              <Avatar name={item.name} className={size} />
              <span className="line-clamp-2 w-full text-xs leading-4 font-medium wrap-anywhere group-hover:underline">{item.name}</span>
              {item.label ? <span className="-mt-1 text-xs text-muted tabular-nums">{item.label}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
