import Link from "next/link";

export type Tab = { href: string; label: string; on?: boolean };

/** Underline tabs for identity pages (channel, profile). Links, so each tab is a URL. */
export function UnderlineTabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  return (
    <nav aria-label={label} className="no-scrollbar mt-4 flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          prefetch={false}
          aria-current={tab.on ? "page" : undefined}
          className={`press h-12 shrink-0 border-b-2 pt-3 text-base font-medium ${tab.on ? "border-foreground" : "border-transparent text-muted hover:border-muted hover:text-foreground"}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
