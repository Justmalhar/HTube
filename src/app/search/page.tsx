import type { Metadata } from "next";

import { FilterBar, Pager } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { EmptyState, SearchList } from "@/components/video-card";
import { searchPage } from "@/lib/pages";
import { first } from "@/lib/query";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = first((await searchParams).q).trim();
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const search = await searchParams;
  const { record, q, page } = searchPage(search);
  return (
    <div>
      <PageHeader
        title="Search"
      />
      {/* The top bar hides its search field under 640px, so phones search from here. */}
      <form action="/search" role="search" className="mb-4 flex sm:hidden">
        <input
          name="q"
          type="search"
          defaultValue={q}
          aria-label="Search"
          placeholder="Search"
          enterKeyHint="search"
          className="h-10 min-w-0 flex-1 rounded-l-full border border-line bg-background px-4 placeholder:text-muted"
        />
        <button className="press h-10 shrink-0 rounded-r-full bg-surface px-4 text-sm font-medium hover:bg-surface-hover" type="submit">Search</button>
      </form>
      {q ? <FilterBar path="/search" query={record} /> : null}
      {q ? (
        <SearchList items={page.items} />
      ) : (
        <EmptyState title="Search for videos" body="Try a topic, title, or channel" href="/categories" action="Browse categories" />
      )}
      {q ? <Pager path="/search" query={record} offset={page.offset} total={page.total} /> : null}
    </div>
  );
}
