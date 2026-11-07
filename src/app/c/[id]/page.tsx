import { notFound } from "next/navigation";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { areaForCategory } from "@/lib/engine";
import { browsePage } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const engine = getEngine();
  const category = engine.categories.get(id);
  if (!category) notFound();
  const area = areaForCategory(engine, id);
  const search = await searchParams;
  const { record, page } = browsePage({ ...search, category: id });
  return (
    <div>
      <PageHeader title={category.name} description={area?.name ?? "Topic"} />
      <p className="mb-4 max-w-3xl text-sm text-muted">{category.description}</p>
      <FilterBar path={`/c/${id}`} query={record} />
      <VideoGrid items={page.items} />
      <Pager path={`/c/${id}`} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
