import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { browsePage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function Browse({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = await searchParams;
  const { record, page } = browsePage(search);
  const longs = record.dur === "xlong";
  return (
    <div>
      <PageHeader title={longs ? "Longs" : "Browse"} description={longs ? "Over an hour, when duration exists" : "Every talk in the catalogue"} />
      <FilterBar path="/browse" query={record} />
      <VideoGrid items={page.items} />
      <Pager path="/browse" query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
