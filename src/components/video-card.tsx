"use client";

import { useEffect, useRef, useState } from "react";

import type { FeedCard } from "@/lib/types";
import { ClockIcon, ExternalIcon, HideIcon, MoreIcon } from "@/components/icons";
import { useLibrary } from "@/components/library";
import { gridClass } from "@/components/ui";


const SAVE_LABEL = "Save to Watch later";
const UNSAVE_LABEL = "Remove from Watch later";

function frameFor(vid: string, frames: boolean) {
  return frames ? `https://i.ytimg.com/vi/${vid}/hq2.jpg` : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
}

const watchHref = (vid: string) => `/watch/${vid}`;
const channelHref = (slug: string) => `/channel/${slug}`;

/**
 * Thumbnail link with the Watch later button as a sibling, never nested inside the link
 * (a button inside an anchor is invalid HTML and swallows clicks on some browsers).
 * The link is skipped by Tab because the title link right below it goes to the same place.
 */
function Thumb({ item, className = "rounded-xl" }: { item: FeedCard; className?: string }) {
  const library = useLibrary();
  const saved = library.later.includes(item.vid);
  return (
    <div className={`group/thumb relative aspect-video overflow-hidden bg-surface ${className}`}>
      <a href={watchHref(item.vid)} tabIndex={-1} aria-hidden className="block size-full">
        <img
          src={frameFor(item.vid, library.frames)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-300 ease-out-quart group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.includes("hqdefault")) image.src = `https://i.ytimg.com/vi/${item.vid}/hqdefault.jpg`;
            else image.style.visibility = "hidden";
          }}
        />
      </a>
      <LaterButton saved={saved} onToggle={() => library.toggleLater(item.vid)} />
    </div>
  );
}

const titleClass = "line-clamp-2 wrap-anywhere text-[15px] font-medium leading-[21px]";
const channelClass = "mt-1 block truncate text-sm text-muted hover:text-foreground";

export function VideoCard({ item }: { item: FeedCard }) {
  const library = useLibrary();
  const [justHid, setJustHid] = useState(false);
  if (library.dislikes.includes(item.vid)) {
    return <HiddenCard focus={justHid} onUndo={() => { setJustHid(false); library.toggleDislike(item.vid); }} />;
  }
  return (
    <article className="group/card relative -m-2 min-w-0 rounded-2xl p-2 pb-3 hover:bg-surface/60">
      <Thumb item={item} />
      <div className="relative mt-3 min-w-0 pr-7">
        <a href={watchHref(item.vid)} className="block rounded-md">
          <h2 className={titleClass}>{item.title}</h2>
        </a>
        <a href={channelHref(item.channelSlug)} className={channelClass}>
          {item.channel}
        </a>
        <CardMenu item={item} onHide={() => setJustHid(true)} className="absolute -right-2 -top-1" />
      </div>
    </article>
  );
}

function HiddenCard({ focus, onUndo }: { focus: boolean; onUndo: () => void }) {
  const undo = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Only after the viewer hid this card from its menu, so focus is not left on <body>.
    if (focus) undo.current?.focus();
  }, [focus]);
  return (
    <div className="-m-2 p-2">
      <div role="status" className="grid aspect-video place-items-center rounded-xl bg-surface p-4 text-center">
        <div>
          <p className="text-sm font-medium">Video hidden</p>
          <p className="mt-1 text-xs text-muted">We will show fewer like this</p>
          <button ref={undo} type="button" className="mt-3 h-9 rounded-full bg-background px-4 text-sm font-medium hover:bg-surface-hover press" onClick={onUndo}>
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}

/** Row style for items inside an ActionMenu. */
export const menuItemClass =
  "flex h-10 w-full items-center gap-3 px-4 text-left text-sm hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none";

/**
 * Three-dot menu: opens from its trigger, focuses the first item, arrows/Home/End move, Escape and
 * outside press close and return focus to the trigger. Activating any [role=menuitem] child runs its
 * own onClick, then the menu closes and focus returns to the trigger.
 */
