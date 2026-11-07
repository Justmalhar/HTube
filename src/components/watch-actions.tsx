"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ClockIcon, ExternalIcon, HideIcon, MixIcon, MuteIcon, PauseIcon, PlayIcon, ShareIcon, ThumbDownIcon, ThumbUpIcon, VolumeIcon } from "@/components/icons";
import { useLibrary } from "@/components/library";
import { useSnackbar } from "@/components/snackbar";
import { UpNextCard, useAutoplay } from "@/components/up-next";
import { ActionMenu, menuItemClass } from "@/components/video-card";
import { isPlayerEnded, parsePlayerInfo, PLAYER_ORIGIN, playerCommand, seekTarget, watchAction, type PlayerInfo, type WatchAction } from "@/lib/player-message";
import { removeFromQueue, useQueue } from "@/lib/queue-store";

export type NextTarget = { vid: string; href: string; title: string };

/** True when a key press belongs to a text field, a menu or a dialog rather than the player. */
function ignoresKeys(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey || document.querySelector("dialog[open]")) return true;
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable=true], [role=menu], [role=slider]")) return true;
  // Space and Enter activate focused buttons and links; leave them alone.
  return event.key === " " && Boolean(target?.closest("button, a, summary"));
}

const bubbleIcon = (kind: "play" | "pause" | "mute" | "volume") =>
  ({ play: <PlayIcon />, pause: <PauseIcon />, mute: <MuteIcon />, volume: <VolumeIcon /> })[kind];

/**
 * `nexts` are the candidates autoplay and Shift+N move to (first one not marked "not for me"); the
 * queue always goes first. `prev` is the previous playlist item. `keep` is the list/mix query kept on links.
 * Key the Player by vid so state resets.
 */
