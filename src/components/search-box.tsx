"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ClockIcon, CloseIcon, GridIcon, SearchIcon, YouIcon } from "@/components/icons";
import type { Suggestion } from "@/lib/suggest";

const KEY = "oht.recentSearches";
const MAX_RECENT = 10;
const MAX_Q = 80;

type Option = Suggestion | { kind: "recent"; text: string; href: string };

function searchHref(q: string) {
  return q ? `/search?${new URLSearchParams({ q })}` : "/search";
}

function readRecents(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecents(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage blocked: recents just do not persist
  }
}

/** Matched part plain, the rest bold, like YouTube. */
function Highlight({ text, q }: { text: string; q: string }) {
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  const end = at + q.length;
  return (
    <>
      {at ? <b className="font-semibold">{text.slice(0, at)}</b> : null}
      {text.slice(at, end)}
      {end < text.length ? <b className="font-semibold">{text.slice(end)}</b> : null}
    </>
  );
}

function OptionIcon({ kind }: { kind: Option["kind"] }) {
  if (kind === "recent") return <ClockIcon />;
  if (kind === "channel") return <YouIcon />;
  if (kind === "topic") return <GridIcon />;
  return <SearchIcon />;
}

/** Search field with typeahead: suggestions while typing, recent searches when empty. */
export function SearchBox({ id, className = "", defaultValue = "" }: { id: string; className?: string; defaultValue?: string }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  // `typed` is what the viewer wrote; `value` also shows the arrow-key preview.
  const [typed, setTyped] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  const query = typed.trim();
  const options: Option[] = query
    ? items
    : recents.map((text) => ({ kind: "recent", text, href: searchHref(text) }));
  const shown = open && options.length > 0;

  useEffect(() => {
    if (!query || !open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query.slice(0, MAX_Q))}`, { signal: controller.signal });
        const json = (await res.json()) as { items: Suggestion[] };
        setItems(json.items);
      } catch {
        // aborted or offline: keep the previous suggestions
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const remember = (text: string) => {
    const next = [text, ...readRecents().filter((r) => r.toLowerCase() !== text.toLowerCase())].slice(0, MAX_RECENT);
    writeRecents(next);
    setRecents(next);
  };

  const go = (text: string, href: string) => {
    setOpen(false);
    setActive(-1);
    setValue(text);
    setTyped(text);
    remember(text);
    inputRef.current?.blur();
    router.push(href);
  };

  const remove = (text: string) => {
    const next = readRecents().filter((r) => r !== text);
    writeRecents(next);
    setRecents(next);
    setActive(-1);
  };

  const move = (delta: number) => {
    if (!options.length) return;
    if (!shown) {
      setOpen(true);
      return;
    }
    // Slot 0 is the typed text itself, so the cycle has options.length + 1 stops.
    const next = ((active + 1 + delta + options.length + 1) % (options.length + 1)) - 1;
    setActive(next);
    setValue(next < 0 ? typed : options[next].text);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Escape") {
      if (shown) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
        setValue(typed);
      } else if (value) {
        event.preventDefault();
        setValue("");
        setTyped("");
      }
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <form
      action="/search"
      role="search"
      className={`group/search ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const picked = shown && active >= 0 ? options[active] : undefined;
        const q = value.trim();
        if (picked) go(picked.text, picked.href);
        else if (q) go(q, searchHref(q));
        else router.push("/search");
      }}
    >
      <label className="sr-only" htmlFor={id}>Search</label>
      <div ref={rootRef} className="relative flex h-10 min-w-0 flex-1 items-center rounded-l-full border border-line bg-background pl-4 focus-within:border-focus focus-within:pl-2">
        <span className="hidden text-muted group-focus-within/search:block">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={shown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="Search"
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          maxLength={200}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setTyped(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => {
            setRecents(readRecents());
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 appearance-none bg-transparent px-2 text-base outline-none! placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {!value ? (
          <kbd className="mr-3 hidden rounded border border-line px-1.5 text-xs text-muted min-[1000px]:block group-focus-within/search:hidden">/</kbd>
        ) : null}
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          hidden={!shown}
          className="absolute inset-x-0 top-full z-(--z-sticky) mt-1 overflow-hidden rounded-xl bg-surface py-2 shadow-2xl ring-1 ring-line"
        >
          {shown
            ? options.map((option, index) => (
                <li
                  key={`${option.kind}:${option.text}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={`group/row relative flex h-9 cursor-pointer items-center gap-3 px-4 text-base hover:bg-surface-hover ${index === active ? "bg-surface-hover" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(option.text, option.href)}
                >
                  <span className="grid w-6 shrink-0 place-items-center text-muted">
                    <OptionIcon kind={option.kind} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.kind === "recent" ? option.text : <Highlight text={option.text} q={query} />}
                  </span>
                  {option.kind === "recent" ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${option.text} from recent searches`}
                      className="press hit -mr-2 grid size-8 shrink-0 place-items-center rounded-full text-muted opacity-0 hover:text-foreground group-hover/row:opacity-100 pointer-coarse:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(option.text);
                      }}
                    >
                      <CloseIcon />
                    </button>
                  ) : null}
                </li>
              ))
            : null}
        </ul>
      </div>
      <button
        className="press grid h-10 w-16 shrink-0 place-items-center rounded-r-full border border-l-0 border-line bg-surface hover:bg-surface-hover"
        type="submit"
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </form>
  );
}