export function ActionMenu({
  label,
  className,
  triggerClass,
  trigger: triggerContent = <MoreIcon />,
  align = "right",
  children,
}: {
  label: string;
  className: string;
  triggerClass: (open: boolean) => string;
  /** Trigger content; defaults to the three-dot icon. */
  trigger?: React.ReactNode;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKey = (event: React.KeyboardEvent) => {
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={className}>
      <button
        ref={trigger}
        type="button"
        className={triggerClass(open)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {triggerContent}
      </button>
      {open ? (
        <div
          ref={menu}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          onClick={(event) => {
            if (!(event.target as Element).closest("[role=menuitem]")) return;
            setOpen(false);
            trigger.current?.focus();
          }}
          className={`absolute ${align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right"} top-10 z-(--z-sticky) w-60 overflow-hidden rounded-xl bg-surface py-2 shadow-[0_4px_32px_rgba(0,0,0,0.25)] transition-[opacity,scale] duration-150 ease-out-quart starting:scale-95 starting:opacity-0`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function CardMenu({ item, className, onHide }: { item: FeedCard; className: string; onHide?: () => void }) {
  const library = useLibrary();
  const saved = library.later.includes(item.vid);
  const hidden = library.dislikes.includes(item.vid);
  return (
    <ActionMenu
      label={`More actions for ${item.title}`}
      className={className}
      triggerClass={(open) =>
        `press grid size-9 place-items-center rounded-full hover:bg-surface ${open ? "bg-surface" : "min-[801px]:opacity-0 min-[801px]:group-hover/card:opacity-100 min-[801px]:focus-visible:opacity-100"}`
      }
    >
      <button role="menuitem" type="button" className={menuItemClass} onClick={() => library.toggleLater(item.vid)}>
            <ClockIcon filled={saved} />
            {saved ? UNSAVE_LABEL : SAVE_LABEL}
          </button>
          <button
            role="menuitem"
            type="button"
            className={menuItemClass}
            onClick={() => {
              if (!hidden) onHide?.();
              library.toggleDislike(item.vid);
            }}
          >
            <HideIcon />
            {hidden ? "Undo not interested" : "Not interested"}
          </button>
          <a role="menuitem" className={menuItemClass} href={`https://www.youtube.com/watch?v=${item.vid}`} target="_blank" rel="noreferrer">
            <ExternalIcon />
            Open on YouTube
          </a>
    </ActionMenu>
  );
}

/**
 * Horizontal row: thumbnail on the left, text on the right. Used by search, playlists, and the
 * library pages. `action` replaces the three-dot menu, `children` renders under the channel.
 */
export function VideoRow({ item, action, children }: { item: FeedCard; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <article className="group/card relative flex min-w-0 gap-3 min-[801px]:gap-4">
      <div className="w-[40%] max-w-[360px] shrink-0">
        <Thumb item={item} />
      </div>
      <div className="min-w-0 flex-1 pr-9">
        <a href={watchHref(item.vid)} className="block rounded-md">
          <h2 className="line-clamp-2 wrap-anywhere text-sm font-medium leading-5 min-[801px]:text-lg min-[801px]:font-normal min-[801px]:leading-[26px]">{item.title}</h2>
        </a>
        <a href={channelHref(item.channelSlug)} className="mt-1 block truncate text-xs text-muted hover:text-foreground min-[801px]:mt-2">
          {item.channel}
        </a>
        {children}
      </div>
      <div className="absolute right-0 top-0">{action ?? <CardMenu item={item} className="relative" />}</div>
    </article>
  );
}

export function SearchList({ items }: { items: FeedCard[] }) {
  if (!items.length) return <EmptyState title="No results found" body="Try different keywords or remove filters" href="/" action="Go to Home" />;
  return (
    <ul className="flex max-w-[1100px] flex-col gap-4">
      {items.map((item) => (
        <li key={item.vid}>
          <VideoRow item={item}>
            {item.summary ? <p className="mt-2 line-clamp-2 hidden text-xs text-muted min-[720px]:block">{item.summary}</p> : null}
          </VideoRow>
        </li>
      ))}
    </ul>
  );
}

export function LaterButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/75 text-white press ${saved ? "" : "min-[801px]:opacity-0 min-[801px]:group-hover/thumb:opacity-100 min-[801px]:focus-visible:opacity-100"}`}
      aria-label={saved ? UNSAVE_LABEL : SAVE_LABEL}
      title={saved ? UNSAVE_LABEL : SAVE_LABEL}
      aria-pressed={saved}
      onClick={onToggle}
    >
      <ClockIcon filled={saved} />
    </button>
  );
}

export function RelatedRow({ item }: { item: FeedCard }) {
  return (
    <article className="group/card relative flex min-w-0 gap-2">
      <div className="w-[168px] shrink-0">
        <Thumb item={item} className="rounded-lg" />
      </div>
      <div className="min-w-0 flex-1 pr-7">
        <a href={watchHref(item.vid)} className="block rounded-md">
          <h2 className="line-clamp-2 wrap-anywhere text-sm font-medium leading-5">{item.title}</h2>
        </a>
        <a href={channelHref(item.channelSlug)} className="mt-1 block truncate text-xs text-muted hover:text-foreground">{item.channel}</a>
      </div>
      <CardMenu item={item} className="absolute -right-2 top-0" />
    </article>
  );
}

/** One empty state for every list: what happened, what to try, and a way out. */
export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {href && action ? (
        <a href={href} className="mt-4 inline-flex h-9 items-center rounded-full bg-chip-on px-4 text-sm font-medium text-chip-on-text press">
          {action}
        </a>
      ) : null}
    </div>
  );
}

export function VideoGrid({ items }: { items: FeedCard[] }) {
  if (!items.length) return <EmptyState title="No videos found" body="Try removing some filters" href="/" action="Go to Home" />;
  return (
    <ul className={gridClass}>
      {items.map((item) => (
        <li key={item.vid} className="min-w-0">
          <VideoCard item={item} />
        </li>
      ))}
    </ul>
  );
}
