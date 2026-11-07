import { buildFeed } from "@/lib/engine";
import { getEngine } from "@/lib/server-catalog";
import { VideoGrid } from "@/components/video-card";

export const dynamic = "force-dynamic";

export default function Home() {
  const feed = buildFeed(getEngine(), { likes: [], dislikes: [], seen: [], offset: 0, limit: 24 });
  return <VideoGrid items={feed.items} />;
}
