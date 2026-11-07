import { notFound } from "next/navigation";

import { Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { browsePage } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const known = getEngine().cards.some((card) => card.channelSlug === slug);
  if (!known) notFound();
  const name = getEngine().cards.find((card) => card.channelSlug === slug)?.channel ?? slug;
  const search = await searchParams;
  const { record, page } = browsePage({ ...search, channel: slug, news: "show", cited: "show" });
  return (
    <div>
      <PageHeader title={name} description="From this channel" />
      <VideoGrid items={page.items} />
      <Pager path={`/channel/${slug}`} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
