import { unsupportedFilters, withQuery } from "@/lib/query";
import { chipClass, chipOnClass, pillClass } from "@/components/ui";

const TYPES = ["talk", "lecture", "explainer", "documentary", "interview", "tutorial", "demo", "commentary", "comedy", "music"];

type Chip = { href: string; label: string; on?: boolean };

export function ChipBar({ label, chips, sticky = false }: { label: string; chips: Chip[]; sticky?: boolean }) {
  return (
    <nav
      aria-label={label}
      className={`${sticky ? "sticky top-14 z-20 -mx-4 bg-background px-4 min-[801px]:-mr-6 min-[801px]:pr-6" : ""} no-scrollbar mb-6 flex gap-3 overflow-x-auto py-3`}
    >
      {chips.map((chip) => (
        <a key={chip.href} href={chip.href} aria-current={chip.on ? "page" : undefined} className={chip.on ? chipOnClass : chipClass}>
          {chip.label}
        </a>
      ))}
    </nav>
  );
}

export function FilterBar({ path, query }: { path: string; query: Record<string, string | undefined> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const notes = unsupportedFilters(params);
  const chip = (key: string, value: string, label: string): Chip => {
    const on = params.get(key) === value;
    return { href: withQuery(path, params, { [key]: on ? "" : value }), label, on };
  };
  const chips = [
    chip("sort", "hn", "Best"),
    chip("sort", "recent", "Recent"),
    chip("sort", "title", "Title"),
    chip("evergreen", "1", "Evergreen"),
    chip("gems", "insistent", "Hidden gems"),
    chip("news", "show", "Include news"),
    ...TYPES.map((type) => chip("type", type, type.charAt(0).toUpperCase() + type.slice(1))),
  ];
  return (
    <div>
      <ChipBar label="Filters" chips={chips} sticky />
      {notes.map((note) => (
        <p key={note} className="-mt-3 mb-4 text-sm text-muted">{note}</p>
      ))}
    </div>
  );
}

export function Pager({ path, query, offset, total }: { path: string; query: Record<string, string | undefined>; offset: number; total: number }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const limit = 24;
  const prev = Math.max(0, offset - limit);
  const next = offset + limit;
  return (
    <div className="mt-10 flex items-center justify-center gap-3 text-sm">
      {offset > 0 ? <a className={pillClass} href={`${path}?${new URLSearchParams({ ...Object.fromEntries(params), offset: String(prev) })}`}>Previous</a> : null}
      <span className="text-muted">{Math.min(offset + 1, total)} to {Math.min(offset + limit, total)} of {total}</span>
      {next < total ? <a className={pillClass} href={`${path}?${new URLSearchParams({ ...Object.fromEntries(params), offset: String(next) })}`}>Next</a> : null}
    </div>
  );
}
