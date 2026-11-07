import type { Metadata } from "next";
import Link from "next/link";

import { SearchIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { pillClass } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <LogoMark size={72} className="opacity-90" />
      <h1 className="mt-6 text-xl font-bold leading-7 tracking-[-0.01em] text-balance">This page isn&apos;t available</h1>
      <p className="mt-2 text-sm text-muted">Sorry about that. Try searching for something else</p>
      <form action="/search" role="search" className="mt-6 flex w-full sm:hidden">
        <label className="sr-only" htmlFor="not-found-search">Search</label>
        <input
          id="not-found-search"
          name="q"
          type="search"
          placeholder="Search"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-l-full border border-line bg-background px-4 text-base outline-none placeholder:text-muted focus:border-focus"
        />
        <button type="submit" aria-label="Search" className="press grid h-10 w-16 place-items-center rounded-r-full border border-l-0 border-line bg-surface hover:bg-surface-hover">
          <SearchIcon />
        </button>
      </form>
      <Link href="/" className={`${pillClass} mt-4`}>Go to Home</Link>
    </div>
  );
}
