import { ExternalIcon } from "@/components/icons";
import { activeSpan } from "@/components/profile/author";
import { avatarColor } from "@/lib/comment-format";

export function ProfileHeader({ author, count, months }: { author: string; count: number; months: string[] }) {
  return (
    <header className="flex min-w-0 items-center gap-4 sm:gap-6">
      <span
        aria-hidden="true"
        className="grid size-20 shrink-0 place-items-center rounded-full text-4xl font-medium text-white uppercase select-none sm:size-32 sm:text-6xl"
        style={{ backgroundColor: avatarColor(author) }}
      >
        {author.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl leading-8 font-bold sm:text-4xl sm:leading-10">@{author}</h1>
        <p className="mt-1 text-sm text-muted tabular-nums wrap-anywhere">
          {count.toLocaleString("en-US")} {count === 1 ? "recommendation" : "recommendations"}, {activeSpan(months)}
        </p>
        <a
          href={`https://news.ycombinator.com/user?id=${encodeURIComponent(author)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="View on Hacker News"
          title="View on Hacker News"
          className="press mt-3 -ml-2 grid size-9 place-items-center rounded-full hover:bg-surface"
        >
          <ExternalIcon />
        </a>
      </div>
    </header>
  );
}
