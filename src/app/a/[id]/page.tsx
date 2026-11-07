import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { chipClass } from "@/components/ui";
import { VideoGrid } from "@/components/video-card";
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
      <nav aria-label="Topics in this area" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 min-[801px]:mx-0 min-[801px]:flex-wrap min-[801px]:px-0">
        {area.categories.map((category) => (
          <a key={category.id} href={`/c/${category.id}`} className={chipClass}>{category.name}</a>
        ))}
      </nav>
      <FilterBar path={path} query={record} />
      <VideoGrid items={page.items} />
      <Pager path={path} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
