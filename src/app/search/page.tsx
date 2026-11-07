import type { Metadata } from "next";

import { SearchBox } from "@/components/search-box";
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
      <SearchBox id="page-search" defaultValue={q} className="mb-4 flex sm:hidden" />
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
