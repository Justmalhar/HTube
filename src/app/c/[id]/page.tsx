import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { chipClass } from "@/components/ui";
import { VideoGrid } from "@/components/video-card";
import { areaForCategory } from "@/lib/engine";
import { browsePage, paramsRecord } from "@/lib/pages";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const category = getEngine().categories.get((await params).id);
  return category ? { title: category.name, description: category.description || undefined } : { title: "Not found" };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/c/[id]">) {
  const { id } = await params;
  const engine = getEngine();
  const category = engine.categories.get(id);
  if (!category) notFound();
  const area = areaForCategory(engine, id);
  const search = await searchParams;
  const { page } = browsePage({ ...search, category: id });
  // Links carry only what the viewer chose; the category lives in the path, not the query.
  const record = paramsRecord(search);
  const path = `/c/${id}`;
  return (
    <div>
      <PageHeader title={category.name} />
      {area ? (
        <a href={`/a/${area.id}`} className={`${chipClass} mb-2 max-w-full`}>
          <span className="truncate">Part of {area.name}</span>
        </a>
      ) : null}
      <FilterBar path={path} query={record} />
      <VideoGrid items={page.items} />
      <Pager path={path} query={record} offset={page.offset} total={page.total} />
    </div>
  );
}
