"use client";

import { useEffect, useRef, useState } from "react";

import { ExternalIcon, SortIcon, ThumbUpIcon } from "@/components/icons";
import { ActionMenu, menuItemClass } from "@/components/video-card";
import { avatarColor, relativeMonth, sortMentions, tokenize } from "@/lib/comment-format";
import type { Mention } from "@/lib/types";

const STANCE: Record<string, string> = {
  strong_rec: "Strongly recommends",
  rec: "Recommends",
  reference: "Cites",
  joke: "Joke",
  critical: "Critical",
};

const ORDERS = [
  { id: "top", label: "Top comments" },
  { id: "newest", label: "Newest first" },
] as const;

// ponytail: no "Show more comments" pill; the importer caps mentions at 20 per video. Add one if that cap moves.
export function Comments({ mentions }: { mentions: Mention[] }) {
  const [order, setOrder] = useState<"top" | "newest">("top");
  const list = sortMentions(mentions, order);
  return (
    <section className="mt-6" aria-labelledby="comments-title">
      <div className="flex items-center gap-6">
        <h2 id="comments-title" className="text-xl font-bold tabular-nums">
          {mentions.length.toLocaleString("en-US")} {mentions.length === 1 ? "Comment" : "Comments"}
        </h2>
        {mentions.length > 1 ? (
          <ActionMenu
            label="Sort by"
            className="relative"
            align="left"
            trigger={
              <>
                <SortIcon />
                Sort by
              </>
            }
            triggerClass={(open) => `press inline-flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium hover:bg-surface ${open ? "bg-surface" : ""}`}
          >
            {ORDERS.map((item) => (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                aria-current={order === item.id ? "true" : undefined}
                className={`${menuItemClass} ${order === item.id ? "bg-surface-hover font-medium" : ""}`}
                onClick={() => setOrder(item.id)}
              >
                {item.label}
              </button>
            ))}
          </ActionMenu>
        ) : null}
      </div>
      <ul className="mt-6 flex flex-col gap-6 pb-2">
        {list.map((mention) => (
          <Comment key={mention.hn_comment_id} mention={mention} />
        ))}
      </ul>
    </section>
  );
}

function Comment({ mention }: { mention: Mention }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const node = body.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      if (!node.classList.contains("line-clamp-4")) return;
      setOverflows(node.scrollHeight > node.clientHeight + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const bodyId = `comment-${mention.hn_comment_id}`;
  const recommends = mention.stance === "rec" || mention.stance === "strong_rec";
  return (
    <li className="group/comment flex min-w-0 gap-3 sm:gap-4">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-medium text-white uppercase select-none sm:size-10 sm:text-base"
        style={{ backgroundColor: avatarColor(mention.author) }}
      >
        {mention.author.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-baseline gap-1">
          <span className="min-w-0 truncate text-[13px] font-medium">@{mention.author}</span>
          <time
            dateTime={mention.month}
            title={mention.month}
            suppressHydrationWarning
            className="shrink-0 text-xs text-muted"
          >
            {relativeMonth(mention.month)}
          </time>
        </p>
        <p ref={body} id={bodyId} className={`mt-0.5 text-sm leading-5 wrap-anywhere ${expanded ? "" : "line-clamp-4"}`}>
          {tokenize(mention.text).map((part, i) =>
            part.chip ? (
              <span key={i} className="mx-px inline-flex h-[18px] items-center rounded bg-surface px-1.5 align-[1px] text-[11px] leading-none font-medium text-muted">
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </p>
        {overflows ? (
          <button
            type="button"
            className="press mt-1 text-sm font-medium"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
        <p className="mt-2 flex min-w-0 items-center gap-3 text-xs text-muted">
          <span className="inline-flex shrink-0 items-center gap-1.5 font-medium [&_svg]:size-4">
            {recommends ? <ThumbUpIcon filled={mention.stance === "strong_rec"} /> : null}
            {STANCE[mention.stance] ?? mention.stance}
          </span>
          <span className="min-w-0 truncate">in {mention.story_title}</span>
        </p>
      </div>
      <a
        href={mention.hn_url}
        target="_blank"
        rel="noreferrer"
        aria-label="View on Hacker News"
        title="View on Hacker News"
        className="press -mt-2 grid size-9 shrink-0 place-items-center rounded-full transition-opacity hover:bg-surface [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/comment:opacity-100 [@media(hover:hover)]:group-focus-within/comment:opacity-100"
      >
        <ExternalIcon />
      </a>
    </li>
  );
}
