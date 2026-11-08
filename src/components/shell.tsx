"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CatalogSync } from "@/components/catalog-sync";
import { ThemeButton, ThemeState, useLibrary } from "@/components/library";
import { iconButtonClass } from "@/components/ui";

type NavLink = readonly [href: string, label: string, Icon: () => React.ReactElement];

const SECTIONS: readonly { title?: string; links: readonly NavLink[] }[] = [
  {
    links: [
      ["/", "Home", HomeIcon],
      ["/browse?dur=xlong", "Longs", LongsIcon],
      ["/categories", "Categories", GridIcon],
      ["/playlists", "Playlists", ListIcon],
      ["/browse", "Browse", CompassIcon],
    ],
  },
  {
    title: "You",
    links: [
      ["/history", "History", HistoryIcon],
      ["/later", "Watch later", ClockIcon],
      ["/liked", "Liked videos", LikeIcon],
    ],
  },
  { links: [["/settings", "Settings", GearIcon]] },
];

const RAIL: readonly NavLink[] = [
  ["/", "Home", HomeIcon],
  ["/browse?dur=xlong", "Longs", LongsIcon],
  ["/categories", "Topics", GridIcon],
  ["/later", "You", YouIcon],
];

const MOBILE: readonly NavLink[] = [
  ["/", "Home", HomeIcon],
  ["/browse?dur=xlong", "Longs", LongsIcon],
  ["/categories", "Topics", GridIcon],
  ["/search", "Search", SearchIcon],
  ["/later", "You", YouIcon],
];

function isActive(pathname: string, search: string, href: string) {
  const queryAt = href.indexOf("?");
  const path = queryAt === -1 ? href : href.slice(0, queryAt);
  const expected = new URLSearchParams(queryAt === -1 ? "" : href.slice(queryAt + 1));
  const current = new URLSearchParams(search);
  if (path === "/") return pathname === "/";
  if (path === "/browse") {
    const longs = current.get("dur") === "xlong";
    return pathname === "/browse" && (expected.get("dur") === "xlong" ? longs : !longs);
  }
  if (path === "/categories") return pathname === "/categories" || pathname.startsWith("/c/") || pathname.startsWith("/a/");
  if (path === "/playlists") return pathname === "/playlists" || pathname.startsWith("/p/");
  return pathname === path;
}

function itemActive(pathname: string, search: string, href: string, label: string) {
  if (label === "You") return pathname === "/history" || pathname === "/later" || pathname === "/liked";
  return isActive(pathname, search, href);
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFrame search="">{children}</ShellFrame>}>
      <ShellSearch>{children}</ShellSearch>
    </Suspense>
  );
}

function ShellSearch({ children }: { children: React.ReactNode }) {
  const search = useSearchParams().toString();
  return <ShellFrame search={search}>{children}</ShellFrame>;
}

