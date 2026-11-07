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
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://news.ycombinator.com/user?id=${encodeURIComponent(author)}`}
            target="_blank"
            rel="noreferrer"
            className="press hit inline-flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium hover:bg-surface-hover"
          >
            Hacker News
            <span className="[&_svg]:size-4"><ExternalIcon /></span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
