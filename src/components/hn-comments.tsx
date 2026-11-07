"use client";

import { useState } from "react";

import type { Mention } from "@/lib/types";
import { ExternalIcon } from "@/components/icons";
import { chipClass, chipOnClass } from "@/components/ui";

const STANCE: Record<string, { label: string; rank: number }> = {
  strong_rec: { label: "Strongly recommends", rank: 0 },
  rec: { label: "Recommends", rank: 1 },
  reference: { label: "Cites", rank: 2 },
  critical: { label: "Critical", rank: 3 },
  joke: { label: "Joke", rank: 4 },
};

const PAGE = 10;

type Sort = "top" | "new";

export function HnComments({ mentions }: { mentions: Mention[] }) {
  const [sort, setSort] = useState<Sort>("top");
  const [shown, setShown] = useState(PAGE);
  const sorted = [...mentions].sort((a, b) =>
    sort === "new"
      ? b.month.localeCompare(a.month)
      : (STANCE[a.stance]?.rank ?? 9) - (STANCE[b.stance]?.rank ?? 9) || b.month.localeCompare(a.month),
  );
  return (
    <section className="mt-6" aria-labelledby="comments-title">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <h2 id="comments-title" className="text-xl font-bold">
          {mentions.length} Hacker News {mentions.length === 1 ? "comment" : "comments"}
        </h2>
        <div className="flex gap-2" role="group" aria-label="Sort comments">
          {(["top", "new"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              className={sort === value ? chipOnClass : chipClass}
              onClick={() => {
                setSort(value);
                setShown(PAGE);
              }}
            >
              {value === "top" ? "Top" : "Newest"}
            </button>
          ))}
        </div>
      </div>
      {mentions.length ? (
        <ul className="mt-6 flex flex-col gap-6">
          {sorted.slice(0, shown).map((mention) => (
            <li key={mention.hn_comment_id}>
              <Comment mention={mention} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted">No comments in this snapshot</p>
      )}
      {shown < sorted.length ? (
        <button
          type="button"
          className="mt-6 inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-primary hover:bg-primary/10"
          onClick={() => setShown((value) => value + PAGE)}
        >
          Show {Math.min(PAGE, sorted.length - shown)} more
        </button>
      ) : null}
    </section>
  );
}

function Comment({ mention }: { mention: Mention }) {
  const [open, setOpen] = useState(false);
  const long = mention.text.length > 420;
  const stance = STANCE[mention.stance]?.label ?? mention.stance;
  return (
    <article className="flex gap-4">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-base font-medium text-muted">
        {mention.author.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
          <a className="font-medium hover:underline" href={`https://news.ycombinator.com/user?id=${encodeURIComponent(mention.author)}`} target="_blank" rel="noreferrer">
            @{mention.author}
          </a>
          <span className="text-muted">{formatMonth(mention.month)}</span>
        </p>
        <div className={`mt-1 text-sm leading-5 ${long && !open ? "line-clamp-4" : ""}`}>
          <CommentText text={mention.text} />
        </div>
        {long ? (
          <button type="button" className="mt-1 text-sm font-medium text-muted hover:text-foreground" onClick={() => setOpen((value) => !value)}>
            {open ? "Show less" : "Read more"}
          </button>
        ) : null}
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${mention.stance === "strong_rec" ? "bg-primary/15 text-primary" : "bg-surface"}`}>
            {stance}
          </span>
          <a className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-surface" href={mention.hn_url} target="_blank" rel="noreferrer">
            <span className="[&>svg]:size-4"><ExternalIcon /></span>
            View on HN
          </a>
        </div>
        {mention.story_title ? <p className="mt-1 truncate text-xs text-muted">In {mention.story_title}</p> : null}
      </div>
    </article>
  );
}

function CommentText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, index) => {
        const quoted = block.startsWith(">");
        return (
          <p key={index} className={`${index ? "mt-2" : ""} whitespace-pre-wrap break-words ${quoted ? "rounded-lg bg-surface px-3 py-2 text-muted" : ""}`}>
            {quoted ? block.replace(/^>\s?/gm, "") : block}
          </p>
        );
      })}
    </>
  );
}

function formatMonth(month: string) {
  const [year, value] = month.split("-");
  const date = new Date(Number(year), Number(value) - 1, 1);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
