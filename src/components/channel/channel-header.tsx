import { Avatar } from "@/components/channel/avatar";
import { IdentityHeader } from "@/components/identity-header";
import { SubscribeButton } from "@/components/subscribe-button";
import { pillClass } from "@/components/ui";

export function ChannelHeader({ slug, name, videos, comments, description }: { slug: string; name: string; videos: number; comments: number; description: string | null }) {
  return (
    <IdentityHeader
      avatar={<Avatar name={name} size="xl" />}
      title={name}
      stats={
        <>
          <span>{videos.toLocaleString("en-US")} {videos === 1 ? "video" : "videos"}</span>
          <span>{comments.toLocaleString("en-US")} HN comments</span>
        </>
      }
      description={description}
      actions={
        <>
          <SubscribeButton slug={slug} name={name} />
          <a className={pillClass} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">Find on YouTube</a>
        </>
      }
    />
  );
}
