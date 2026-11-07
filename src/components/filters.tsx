import { unsupportedFilters, withQuery } from "@/lib/query";

const TYPES = ["talk", "lecture", "explainer", "documentary", "interview", "tutorial", "demo", "commentary", "comedy", "music"];

export function FilterBar({ path, query }: { path: string; query: Record<string, string | undefined> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const notes = unsupportedFilters(params);
  const chip = (key: string, value: string, label: string) => {
    const on = params.get(key) === value;
    const href = withQuery(path, params, { [key]: on ? "" : value });
    return (
      <a key={`${key}-${value}`} href={href} className={`inline-flex h-8 items-center rounded-[8px] px-3 text-sm ${on ? "bg-[var(--chip-on)] text-[var(--chip-on-text)]" : "bg-surface"}`}>
        {label}
      </a>
    );
  };
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chip("sort", "hn", "Best")}
        {chip("sort", "recent", "Recent")}
        {chip("sort", "title", "Title")}
        {chip("evergreen", "1", "Evergreen")}
        {chip("gems", "insistent", "Gems")}
        {chip("news", "show", "Include news")}
        {TYPES.map((type) => chip("type", type, type))}
      </div>
      {notes.map((note) => (
        <p key={note} className="text-sm text-muted">{note}</p>
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
    <div className="mt-6 flex items-center gap-3 text-sm">
      {offset > 0 ? <a className="h-9 rounded-[18px] bg-surface px-4 leading-9" href={`${path}?${new URLSearchParams({ ...Object.fromEntries(params), offset: String(prev) })}`}>Previous</a> : null}
      <span className="text-muted">{Math.min(offset + 1, total)} to {Math.min(offset + limit, total)} of {total}</span>
      {next < total ? <a className="h-9 rounded-[18px] bg-surface px-4 leading-9" href={`${path}?${new URLSearchParams({ ...Object.fromEntries(params), offset: String(next) })}`}>Next</a> : null}
    </div>
  );
}
