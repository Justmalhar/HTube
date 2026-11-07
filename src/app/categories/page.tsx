import { PageHeader } from "@/components/page-header";
import { getEngine } from "@/lib/server-catalog";

export const dynamic = "force-dynamic";

export default function Categories() {
  const areas = getEngine().areas;
  return (
    <div>
      <PageHeader title="Categories" description="Browse by topic" />
      <div className="mb-4 flex flex-wrap gap-2">
        <a className="inline-flex h-8 items-center rounded-full bg-surface px-3 text-sm" href="/browse?sort=recent">Recent</a>
        <a className="inline-flex h-8 items-center rounded-full bg-surface px-3 text-sm" href="/browse?dur=xlong">Longs</a>
        <a className="inline-flex h-8 items-center rounded-full bg-surface px-3 text-sm" href="/browse?gems=insistent">Gems</a>
        <a className="inline-flex h-8 items-center rounded-full bg-surface px-3 text-sm" href="/browse">All</a>
      </div>
      <div className="flex flex-col gap-6">
        {areas.map((area) => (
          <section key={area.id}>
            <a href={`/a/${area.id}`} className="text-sm font-medium">{area.name}</a>
            <span className="ml-2 text-sm text-muted">{area.video_count}</span>
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[16px] bg-surface">
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
