"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "oht.autoplay";
const EVENT = "oht:autoplay";
const SECONDS = 5;

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT, notify);
  };
}

function read() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** Autoplay preference, default on. The server snapshot is "on" so hydration matches. */
export function useAutoplay() {
  const on = useSyncExternalStore(subscribe, read, () => true);
  const set = (next: boolean) => {
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // Storage can be blocked; the toggle just will not persist.
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [on, set] as const;
}

export function AutoplayToggle() {
  const [on, set] = useAutoplay();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => set(!on)}
      className="press ml-auto inline-flex h-8 items-center gap-2 rounded-full px-1 text-sm font-medium"
    >
      Autoplay
      <span className={`relative h-4 w-9 rounded-full transition-colors motion-reduce:transition-none ${on ? "bg-primary" : "bg-surface-hover"}`}>
        <span
          className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow transition-[left] motion-reduce:transition-none ${on ? "left-[18px]" : "left-0"}`}
        />
      </span>
    </button>
  );
}

/** End-screen card: counts down, then navigates. Unmounted (and so reset) when the video changes. */
export function UpNextCard({ href, title, onCancel }: { href: string; title: string; onCancel: () => void }) {
  const router = useRouter();
  const [left, setLeft] = useState(SECONDS);
  useEffect(() => {
    if (left <= 0) {
      router.push(href);
      return;
    }
    const timer = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left, href, router]);
  return (
    <div
      role="status"
      className="absolute bottom-3 right-3 z-10 w-[min(18rem,calc(100%-1.5rem))] rounded-xl bg-black/85 p-3 text-white backdrop-blur-md"
    >
      <p className="text-xs text-white/70">
        Up next in <span className="tabular-nums">{Math.max(left, 0)}</span>
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-5 wrap-anywhere">{title}</p>
      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/20" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
          style={{ width: `${((SECONDS - left) / SECONDS) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="press h-8 flex-1 rounded-full bg-white/15 text-sm font-medium hover:bg-white/25" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="press h-8 flex-1 rounded-full bg-white text-sm font-medium text-black" onClick={() => router.push(href)}>
          Play now
        </button>
      </div>
    </div>
  );
}
