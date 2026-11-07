import { PageHeader } from "@/components/page-header";
import { getManifest } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default function About() {
  const counts = getManifest().counts;
  return (
    <article className="max-w-3xl">
      <PageHeader title="About" description="HN recommendations, not watch time" />
      <p>
        OpenHackerTube is a catalogue of YouTube videos that Hacker News commenters kept recommending. Playback uses YouTube&apos;s privacy-enhanced embed. Nothing here hosts a video file.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        <li className="rounded-[12px] bg-surface p-3"><b>{counts.videos.toLocaleString("en-US")}</b><span className="mt-1 block text-sm text-muted">videos</span></li>
        <li className="rounded-[12px] bg-surface p-3"><b>{counts.mentions.toLocaleString("en-US")}</b><span className="mt-1 block text-sm text-muted">HN comments</span></li>
        <li className="rounded-[12px] bg-surface p-3"><b>{counts.categories}</b><span className="mt-1 block text-sm text-muted">topics in {counts.areas} areas</span></li>
        <li className="rounded-[12px] bg-surface p-3"><b>{counts.playlists}</b><span className="mt-1 block text-sm text-muted">playlists</span></li>
      </ul>
      <h2 className="mt-6 text-base font-medium">What is included</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        <li>Home mix of classics, recent favorites, insistent picks, and less visited topics.</li>
        <li>Likes, dislikes, watch later, and history stored only in this browser.</li>
        <li>Categories, areas, channels, and 27 ordered playlists.</li>
        <li>Search across titles, summaries, tags, and category descriptions.</li>
        <li>Hacker News comments and co-recommendations on each talk.</li>
      </ul>
      <h2 className="mt-6 text-base font-medium">What is not included</h2>
      <p className="mt-2 text-sm">
        YouTube durations, view counts, like counts, and upload dates are not in the shared catalogue, so Longs and view sorts cannot be filled without inventing them. Semantic embeddings were not in the delivered snapshot. Likes do not create an account.
      </p>
      <p className="mt-4 text-sm text-muted">
        Data is ODC-By 1.0. Credit HackerTube and the open-index/hacker-news dataset. Comments remain the work of their authors. This project is not affiliated with YouTube, Google, Hacker News, or Y Combinator.
      </p>
    </article>
  );
}
