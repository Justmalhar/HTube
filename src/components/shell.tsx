"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CatalogSync } from "@/components/catalog-sync";
import {
  CompassIcon,
  GearIcon,
  GridIcon,
  HistoryIcon,
  HomeIcon,
  KeyboardIcon,
  LaterIcon,
  LikeIcon,
  ListIcon,
  LongsIcon,
  MenuIcon,
  SearchIcon,
  YouIcon,
} from "@/components/icons";
import { ThemeButton, ThemeState, useLibrary } from "@/components/library";
import { Wordmark } from "@/components/logo";
import { activeHref } from "@/components/nav-active";
import { SearchBox } from "@/components/search-box";
import { iconButtonClass, pillOnClass } from "@/components/ui";

type NavLink = { href: string; label: string; Icon: (props: { active?: boolean }) => React.ReactElement; match?: readonly string[] };

const YOU_PATHS = ["/later", "/history", "/liked", "/settings"];

const SECTIONS: readonly { title?: string; links: readonly NavLink[] }[] = [
  {
    links: [
      { href: "/", label: "Home", Icon: HomeIcon },
      { href: "/browse?dur=xlong", label: "Longs", Icon: LongsIcon },
      { href: "/categories", label: "Categories", Icon: GridIcon },
      { href: "/playlists", label: "Playlists", Icon: ListIcon },
      { href: "/browse", label: "Browse", Icon: CompassIcon },
    ],
  },
  {
    title: "You",
    links: [
      { href: "/history", label: "History", Icon: HistoryIcon },
      { href: "/later", label: "Watch later", Icon: LaterIcon },
      { href: "/liked", label: "Liked videos", Icon: LikeIcon },
    ],
  },
  { links: [{ href: "/settings", label: "Settings", Icon: GearIcon }] },
];
const DRAWER_LINKS = SECTIONS.flatMap((section) => section.links);

const RAIL: readonly NavLink[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/browse?dur=xlong", label: "Longs", Icon: LongsIcon },
  { href: "/categories", label: "Topics", Icon: GridIcon },
  { href: "/later", label: "You", Icon: YouIcon, match: YOU_PATHS },
];

