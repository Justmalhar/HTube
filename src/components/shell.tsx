"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { CatalogSync } from "@/components/catalog-sync";
import { ThemeButton, ThemeState, useLibrary } from "@/components/library";

const LINKS = [
  ["/", "Home", HomeIcon],
  ["/browse?dur=xlong", "Longs", ClockIcon],
  ["/categories", "Categories", GridIcon],
  ["/playlists", "Playlists", ListIcon],
  ["/browse", "Browse", CompassIcon],
  ["/liked", "Liked", LikeIcon],
  ["/later", "Watch later", ClockIcon],
  ["/history", "History", HistoryIcon],
  ["/settings", "Settings", GearIcon],
  ["/about", "About", InfoIcon],
  ["/data", "Data", DataIcon],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const rail = useSyncExternalStore(
    (listener) => {
      window.addEventListener("oht-rail", listener);
      return () => window.removeEventListener("oht-rail", listener);
    },
    () => localStorage.getItem("oht.rail") === "1",
    () => false,
  );
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
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full"
            aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              if (window.matchMedia("(max-width: 800px)").matches) {
                setOpen(true);
                return;
              }
              localStorage.setItem("oht.rail", rail ? "0" : "1");
              window.dispatchEvent(new Event("oht-rail"));
            }}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="text-[18px] font-medium leading-none tracking-[-0.4px]" aria-label="OpenHackerTube, home">
            Hacker<span className="text-primary">Tube</span>
          </Link>
          <Link href="/search" className="ml-auto grid size-10 place-items-center rounded-full sm:hidden" aria-label="Search">
            <SearchIcon />
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
        <aside className={`${open ? "block" : "hidden"} fixed bottom-0 left-0 top-14 z-40 w-60 overflow-y-auto border-r border-line bg-background p-3 min-[801px]:block ${rail ? "min-[801px]:w-[72px] min-[801px]:px-2" : ""}`}>
          <nav className="flex flex-col gap-1" aria-label="Sections">
            {LINKS.map(([href, label, Icon]) => {
              const active = pathname === href || (href === "/browse" && pathname === "/browse");
              return (
                <a key={href} href={href} title={label} className={`flex h-10 items-center gap-3 rounded-[10px] px-3 ${rail ? "min-[801px]:justify-center min-[801px]:px-0" : ""} ${active ? "bg-surface font-medium" : "hover:bg-surface"}`} onClick={() => setOpen(false)}>
                  <Icon />
                  <span className={rail ? "min-[801px]:sr-only" : ""}>{label}</span>
                </a>
              );
            })}
          </nav>
          <div className={`mt-6 ${rail ? "min-[801px]:hidden" : ""}`}>
            <CatalogSync />
          </div>
        </aside>
        {open ? <button type="button" className="fixed inset-0 z-30 bg-black/50 min-[801px]:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
        <div id="content" className={`px-4 pb-20 pt-16 min-[801px]:pr-6 ${rail ? "min-[801px]:pl-[88px]" : "min-[801px]:pl-[256px]"}`}>
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconPath({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

function HomeIcon() {
  return <IconPath d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4z" />;
}
function ClockIcon() {
  return <IconPath d="M12 4a8 8 0 1 0 .01 0zM11 8h2v5l3 2-1 1.6-4-2.6z" />;
}
function GridIcon() {
  return <IconPath d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />;
}
function ListIcon() {
  return <IconPath d="M4 6h12v2H4zm0 5h12v2H4zm0 5h8v2H4zm11 0v6l5-3z" />;
}
function CompassIcon() {
  return <IconPath d="M12 3a9 9 0 1 0 .01 0zm3.5 5.5-2 5-5 2 2-5z" />;
}
function LikeIcon() {
  return <IconPath d="M7 10v10H4V10zm3 .2 3.2-4.5c.4-.5 1.2-.4 1.4.2L14 9h4.2c1.2 0 2.1 1.1 1.8 2.2l-1.2 5.2A2 2 0 0 1 16.9 18H10z" />;
}
function HistoryIcon() {
  return <IconPath d="M12 5a7 7 0 1 0 6.3 4H16a5 5 0 1 1-1.5-3.2L13 7V3h4l-1.4 1.4A7 7 0 0 0 12 5zm-1 3h2v4.2l2.6 1.5-1 1.7L11 13.2z" />;
}
function GearIcon() {
  return <IconPath d="M12 8a4 4 0 1 0 .01 0zM4 13l2-1.2.3-1.6L5 8.6 7 7l1.5.8h1.8L12 6.5 14 8h1.7L17 7l2 1.6-1.3 1.6.3 1.6L20 13l-2 1.2-.3 1.6L19 17.4 17 19l-1.5-.8h-1.8L12 19.5 10 18H8.3L7 19l-2-1.6 1.3-1.6L6 14.2z" />;
}
function InfoIcon() {
  return <IconPath d="M12 3a9 9 0 1 0 .01 0zM11 10h2v7h-2zm0-4h2v2h-2z" />;
}
function DataIcon() {
  return <IconPath d="M5 5h14v4H5zm0 5h14v4H5zm0 5h14v4H5z" />;
}
