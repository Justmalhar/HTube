"use client";

import { PageHeader } from "@/components/page-header";
import { useLibrary } from "@/components/library";

export default function Settings() {
  const library = useLibrary();
  return (
    <div>
      <PageHeader title="Settings" description="Private to this browser" />
      <label className="flex items-center justify-between gap-4 rounded-[12px] bg-surface px-3 py-3">
        <span>
          <span className="block font-medium">Middle frames</span>
          <span className="text-sm text-muted">Show a frame from the middle of the video instead of the uploader thumbnail.</span>
        </span>
        <input type="checkbox" checked={library.frames} onChange={(event) => library.setFrames(event.target.checked)} />
      </label>
    </div>
  );
}