const MOBILE: readonly NavLink[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/browse?dur=xlong", label: "Longs", Icon: LongsIcon },
  { href: "/categories", label: "Topics", Icon: GridIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/later", label: "You", Icon: YouIcon, match: YOU_PATHS },
];

const WIDE = "(min-width: 1312px)";
function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
function subscribeRail(listener: () => void) {
  window.addEventListener("oht-rail", listener);
  return () => window.removeEventListener("oht-rail", listener);
}

const drawerItemClass =
  "press relative flex h-10 items-center gap-6 rounded-[10px] px-3 text-sm hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:hover:bg-surface-hover";
const railItemClass =
  "press relative flex h-[74px] flex-col items-center justify-center gap-1.5 rounded-[10px] text-[10px] hover:bg-surface aria-[current=page]:font-medium";
const mobileItemClass =
  "press relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] text-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground";
const dockedAsideClass =
  "min-[1312px]:visible min-[1312px]:top-14 min-[1312px]:z-(--z-rail) min-[1312px]:translate-x-0 min-[1312px]:shadow-none min-[1312px]:transition-none rail:min-[1312px]:hidden";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // The drawer remembers the path it opened on, so any navigation (link, back button, `h`) closes it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
  const rail = useSyncExternalStore(subscribeRail, () => document.documentElement.hasAttribute("data-rail"), () => false);
  // Watch pages follow YouTube: no docked sidebar or rail at any width, the menu always opens the drawer.
  const watch = pathname.startsWith("/watch/");
  // On watch pages the header is see-through at the top so the ambient glow reads as one surface with it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!watch) return;
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [watch]);
  const docked = wide && !watch;
  const drawerOpen = !docked && openedAt === pathname;
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const helpRef = useRef<HTMLDialogElement>(null);
  useLibrary(); // boots the saved library for every page

  const closeDrawer = () => setOpenedAt(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedAt(null);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (typing || event.isComposing || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "/") {
        event.preventDefault();
        const input = document.getElementById("site-search") as HTMLInputElement | null;
        // The inline field is hidden on phones; fall back to the search page there.
        if (input && input.offsetParent !== null) {
          input.focus();
          input.select();
        } else {
          router.push("/search");
        }
      } else if (event.key === "?") {
        setHelp(true);
      } else if (event.key === "h") {
        setOpenedAt(null);
        router.push("/");
      }
    };
    const onPop = () => setOpenedAt(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [router]);

  // Modal drawer: move focus in, give it back to the menu button on close.
  useEffect(() => {
    if (!drawerOpen) return;
    const aside = asideRef.current;
    const menu = menuRef.current;
    closeRef.current?.focus();
    return () => {
      if (aside?.contains(document.activeElement)) menu?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  useEffect(() => {
    const dialog = helpRef.current;
    if (!dialog) return;
    if (help && !dialog.open) dialog.showModal();
    if (!help && dialog.open) dialog.close();
  }, [help]);

  const toggleRail = () => {
    const next = !rail;
    try {
      localStorage.setItem("oht.rail", next ? "1" : "0");
    } catch {
      // storage blocked: the rail still toggles for this page view
    }
    document.documentElement.toggleAttribute("data-rail", next);
    window.dispatchEvent(new Event("oht-rail"));
  };

  return (
    <ThemeState>
      <div className="min-h-full bg-background text-foreground">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-2 focus:z-(--z-skip) focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <header
          inert={drawerOpen}
          className={`fixed inset-x-0 top-0 z-(--z-header) flex h-14 items-center gap-2 px-2 transition-colors duration-200 min-[801px]:gap-4 min-[801px]:px-4 ${watch && !scrolled ? "bg-transparent" : "bg-background"}`}
        >
          <button
            ref={menuRef}
            type="button"
            className={iconButtonClass}
            aria-label={docked ? (rail ? "Expand sidebar" : "Collapse sidebar") : "Open menu"}
            aria-expanded={docked ? !rail : drawerOpen}
            aria-controls="sidebar"
            onClick={() => (docked ? toggleRail() : setOpenedAt(pathname))}
          >
            <MenuIcon />
          </button>
          <Wordmark collapse />
          <Link href="/search" className={`ml-auto sm:hidden ${iconButtonClass}`} aria-label="Search">
            <SearchIcon />
          </Link>
          <SearchBox id="site-search" className="mx-auto hidden min-w-0 max-w-[640px] flex-1 sm:flex" />
          <button type="button" className={`hidden min-[801px]:grid ${iconButtonClass}`} aria-label="Keyboard shortcuts" onClick={() => setHelp(true)}>
            <KeyboardIcon />
          </button>
          <ThemeButton />
        </header>

        <aside
          ref={asideRef}
          id="sidebar"
          role={drawerOpen ? "dialog" : undefined}
          aria-modal={drawerOpen || undefined}
          aria-label="Menu"
          data-scroll-lock={drawerOpen ? "" : undefined}
          className={`fixed inset-y-0 left-0 z-(--z-drawer) w-60 overflow-y-auto overscroll-contain bg-background px-3 pb-[calc(24px+env(safe-area-inset-bottom))] transition-[translate,visibility] duration-300 ease-out-expo ${
            drawerOpen ? "visible translate-x-0 shadow-2xl" : "invisible -translate-x-full"
          } ${watch ? "" : dockedAsideClass}`}
        >
          <div className={`flex h-14 items-center gap-4 px-1 ${watch ? "" : "min-[1312px]:hidden"}`}>
            <button ref={closeRef} type="button" className={iconButtonClass} aria-label="Close menu" onClick={closeDrawer}>
              <MenuIcon />
            </button>
            <Wordmark onNavigate={closeDrawer} />
          </div>
          <nav aria-label="Sections">
            <Current links={DRAWER_LINKS}>
              {(current) =>
                SECTIONS.map((section, index) => (
                  <div key={section.title ?? index} className={index ? "mt-3 border-t border-line pt-3" : ""}>
                    {section.title ? <h2 className="flex h-10 items-center px-3 text-base font-medium">{section.title}</h2> : null}
                    {section.links.map(({ href, label, Icon }) => (
                      <Link key={href} href={href} aria-current={href === current ? "page" : undefined} className={drawerItemClass} onClick={closeDrawer}>
                        <Icon active={href === current} />
                        <span className="truncate">{label}</span>
                        <Pending />
                      </Link>
                    ))}
                  </div>
                ))
              }
            </Current>
          </nav>
        </aside>

        <nav
          aria-label="Shortcuts"
          inert={drawerOpen}
          className={`fixed bottom-0 left-0 top-14 z-(--z-rail) hidden w-[72px] flex-col gap-1 px-1 ${watch ? "" : "min-[801px]:flex min-[1312px]:hidden rail:min-[1312px]:flex"}`}
        >
          <Current links={RAIL}>
            {(current) =>
              RAIL.map(({ href, label, Icon }) => (
                <Link key={href} href={href} aria-current={href === current ? "page" : undefined} className={railItemClass}>
                  <Icon active={href === current} />
                  {label}
                  <Pending />
                </Link>
              ))
            }
          </Current>
        </nav>

        <CatalogSync />

        <div
          aria-hidden
          onClick={closeDrawer}
          className={`fixed inset-0 z-(--z-scrim) bg-black/50 transition-opacity duration-300 ease-out-quart ${watch ? "" : "min-[1312px]:hidden"} ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <main
          id="content"
          tabIndex={-1}
          inert={drawerOpen}
          className={`px-4 pb-[calc(80px+env(safe-area-inset-bottom))] pt-16 focus:outline-none min-[801px]:pb-20 min-[801px]:pr-6 ${watch ? "min-[801px]:pl-6" : "min-[801px]:pl-[88px] min-[1312px]:pl-[256px] rail:min-[1312px]:pl-[88px]"}`}
        >
          {children}
        </main>

        <nav
          aria-label="Mobile"
          inert={drawerOpen}
          className="fixed inset-x-0 bottom-0 z-(--z-header) grid grid-cols-5 border-t border-line bg-background pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] min-[801px]:hidden"
        >
          <Current links={MOBILE}>
            {(current) =>
              MOBILE.map(({ href, label, Icon }) => (
                <Link key={label} href={href} aria-current={href === current ? "page" : undefined} className={mobileItemClass}>
                  <Icon active={href === current} />
                  {label}
                  <Pending />
                </Link>
              ))
            }
          </Current>
        </nav>

        <dialog
          ref={helpRef}
          aria-labelledby="help-title"
          className="modal m-auto w-[calc(100%-32px)] max-w-sm rounded-2xl bg-surface p-0 text-foreground shadow-2xl"
          onClose={() => setHelp(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setHelp(false);
          }}
        >
          <div className="p-6">
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
              <button type="button" className={pillOnClass} onClick={() => setHelp(false)}>Done</button>
            </div>
          </div>
        </dialog>
      </div>
    </ThemeState>
  );
}

/**
 * Resolves the one current link from pathname and query. useSearchParams needs a Suspense
 * boundary for prerendered routes; the fallback renders the same links with nothing current.
 */
function Current({ links, children }: { links: readonly NavLink[]; children: (current: string | undefined) => React.ReactNode }) {
  return (
    <Suspense fallback={children(undefined)}>
      <LiveCurrent links={links}>{children}</LiveCurrent>
    </Suspense>
  );
}

function LiveCurrent({ links, children }: { links: readonly NavLink[]; children: (current: string | undefined) => React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  return children(activeHref(links, pathname, params));
}

/** Thin bar inside a nav link while its navigation is pending (only shows when not prefetched). */
function Pending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-3 bottom-1 h-0.5 overflow-hidden rounded-full transition-opacity duration-150 ${pending ? "opacity-100" : "opacity-0"}`}
    >
      {pending ? <span className="pending-bar block h-full w-2/5 rounded-full bg-primary" /> : null}
    </span>
  );
}

