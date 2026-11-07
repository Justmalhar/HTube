"use client";

import { BellIcon } from "@/components/icons";
import { useHydrated, useLibrary } from "@/components/library";

export function SubscribeButton({ slug, name }: { slug: string; name: string }) {
  const library = useLibrary();
  const ready = useHydrated();
  const on = ready && library.subs.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Unsubscribe from ${name}` : `Subscribe to ${name}`}
      disabled={!ready}
      onClick={() => library.toggleSub(slug)}
      className={`press hit inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium ${on ? "bg-surface hover:bg-surface-hover" : "bg-chip-on text-chip-on-text"}`}
    >
      {on ? <BellIcon /> : null}
      {on ? "Subscribed" : "Subscribe"}
    </button>
  );
}
