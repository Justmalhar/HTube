import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { VideoGrid } from "@/components/video-card";
import { searchPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = await searchParams;
  const { record, q, page } = searchPage(search);
  return (
    <div>
      <PageHeader title={q ? q : "Search"} description="Titles, topics, and category words" />
      <form action="/search" className="mb-4 flex sm:hidden">
        <input name="q" defaultValue={q} aria-label="Search" className="h-10 min-w-0 flex-1 rounded-l-[20px] border border-line bg-background px-3" />
        <button className="h-10 rounded-r-[20px] bg-surface px-3" type="submit">Search</button>
      </form>
      {q ? <FilterBar path="/search" query={record} /> : null}
      {page.weak && page.items.length ? <p className="mb-3 text-sm text-muted">No strong title match. These are the closest talks.</p> : null}
      {q ? <VideoGrid items={page.items} /> : <p className="text-sm text-muted">Type a topic, a title, or a channel.</p>}
      {q ? <Pager path="/search" query={record} offset={page.offset} total={page.total} /> : null}
    </div>
  );
}