function ShellFrame({ children, search }: { children: React.ReactNode; search: string }) {
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
        <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 bg-background px-2 min-[801px]:gap-4 min-[801px]:px-4">
          <button
            type="button"
            className={iconButtonClass}
            aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              if (window.matchMedia("(max-width: 1311px)").matches) {
                setOpen(true);
                return;
              }
              localStorage.setItem("oht.rail", rail ? "0" : "1");
              window.dispatchEvent(new Event("oht-rail"));
            }}
          >
            <MenuIcon />
          </button>
          <Wordmark />
          <Link href="/search" className={`ml-auto sm:hidden ${iconButtonClass}`} aria-label="Search">
            <SearchIcon />
          </Link>
          <form action="/search" className="group/search mx-auto hidden min-w-0 max-w-[640px] flex-1 sm:flex">
            <label className="sr-only" htmlFor="site-search">Search</label>
            <div className="flex h-10 min-w-0 flex-1 items-center rounded-l-full border border-line bg-background pl-4 focus-within:border-[#1c62b9] focus-within:pl-2">
              <span className="hidden text-muted group-focus-within/search:block">
                <SearchIcon />
              </span>
              <input
                id="site-search"
                name="q"
                placeholder="Search"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted"
              />
              <kbd className="mr-3 hidden rounded border border-line px-1.5 text-xs text-muted min-[1000px]:block">/</kbd>
            </div>
            <button className="grid h-10 w-16 place-items-center rounded-r-full border border-l-0 border-line bg-surface hover:bg-surface-hover" type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
          <button type="button" className={`hidden min-[801px]:grid ${iconButtonClass}`} aria-label="Keyboard shortcuts" onClick={() => setHelp(true)}>
            <KeyboardIcon />
          </button>
          <ThemeButton />
        </header>
        <aside className={`${open ? "block" : "hidden"} fixed bottom-0 left-0 top-0 z-50 w-60 overflow-y-auto bg-background px-3 pb-6 min-[1312px]:top-14 ${rail ? "min-[1312px]:hidden" : "min-[1312px]:block"}`}>
          <div className="flex h-14 items-center gap-4 px-1 min-[1312px]:hidden">
            <button type="button" className={iconButtonClass} aria-label="Close menu" onClick={() => setOpen(false)}>
              <MenuIcon />
            </button>
            <Wordmark />
          </div>
          <nav aria-label="Sections">
            {SECTIONS.map((section, index) => (
              <div key={section.title ?? index} className={index ? "mt-3 border-t border-line pt-3" : ""}>
                {section.title ? (
                  <p className="flex h-8 items-center px-3 text-base font-medium">{section.title}</p>
                ) : null}
                {section.links.map(([href, label, Icon]) => {
                  const active = isActive(pathname, search, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      scroll
                      aria-current={active ? "page" : undefined}
                      className={`flex h-10 items-center gap-6 rounded-[10px] px-3 text-sm ${active ? "bg-surface font-medium text-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
                      onClick={() => window.setTimeout(() => setOpen(false), 0)}
                    >
                      <Icon />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <p className="mt-3 border-t border-line px-3 pt-4 text-xs leading-5 text-muted">
            Picks from Hacker News comments. Data from HackerTube and open-index, ODC-By
          </p>
        </aside>
        <nav aria-label="Shortcuts" className={`fixed bottom-0 left-0 top-14 z-20 hidden w-[72px] flex-col gap-1 px-1 min-[801px]:flex ${rail ? "" : "min-[1312px]:hidden"}`}>
            {RAIL.map(([href, label, Icon]) => {
              const active = itemActive(pathname, search, href, label);
              return (
              <Link
                key={href}
                href={href}
                scroll
                aria-current={active ? "page" : undefined}
                className={`flex h-[74px] flex-col items-center justify-center gap-1.5 rounded-[10px] text-[10px] hover:bg-surface ${active ? "font-medium text-foreground" : "text-muted"}`}
              >
                <Icon />
                {label}
              </Link>
              );
            })}
          </nav>
        <div className="sr-only">
          <CatalogSync />
        </div>
        {open ? <button type="button" className="fixed bottom-0 left-60 right-0 top-0 z-30 bg-black/50 min-[1312px]:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
        <div id="content" className={`px-4 pb-20 pt-16 min-[801px]:pr-6 min-[801px]:pl-[88px] ${rail ? "" : "min-[1312px]:pl-[256px]"}`}>
          {children}
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-line bg-background min-[801px]:hidden" aria-label="Mobile">
          {MOBILE.map(([href, label, Icon]) => {
            const active = itemActive(pathname, search, href, label);
            return (
            <Link
              key={label}
              href={href}
              scroll
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${active ? "font-medium text-foreground" : "text-muted"}`}
            >
              <Icon />
              {label}
            </Link>
            );
          })}
        </nav>
        {help ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation" onClick={() => setHelp(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby="help-title" className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <h2 id="help-title" className="text-lg font-medium">Keyboard shortcuts</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {[["/", "Search"], ["h", "Home"], ["?", "Shortcuts"], ["Esc", "Close"]].map(([key, label]) => (
                  <li key={key} className="flex items-center justify-between">
                    {label}
                    <kbd className="min-w-8 rounded-md bg-background px-2 py-1 text-center text-xs">{key}</kbd>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">Likes and Watch later stay in this browser</p>
              <div className="mt-6 flex justify-end">
                <button type="button" className="h-9 rounded-full bg-chip-on px-4 text-sm font-medium text-chip-on-text" onClick={() => setHelp(false)}>Done</button>
              </div>
            </div>
          </div>
        ) : null}
        <span className="sr-only">{library.likes.length}</span>
      </div>
    </ThemeState>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex h-10 items-center gap-1 rounded-lg pr-2" aria-label="OpenHackerTube, home">
      <span aria-hidden className="grid h-6 w-[30px] place-items-center rounded-[7px] bg-primary text-sm font-bold leading-none text-white">
        Y
      </span>
      <span className="text-[19px] font-bold leading-none tracking-[-0.8px]">HackerTube</span>
    </Link>
  );
}

function KeyboardIcon() {
  return <IconPath d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v8h16V8zm1 1h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zM7 13h10v2H7z" />;
}
function LongsIcon() {
  return <IconPath d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h14V7zm5 2 5 3-5 3z" />;
}
function YouIcon() {
  return <IconPath d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 8c4 0 8 2 8 5v1H4v-1c0-3 4-5 8-5zm0 2c-2.7 0-5 1-5.7 2h11.4c-.7-1-3-2-5.7-2z" />;
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
