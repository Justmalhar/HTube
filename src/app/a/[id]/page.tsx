import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { ChipRow } from "@/components/topic/chip-row";
import { TopChannels } from "@/components/topic/top-channels";
import { VideoGrid } from "@/components/video-card";
import { topChannelsInArea } from "@/lib/channels";
import { browsePage, paramsRecord } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

const findArea = (id: string) => getEngine().areas.find((item) => item.id === id);

export async function generateMetadata({ params }: PageProps<"/a/[id]">): Promise<Metadata> {
  const area = findArea((await params).id);
  return { title: area?.name ?? "Not found" };
}

export default async function AreaPage({ params, searchParams }: PageProps<"/a/[id]">) {
  const { id } = await params;
  const area = findArea(id);
  if (!area) notFound();
  const search = await searchParams;
  const { page } = browsePage({ ...search, area: id });
  // Links carry only what the viewer chose; the area lives in the path, not the query.
  const record = paramsRecord(search);
  const path = `/a/${id}`;
  return (
    <div>
      <PageHeader title={area.name} />
      <ChipRow label="Topics in this area" items={area.categories} />
      <TopChannels channels={topChannelsInArea(getEngine(), id)} />
      <FilterBar path={path} query={record} />
      <VideoGrid items={page.items} />
      <Pager path={path} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
