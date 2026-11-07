import { PAGE } from "@/lib/engine";
import Link from "next/link";

import { InfiniteFeed } from "@/components/infinite-feed";
import { withQuery } from "@/lib/query";
import { chipClass, chipOnClass, pillClass } from "@/components/ui";

const TYPES = ["talk", "lecture", "explainer", "documentary", "interview", "tutorial", "demo", "commentary", "comedy", "music"];


type Chip = { href: string; label: string; on?: boolean };

const stickyClass =
  "sticky top-14 z-(--z-sticky) -mx-4 bg-background px-4 min-[801px]:-mr-6 min-[801px]:pr-6";

export function ChipBar({ label, chips, sticky = false }: { label: string; chips: Chip[]; sticky?: boolean }) {
  return (
    <nav aria-label={label} className={sticky ? `${stickyClass} mb-6` : "mb-6"}>
      <div className="no-scrollbar flex gap-3 overflow-x-auto py-3">
        {chips.map((chip) => (
          <Link key={chip.href} href={chip.href} scroll={false} aria-current={chip.on ? "page" : undefined} className={chip.on ? chipOnClass : chipClass}>
            {chip.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function toParams(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  return params;
}

// Every chip in the row is one choice, like YouTube: picking a chip replaces the previous one.
const FILTER_KEYS = ["sort", "evergreen", "gems", "news", "shelf", "type"] as const;

export function FilterBar({ path, query }: { path: string; query: Record<string, string | undefined> }) {
  const params = toParams(query);
  const clear = Object.fromEntries(FILTER_KEYS.map((key) => [key, ""])) as Record<string, string>;
  const active = FILTER_KEYS.filter((key) => params.get(key)).map((key) => `${key}=${params.get(key)}`);
  const chip = (key: string, value: string, label: string): Chip => ({
    href: withQuery(path, params, { ...clear, [key]: value }),
    label,
    on: active.length === 1 && active[0] === `${key}=${value}`,
  });
  const chips: Chip[] = [
    { href: withQuery(path, params, clear), label: "All", on: active.length === 0 },
    chip("sort", "recent", "Recent"),
    chip("evergreen", "1", "Evergreen"),
    chip("gems", "insistent", "Hidden gems"),
    chip("shelf", "news", "News"),
    ...TYPES.map((type) => chip("type", type, type.charAt(0).toUpperCase() + type.slice(1))),
  ];
  return <ChipBar label="Filters" chips={chips} sticky />;
}

/** Infinite scroll from `offset + PAGE`; the server already rendered the batch at `offset`. */
export function Pager({ path, query, offset, total }: { path: string; query: Record<string, string | undefined>; offset: number; total: number }) {
  const next = offset + PAGE;
  if (next >= total) return null;
  const params = toParams(query);
  params.delete("offset");
  params.delete("tab");
  params.set("path", path);
  const src = `/api/feed?${params}`;
  const more = new URLSearchParams(toParams(query));
  more.set("offset", String(next));
  return (
    <>
      <InfiniteFeed key={src} src={src} start={next} total={total} kind={path === "/search" ? "list" : "grid"} />
      <noscript>
        <div className="mt-10 flex justify-center">
          <a className={pillClass} rel="next" href={`${path}?${more}`}>More videos</a>
        </div>
      </noscript>
    </>
  );
}
