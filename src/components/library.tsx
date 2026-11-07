"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

import { MoonIcon, SunIcon } from "@/components/icons";
import { iconButtonClass } from "@/components/ui";

type Library = {
  likes: string[];
  dislikes: string[];
  later: string[];
  seen: string[];
  frames: boolean;
};

const EMPTY: Library = { likes: [], dislikes: [], seen: [], later: [], frames: true };
const KEY = "oht.library.v1";

export type ListKind = "likes" | "dislikes" | "later" | "seen";

let state = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

// Read storage lazily on the client. Every mutation goes through current(), so a write can never
// start from the empty server snapshot and wipe what is already stored.
function current(): Library {
  if (loaded || typeof window === "undefined") return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw) as Partial<Library>;
    state = {
      likes: parsed.likes ?? [],
      dislikes: parsed.dislikes ?? [],
      later: parsed.later ?? [],
      seen: parsed.seen ?? [],
      frames: parsed.frames !== false,
    };
  } catch {
    state = EMPTY;
  }
  return state;
}

function commit(next: Library) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or full quota: keep the in-memory state for this tab.
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  loaded = false;
  current();
  emit();
}

function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

const without = (list: string[], vid: string) => list.filter((id) => id !== vid);

const actions = {
  toggleLike(vid: string) {
    const value = current();
    const likes = value.likes.includes(vid) ? without(value.likes, vid) : value.likes.concat(vid);
    commit({ ...value, likes, dislikes: without(value.dislikes, vid) });
  },
  toggleDislike(vid: string) {
    const value = current();
    const dislikes = value.dislikes.includes(vid) ? without(value.dislikes, vid) : value.dislikes.concat(vid);
    commit({ ...value, dislikes, likes: without(value.likes, vid) });
  },
  toggleLater(vid: string) {
    const value = current();
    commit({ ...value, later: value.later.includes(vid) ? without(value.later, vid) : value.later.concat(vid) });
  },
  markSeen(vid: string) {
    const value = current();
    if (value.seen.at(-1) === vid) return;
    // Re-watching moves the id to the end, so History lists it first again.
    commit({ ...value, seen: without(value.seen, vid).concat(vid).slice(-500) });
  },
  clearHistory() {
    commit({ ...current(), seen: [] });
  },
  /** Replace one list wholesale. Used by remove, clear all, and their Undo. */
  setList(kind: ListKind, ids: string[]) {
    commit({ ...current(), [kind]: ids });
  },
  setFrames(frames: boolean) {
    commit({ ...current(), frames });
  },
};

const noop = () => () => undefined;

/** False during SSR and hydration, true after. Use it to avoid flashing an empty state. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function useLibrary() {
  const value = useSyncExternalStore(subscribe, current, () => EMPTY);
  return { ...value, ...actions };
}

/** Settings row for the middle-frame thumbnails. A client island so the Settings page can stay a server component. */
export function FramesSetting() {
  const library = useLibrary();
  const ready = useHydrated();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3 hover:bg-surface-hover">
      <span className="min-w-0">
        <span className="block text-sm font-medium">Middle frames</span>
        <span className="block text-sm text-muted">Show a frame from the middle of each video</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        className="size-5 shrink-0 accent-primary"
        checked={library.frames}
        disabled={!ready}
        onChange={(event) => library.setFrames(event.target.checked)}
      />
    </label>
  );
}

const ThemeContext = createContext<{ theme: "dark" | "light"; toggle: () => void }>({
  theme: "dark",
  toggle: () => undefined,
});

export function ThemeButton() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button
      type="button"
      className={iconButtonClass}
      aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
      onClick={toggle}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function ThemeState({ children }: { children: React.ReactNode }) {
  // Fallback for pages Next renders without running the head boot script (not-found responses).
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.theme) return;
    try {
      root.dataset.theme = localStorage.getItem("oht.theme") === "light" ? "light" : "dark";
      window.dispatchEvent(new Event("oht-theme"));
    } catch {
      // Storage blocked: stay on the default dark theme.
    }
  }, []);
  const theme = useSyncExternalStore(
    (listener) => {
      window.addEventListener("oht-theme", listener);
      return () => window.removeEventListener("oht-theme", listener);
    },
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark" as const,
  );
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle() {
          const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
          const apply = () => {
            document.documentElement.dataset.theme = next;
            window.dispatchEvent(new Event("oht-theme"));
          };
          try {
            localStorage.setItem("oht.theme", next);
          } catch {
            // Storage blocked: the theme still applies for this page view.
          }
          // Crossfade where supported (CSS in globals.css); plain swap elsewhere.
          if (document.startViewTransition) document.startViewTransition(apply);
          else apply();
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
