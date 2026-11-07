import { PageHeader } from "@/components/page-header";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default function Categories() {
  const areas = getEngine().areas;
  return (
    <div>
      <PageHeader title="Categories" description="16 areas, 150 topics" />
      <div className="mb-4 flex flex-wrap gap-2">
        <a className="h-8 rounded-[8px] bg-surface px-3 leading-8" href="/browse?sort=recent">Recently recommended</a>
        <a className="h-8 rounded-[8px] bg-surface px-3 leading-8" href="/browse?dur=xlong">Longs</a>
        <a className="h-8 rounded-[8px] bg-surface px-3 leading-8" href="/browse?gems=insistent">Hidden gems</a>
        <a className="h-8 rounded-[8px] bg-surface px-3 leading-8" href="/browse">All videos</a>
      </div>
      <div className="flex flex-col gap-6">
        {areas.map((area) => (
          <section key={area.id}>
            <a href={`/a/${area.id}`} className="text-sm font-medium">{area.name}</a>
            <span className="ml-2 text-sm text-muted">{area.video_count}</span>
            <ul className="mt-2 divide-y divide-line rounded-[12px] bg-surface">
              {area.categories.map((category) => (
                <li key={category.id}>
                  <a href={`/c/${category.id}`} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span>{category.name}</span>
                    <span className="text-sm text-muted">{category.video_count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
