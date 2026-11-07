"use client";

import { PageHeader } from "@/components/page-header";
import { useLibrary } from "@/components/library";

export default function Settings() {
  const library = useLibrary();
  return (
    <div>
      <PageHeader title="Settings" description="On this browser" />
      <label className="flex items-center justify-between gap-4 rounded-[12px] bg-surface px-3 py-3">
        <span>
          <span className="block text-sm font-medium">Middle frames</span>
          <span className="text-sm text-muted">A frame from the middle, not the poster</span>
        </span>
        <input type="checkbox" checked={library.frames} onChange={(event) => library.setFrames(event.target.checked)} />
      </label>
      <p className="mt-6 text-sm text-muted">
        Credit <a className="underline" href="https://hackertube.org">HackerTube</a> and open-index/hacker-news. Comments stay with their authors.
      </p>
    </div>
  );
}
