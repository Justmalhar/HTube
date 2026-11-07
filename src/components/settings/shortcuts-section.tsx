import { SHORTCUT_GROUPS } from "@/lib/shortcuts";

export function ShortcutsSection() {
  return (
    <section aria-labelledby="shortcuts-title" className="mt-10">
      <h2 id="shortcuts-title" className="text-lg font-medium">Keyboard shortcuts</h2>
      {SHORTCUT_GROUPS.map(({ group, rows }) => (
        <div key={group} role="group" aria-label={group} className="mt-4">
          <h3 className="text-xs font-medium text-muted">{group}</h3>
          <ul className="mt-1 divide-y divide-line">
            {rows.map(([key, label]) => (
              <li key={key} className="flex min-h-12 items-center justify-between gap-4 text-sm">
                {label}
                <kbd className="min-w-8 shrink-0 rounded-md bg-surface px-2 py-1 text-center text-xs">{key}</kbd>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
