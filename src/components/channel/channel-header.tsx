import { Avatar } from "@/components/channel/avatar";
import { SubscribeButton } from "@/components/subscribe-button";
import { pillClass } from "@/components/ui";

export function ChannelHeader({ slug, name, videos, comments, description }: { slug: string; name: string; videos: number; comments: number; description: string | null }) {
  return (
    <header className="flex min-w-0 items-center gap-4 min-[801px]:gap-6">
      <Avatar name={name} className="size-20 text-4xl min-[801px]:size-32 min-[801px]:text-6xl" />
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em] wrap-anywhere min-[801px]:text-4xl min-[801px]:leading-10">{name}</h1>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted tabular-nums">
          <span>{videos.toLocaleString("en-US")} {videos === 1 ? "video" : "videos"}</span>
          <span>{comments.toLocaleString("en-US")} HN comments</span>
        </p>
        {description ? <p className="mt-1 line-clamp-1 text-sm text-muted">{description}</p> : null}
        <div className="mt-3 hidden gap-2 min-[801px]:flex">
          <SubscribeButton slug={slug} name={name} />
          <a className={pillClass} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">Find on YouTube</a>
        </div>
      </div>
    </header>
  );
}

/** Phone variant: full-width actions under the header block. */
export function ChannelActions({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="mt-3 flex gap-2 *:flex-1 min-[801px]:hidden">
      <SubscribeButton slug={slug} name={name} />
      <a className={pillClass} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">Find on YouTube</a>
    </div>
  );
}
