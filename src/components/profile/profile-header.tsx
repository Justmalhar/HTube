import { Avatar } from "@/components/channel/avatar";
import { IdentityHeader } from "@/components/identity-header";
import { ExternalIcon } from "@/components/icons";
import { activeSpan } from "@/components/profile/author";
import { pillClass } from "@/components/ui";

export function ProfileHeader({ author, count, months }: { author: string; count: number; months: string[] }) {
  return (
    <IdentityHeader
      avatar={<Avatar name={author} size="xl" />}
      title={`@${author}`}
      stats={<span>{count.toLocaleString("en-US")} {count === 1 ? "recommendation" : "recommendations"}, {activeSpan(months)}</span>}
      actions={
        <a href={`https://news.ycombinator.com/user?id=${encodeURIComponent(author)}`} target="_blank" rel="noreferrer" className={pillClass}>
          Hacker News
          <span className="[&_svg]:size-4"><ExternalIcon /></span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      }
    />
  );
}