export function Player({ vid, title, origin, nexts, prev, keep }: { vid: string; title: string; origin: string; nexts: NextTarget[]; prev?: string; keep: string }) {
  const library = useLibrary();
  const { markSeen, dislikes } = library;
  const router = useRouter();
  useEffect(() => {
    // markSeen reads the stored library itself and moves a re-watched id to the top of History.
    markSeen(vid);
    removeFromQueue(vid);
  }, [markSeen, vid]);
  const queue = useQueue().filter((item) => item.vid !== vid);
  const queued = queue[0];
  const next: { href: string; title: string } | undefined = queued
    ? { href: `/watch/${queued.vid}${keep ? `?${keep}` : ""}`, title: queued.title }
    : nexts.find((item) => !dislikes.includes(item.vid));
  const nextHref = next?.href;
  const [glow, setGlow] = useState(false);
  const [autoplay] = useAutoplay();
  const [ended, setEnded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const info = useRef<PlayerInfo>({});
  const [bubble, setBubble] = useState<{ id: number; label: string; kind?: "play" | "pause" | "mute" | "volume"; shown: boolean } | null>(null);
  const fade = useRef(0);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (isPlayerEnded(event.origin, event.data)) setEnded(true);
      const update = parsePlayerInfo(event.origin, event.data);
      if (update) info.current = { ...info.current, ...update };
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  useEffect(() => () => window.clearTimeout(fade.current), []);
  const send = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(playerCommand(func, args), PLAYER_ORIGIN);
  }, []);
  const flash = useCallback((label: string, kind?: "play" | "pause" | "mute" | "volume") => {
    window.clearTimeout(fade.current);
    setBubble({ id: Date.now(), label, kind, shown: true });
    // Hold briefly at full opacity, then let the 500ms CSS fade run.
    fade.current = window.setTimeout(() => setBubble((value) => (value ? { ...value, shown: false } : value)), 120);
  }, []);
  const run = useCallback(
    (action: WatchAction) => {
      const state = info.current;
      switch (action.type) {
        case "toggle": {
          const playing = state.playerState === 1;
          send(playing ? "pauseVideo" : "playVideo");
          info.current = { ...state, playerState: playing ? 2 : 1 };
          flash(playing ? "Paused" : "Playing", playing ? "pause" : "play");
          break;
        }
        case "seek":
        case "seekPercent": {
          const to = seekTarget(state.currentTime ?? 0, state.duration ?? 0, action);
          send("seekTo", [to, true]);
          info.current = { ...state, currentTime: to };
          flash(action.type === "seek" ? `${action.by > 0 ? "+" : "-"}${Math.abs(action.by)}` : `${action.percent}%`);
          break;
        }
        case "mute": {
          const muted = state.muted === true;
          send(muted ? "unMute" : "mute");
          info.current = { ...state, muted: !muted };
          flash(muted ? "Unmuted" : "Muted", muted ? "volume" : "mute");
          break;
        }
        case "fullscreen":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void box.current?.requestFullscreen?.();
          break;
        case "next":
          if (nextHref) router.push(nextHref);
          break;
        case "previous":
          if (prev) router.push(prev);
          break;
      }
    },
    [flash, nextHref, prev, router, send],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (ignoresKeys(event)) return;
      const action = watchAction(event.key, event.shiftKey);
      if (!action) return;
      event.preventDefault();
      run(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);
  const listen = () => {
    const target = frame.current?.contentWindow;
    target?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), PLAYER_ORIGIN);
    target?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), PLAYER_ORIGIN);
  };
  return (
    // isolate keeps the glow's -z-10 inside this box, under the player but above the page background.
    <div className="relative isolate -mx-4 min-[801px]:mx-0">
      {/* Ambient mode: a blurred copy of the thumbnail spills soft colour around the player.
          No scale transform: blur is ink overflow and never adds scroll width, a transform would. */}
      <img
        src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
        alt=""
        aria-hidden
        decoding="async"
        ref={(node) => {
          if (node?.complete && node.naturalWidth) setGlow(true);
        }}
        onLoad={() => setGlow(true)}
        className={`pointer-events-none absolute inset-0 -z-10 size-full object-cover blur-[80px] saturate-[1.4] transition-opacity duration-700 ease-out-quart motion-reduce:transition-none [@media(prefers-reduced-transparency:reduce)]:hidden ${glow ? "opacity-45 in-data-[theme=light]:opacity-25" : "opacity-0"}`}
      />
      <div ref={box} className="relative aspect-video overflow-hidden bg-black min-[801px]:rounded-xl">
        <iframe
          ref={frame}
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={listen}
        />
      {bubble ? (
        <div
          key={bubble.id}
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 z-10 grid min-w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 px-4 py-3 text-white tabular-nums backdrop-blur-sm ${bubble.shown ? "opacity-100" : "opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"}`}
        >
          {bubble.kind ? <span className="[&_svg]:size-7">{bubbleIcon(bubble.kind)}</span> : <span className="text-lg font-medium">{bubble.label}</span>}
        </div>
      ) : null}
      <span role="status" className="sr-only">{bubble?.label ?? ""}</span>
      {ended && autoplay && next ? <UpNextCard href={next.href} title={next.title} onCancel={() => setEnded(false)} /> : null}
      </div>
    </div>
  );
}


export function ActionBar({ vid, title }: { vid: string; title: string }) {
  const library = useLibrary();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const liked = library.likes.includes(vid);
  const disliked = library.dislikes.includes(vid);
  const saved = library.later.includes(vid);
  const share = async () => {
    const url = `${window.location.origin}/watch/${vid}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard needs a secure context and permission; fall back to the address bar.
      window.prompt("Copy this link", url);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };
  const snackbar = useSnackbar();
  const toggleDislike = () => {
    library.toggleDislike(vid);
    if (!disliked) snackbar.show("You won't see this as often", { label: "Undo", run: () => library.toggleDislike(vid) });
  };
  const pill = "press inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium";
  const off = "bg-surface hover:bg-surface-hover";
  const half = "press grid h-full w-12 place-items-center hover:bg-surface-hover";
  return (
    // The scroller holds the pills; the overflow menu sits outside it so its popover is never clipped.
    <div className="-mr-4 flex min-w-0 items-center gap-2 min-[1000px]:mr-0">
      <div className="no-scrollbar -ml-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 pl-4 min-[1000px]:ml-0 min-[1000px]:overflow-visible min-[1000px]:pl-0">
      <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-full bg-surface">
        <button type="button" className={half} aria-label={liked ? "Unlike" : "Like"} title="Like" aria-pressed={liked} onClick={() => library.toggleLike(vid)}>
          <ThumbUpIcon filled={liked} />
        </button>
        <span className="h-6 w-px bg-line" aria-hidden />
        <button type="button" className={half} aria-label="Not for me" title="Not for me" aria-pressed={disliked} onClick={toggleDislike}>
          <ThumbDownIcon filled={disliked} />
        </button>
      </div>
      <button type="button" className={`${pill} ${off}`} onClick={share}>
        <ShareIcon />
        {copied ? "Copied" : "Share"}
      </button>
      <button
        type="button"
        className={`${pill} ${saved ? "bg-chip-on text-chip-on-text" : off}`}
        aria-label={saved ? "Remove from Watch later" : "Save to Watch later"}
        title={saved ? "Remove from Watch later" : "Save to Watch later"}
        aria-pressed={saved}
        onClick={() => library.toggleLater(vid)}
      >
        <ClockIcon filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
      </div>
      <ActionMenu
        label="More actions"
        className="relative mr-4 shrink-0 min-[1000px]:mr-0"
        triggerClass={(open) => `press grid size-9 place-items-center rounded-full ${open ? "bg-surface-hover" : off}`}
      >
            <a role="menuitem" className={menuItemClass} href={`/watch/${vid}?mix=1`}>
              <MixIcon />
              Start mix
            </a>
            <button role="menuitem" type="button" className={menuItemClass} onClick={toggleDislike}>
              <HideIcon />
              {disliked ? "Undo not interested" : "Not interested"}
            </button>
            <a role="menuitem" className={menuItemClass} href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer">
              <ExternalIcon />
              Open on YouTube
            </a>
      </ActionMenu>
      <span role="status" className="sr-only">{copied ? "Link copied" : ""}</span>
      {snackbar.node}
    </div>
  );
}

/**
 * Description box: clamps to three lines with a "...more" toggle, like YouTube. The toggle only
 * appears when the text actually overflows. Chips stay visible below the text.
 */
export function Description({ meta, chips, children }: { meta: string; chips: React.ReactNode; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = body.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      if (!node.classList.contains("line-clamp-3")) return;
      setOverflows(node.scrollHeight > node.clientHeight + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="mt-3 rounded-xl bg-surface p-3 text-sm leading-5 wrap-break-word">
      <p className="font-medium">{meta}</p>
      <div ref={body} id="watch-description" className={`relative mt-1 *:mt-2 first:*:mt-0 ${expanded ? "" : "line-clamp-3"}`}>
        {children}
        {overflows && !expanded ? (
          <button
            type="button"
            className="press absolute bottom-0 right-0 bg-linear-to-r from-transparent to-surface to-30% pl-8 font-medium"
            aria-expanded={false}
            aria-controls="watch-description"
            onClick={() => setExpanded(true)}
          >
            ...more
          </button>
        ) : null}
      </div>
      {expanded ? (
        <button type="button" className="press mt-1 font-medium" aria-expanded aria-controls="watch-description" onClick={() => setExpanded(false)}>
          Show less
        </button>
      ) : null}
      {chips}
    </div>
  );
}
