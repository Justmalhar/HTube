import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { listRowClass, readingClass } from "@/components/ui";
import { getManifest } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const counts = getManifest().counts;
  return (
    <article className={readingClass}>
      <PageHeader title="About" />
      <p>HTube collects the YouTube videos Hacker News commenters recommend most.</p>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl bg-surface tabular-nums">
        <li className={`${listRowClass} justify-between rounded-none px-4`}><span className="text-muted">videos</span><b>{counts.videos.toLocaleString("en-US")}</b></li>
        <li className={`${listRowClass} justify-between rounded-none px-4`}><span className="text-muted">HN comments</span><b>{counts.mentions.toLocaleString("en-US")}</b></li>
        <li className={`${listRowClass} justify-between rounded-none px-4`}><span className="text-muted">topics</span><b>{counts.categories}</b></li>
        <li className={`${listRowClass} justify-between rounded-none px-4`}><span className="text-muted">playlists</span><b>{counts.playlists}</b></li>
      </ul>
      <p className="mt-6 text-sm text-muted">Not affiliated with YouTube, Google, Hacker News, or Y Combinator</p>
    </article>
  );
}
