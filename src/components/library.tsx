"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Library = {
  likes: string[];
  dislikes: string[];
  later: string[];
  seen: string[];
  frames: boolean;
};

const EMPTY: Library = { likes: [], dislikes: [], seen: [], later: [], frames: true };
const KEY = "oht.library.v1";

let state = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
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
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

let booted = false;

export function useLibrary() {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  useEffect(() => {
    if (booted) return;
    booted = true;
    load();
    emit();
  }, []);
  return {
    ...value,
    toggleLike(vid: string) {
      const likes = value.likes.includes(vid) ? value.likes.filter((id) => id !== vid) : value.likes.concat(vid);
      state = { ...value, likes, dislikes: value.dislikes.filter((id) => id !== vid) };
      save();
    },
    toggleDislike(vid: string) {
      const dislikes = value.dislikes.includes(vid) ? value.dislikes.filter((id) => id !== vid) : value.dislikes.concat(vid);
      state = { ...value, dislikes, likes: value.likes.filter((id) => id !== vid) };
      save();
    },
    toggleLater(vid: string) {
      const later = value.later.includes(vid) ? value.later.filter((id) => id !== vid) : value.later.concat(vid);
      state = { ...value, later };
      save();
    },
    markSeen(vid: string) {
      if (value.seen.includes(vid)) return;
      state = { ...value, seen: value.seen.concat(vid).slice(-500) };
      save();
    },
    clearHistory() {
      state = { ...value, seen: [] };
      save();
    },
    setFrames(frames: boolean) {
      state = { ...value, frames };
      save();
    },
  };
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
      className="grid size-10 place-items-center rounded-full hover:bg-surface"
      aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
      onClick={toggle}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function ThemeState({ children }: { children: React.ReactNode }) {
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
          document.documentElement.dataset.theme = next;
          localStorage.setItem("oht.theme", next);
          window.dispatchEvent(new Event("oht-theme"));
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M15 3a8 8 0 1 0 6 13 7 7 0 0 1-6-13z" fill="currentColor" />
    </svg>
  );
}
