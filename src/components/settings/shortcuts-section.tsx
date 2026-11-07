import { listRowClass, sectionTitleClass, subTitleClass } from "@/components/ui";
import { SHORTCUT_GROUPS } from "@/lib/shortcuts";

export function ShortcutsSection() {
  return (
    <section aria-labelledby="shortcuts-title" className="mt-8">
      <h2 id="shortcuts-title" className={sectionTitleClass}>Keyboard shortcuts</h2>
      {SHORTCUT_GROUPS.map(({ group, rows }) => (
        <div key={group} role="group" aria-label={group} className="mt-4">
          <h3 className={`${subTitleClass} text-muted`}>{group}</h3>
          <ul className="mt-1">
            {rows.map(([key, label]) => (
              <li key={key} className={`${listRowClass} justify-between text-sm`}>
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
