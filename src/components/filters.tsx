import { PAGE } from "@/lib/engine";
import Link from "next/link";

import { InfiniteFeed } from "@/components/infinite-feed";
import { withQuery } from "@/lib/query";
import { chipClass, chipOnClass, pillClass } from "@/components/ui";

const TYPES = ["talk", "lecture", "explainer", "documentary", "interview", "tutorial", "demo", "commentary", "comedy", "music"];

const SORTS = new Set(["hn", "recent", "title"]);

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

export function FilterBar({ path, query }: { path: string; query: Record<string, string | undefined> }) {
  const params = toParams(query);
  const chip = (key: string, value: string, label: string): Chip => {
    const on = params.get(key) === value;
    return { href: withQuery(path, params, { [key]: on ? "" : value }), label, on };
  };
  // Sort is single-select with "Best" as the default: always one chip on, never toggled off.
  const sort = params.get("sort") ?? "hn";
  const sortChip = (value: string, label: string): Chip => ({
    href: withQuery(path, params, { sort: value === "hn" ? "" : value }),
    label,
    on: (SORTS.has(sort) ? sort : "hn") === value,
  });
  const chips = [
    sortChip("hn", "Best"),
    sortChip("recent", "Recent"),
    sortChip("title", "Title"),
    chip("evergreen", "1", "Evergreen"),
    chip("gems", "insistent", "Hidden gems"),
    chip("news", "show", "Include news"),
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
