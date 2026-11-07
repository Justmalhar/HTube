import { chipClass } from "@/components/ui";
import { notFound } from "next/navigation";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { browsePage } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default async function AreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const area = getEngine().areas.find((item) => item.id === id);
  if (!area) notFound();
  const search = await searchParams;
  const { record, page } = browsePage({ ...search, area: id });
  return (
    <div>
      <PageHeader title={area.name} description="In this area" />
      <div className="mb-4 flex flex-wrap gap-2">
        {area.categories.map((category) => (
          <a key={category.id} href={`/c/${category.id}`} className={chipClass}>{category.name}</a>
        ))}
      </div>
      <FilterBar path={`/a/${id}`} query={record} />
      <VideoGrid items={page.items} />
      <Pager path={`/a/${id}`} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
