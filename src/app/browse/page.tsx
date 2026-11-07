import type { Metadata } from "next";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { browsePage } from "@/lib/pages";

export const dynamic = "force-dynamic";

const isLongs = (dur: string | string[] | undefined) => dur === "xlong";

export async function generateMetadata({ searchParams }: PageProps<"/browse">): Promise<Metadata> {
  return { title: isLongs((await searchParams).dur) ? "Longs" : "Browse" };
}

export default async function Browse({ searchParams }: PageProps<"/browse">) {
  const search = await searchParams;
  const { record, page } = browsePage(search);
  const longs = isLongs(record.dur);
  return (
    <div>
      <PageHeader
        title={longs ? "Longs" : "Browse"}
      />
      <FilterBar path="/browse" query={record} />
      <VideoGrid items={page.items} />
      <Pager path="/browse" query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
