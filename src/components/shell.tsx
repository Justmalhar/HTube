"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { CatalogSync } from "@/components/catalog-sync";
import { ThemeButton, ThemeState, useLibrary } from "@/components/library";

const LINKS = [
  ["/", "Home"],
  ["/browse?dur=xlong", "Longs"],
  ["/categories", "Categories"],
  ["/playlists", "Playlists"],
  ["/browse", "Browse"],
  ["/liked", "Liked"],
  ["/later", "Watch later"],
  ["/history", "History"],
  ["/settings", "Settings"],
  ["/about", "About"],
  ["/data", "Data"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const library = useLibrary();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "Escape") {
        setOpen(false);
        setHelp(false);
        return;
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "/") {
        event.preventDefault();
        document.getElementById("site-search")?.focus();
      } else if (event.key === "?" ) {
        setHelp(true);
      } else if (event.key === "h") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <ThemeState>
      <div className="min-h-full bg-background text-foreground">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-surface focus:px-3 focus:py-2">
          Skip to content
        </a>
        <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-background px-3">
          <button type="button" className="grid size-10 place-items-center rounded-full min-[801px]:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
          <Link href="/" className="flex items-center gap-2" aria-label="OpenHackerTube, home">
            <Logo />
            <span className="text-lg font-medium tracking-tight">
              Hacker<span className="text-primary">Tube</span>
            </span>
          </Link>
          <form action="/search" className="mx-auto hidden min-w-0 max-w-[640px] flex-1 sm:flex">
            <label className="sr-only" htmlFor="site-search">Search</label>
            <input
              id="site-search"
              name="q"
              placeholder="Search talks"
              className="h-10 w-full rounded-l-[20px] border border-line bg-background px-4 outline-none"
            />
            <button className="h-10 rounded-r-[20px] border border-l-0 border-line bg-surface px-4" type="submit">
              Search
            </button>
          </form>
          <ThemeButton />
        </header>
        <aside className={`${open ? "block" : "hidden"} fixed bottom-0 left-0 top-14 z-40 w-60 overflow-y-auto border-r border-line bg-background p-3 min-[801px]:block`}>
          <nav className="flex flex-col gap-1" aria-label="Sections">
            {LINKS.map(([href, label]) => {
              const active = pathname === href || (href === "/browse" && pathname === "/browse");
              return (
                <a key={href} href={href} className={`flex h-10 items-center rounded-[10px] px-3 ${active ? "bg-surface font-medium" : "hover:bg-surface"}`} onClick={() => setOpen(false)}>
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="mt-6">
            <CatalogSync />
          </div>
        </aside>
        {open ? <button type="button" className="fixed inset-0 z-30 bg-black/50 min-[801px]:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
        <div id="content" className="px-4 pb-20 pt-16 min-[801px]:pl-[256px] min-[801px]:pr-6">
          {children}
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-line bg-background min-[801px]:hidden" aria-label="Mobile">
          {[
            ["/", "Home"],
            ["/browse?dur=xlong", "Longs"],
            ["/categories", "Topics"],
            ["/liked", "Library"],
            ["/search", "Search"],
          ].map(([href, label]) => (
            <a key={label} href={href} className="grid place-items-center text-xs">
              {label}
            </a>
          ))}
        </nav>
        {help ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation" onClick={() => setHelp(false)}>
            <div role="dialog" aria-labelledby="help-title" className="w-full max-w-md rounded-[12px] bg-surface p-4" onClick={(event) => event.stopPropagation()}>
              <h2 id="help-title" className="text-base font-medium">Keyboard shortcuts</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li><kbd>/</kbd> Search</li>
                <li><kbd>h</kbd> Home</li>
                <li><kbd>?</kbd> This list</li>
                <li><kbd>Esc</kbd> Close</li>
              </ul>
              <p className="mt-3 text-sm text-muted">Likes and watch later stay in this browser only.</p>
              <button type="button" className="mt-4 h-9 rounded-[18px] bg-background px-4" onClick={() => setHelp(false)}>Close</button>
            </div>
          </div>
        ) : null}
        <span className="sr-only">{library.likes.length}</span>
      </div>
    </ThemeState>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#FF6600" />
      <path d="M8.5 7h5.4l2.1 8.4L18.1 7H23.5l-5.6 12.4V25h-3.8v-5.6L8.5 7z" fill="white" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
