import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Comment } from "@/components/comments";
import { isAuthor } from "@/components/profile/author";
import { ProfileHeader } from "@/components/profile/profile-header";
import { VideoGrid } from "@/components/video-card";
import { sortMentions } from "@/lib/comment-format";
import { getAuthorMentions, getEngine } from "@/lib/server-catalog";
import type { FeedCard } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/u/[author]">): Promise<Metadata> {
  const { author } = await params;
  return { title: isAuthor(author) ? `@${author}` : "Not found" };
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/u/[author]">) {
  const { author } = await params;
  if (!isAuthor(author)) notFound();
  const mentions = getAuthorMentions(author);
  if (!mentions.length) notFound();
  const tab = (await searchParams).tab === "comments" ? "comments" : "videos";
  const base = `/u/${author}`;
  const tabs = [
    { href: base, label: "Videos", on: tab === "videos" },
    { href: `${base}?tab=comments`, label: "Comments", on: tab === "comments" },
  ];
  return (
    <div>
      <ProfileHeader author={author} count={mentions.length} months={mentions.map((m) => m.month)} />
      <nav aria-label="Profile" className="no-scrollbar mt-6 mb-6 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.on ? "page" : undefined}
            className={`press h-12 shrink-0 border-b-2 pt-3 text-base font-medium ${item.on ? "border-foreground" : "border-transparent text-muted hover:border-muted hover:text-foreground"}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      {tab === "videos" ? (
        <VideoGrid items={videosFor(mentions)} />
      ) : (
        <ul className="flex max-w-3xl flex-col gap-6 pb-2">
          {sortMentions(mentions, "top").map((m) => (
            <Comment key={m.hn_comment_id} mention={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

const TIERS = ["strong_rec", "rec", "reference", "critical", "joke"];

/** One card per video, strongest stance first, then score. */
function videosFor(mentions: ReturnType<typeof getAuthorMentions>): FeedCard[] {
  const { byId } = getEngine();
  const tier = new Map<string, number>();
  for (const m of mentions) {
    const t = TIERS.indexOf(m.stance);
    tier.set(m.vid, Math.min(tier.get(m.vid) ?? 9, t < 0 ? 9 : t));
  }
  return [...tier.keys()]
    .flatMap((vid) => byId.get(vid) ?? [])
    .sort((a, b) => tier.get(a.vid)! - tier.get(b.vid)! || b.score - a.score);
}
