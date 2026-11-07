import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { getManifest } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const counts = getManifest().counts;
  return (
    <article className="max-w-3xl">
      <PageHeader title="About" />
      <p>HTube collects the YouTube videos Hacker News commenters recommend most.</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 tabular-nums">
        <li className="rounded-xl bg-surface p-3"><b>{counts.videos.toLocaleString("en-US")}</b><span className="mt-1 block text-sm text-muted">videos</span></li>
        <li className="rounded-xl bg-surface p-3"><b>{counts.mentions.toLocaleString("en-US")}</b><span className="mt-1 block text-sm text-muted">HN comments</span></li>
        <li className="rounded-xl bg-surface p-3"><b>{counts.categories}</b><span className="mt-1 block text-sm text-muted">topics</span></li>
        <li className="rounded-xl bg-surface p-3"><b>{counts.playlists}</b><span className="mt-1 block text-sm text-muted">playlists</span></li>
      </ul>
      <p className="mt-6 text-sm text-muted">Not affiliated with YouTube, Google, Hacker News, or Y Combinator</p>
    </article>
  );
}
