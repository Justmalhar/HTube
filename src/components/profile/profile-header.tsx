import { Avatar } from "@/components/channel/avatar";
import { IdentityHeader } from "@/components/identity-header";
import { ExternalIcon } from "@/components/icons";
import { activeSpan } from "@/components/profile/author";
import { pillClass } from "@/components/ui";

export function ProfileHeader({ author, videos, comments, months }: { author: string; videos: number; comments: number; months: string[] }) {
  return (
    <IdentityHeader
      avatar={<Avatar name={author} size="xl" />}
      title={`@${author}`}
      stats={
        <>
          <span>{videos.toLocaleString("en-US")} {videos === 1 ? "video" : "videos"}</span>
          <span>{comments.toLocaleString("en-US")} {comments === 1 ? "comment" : "comments"}</span>
          <span>{activeSpan(months)}</span>
        </>
      }
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
