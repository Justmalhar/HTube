"use client";

import { PauseIcon, PlayIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { ghostPillClass, listRowClass } from "@/components/ui";

const rowClass = `${listRowClass} w-full text-sm font-medium`;

/** YouTube-style side panel (top on phones): search, clear, pause. */
export function HistoryPanel({
  query,
  onQuery,
  paused,
  onPaused,
  onClear,
  canClear,
}: {
  query: string;
  onQuery: (value: string) => void;
  paused: boolean;
  onPaused: (value: boolean) => void;
  onClear: () => void;
  canClear: boolean;
}) {
  return (
    <aside className="flex flex-col gap-2 rounded-2xl bg-surface p-4 min-[801px]:sticky min-[801px]:top-20 min-[801px]:w-[340px] min-[801px]:shrink-0 min-[801px]:self-start">
      <label className="flex h-10 items-center gap-2 rounded-full border border-line bg-background pl-3 pr-2 focus-within:border-focus">
        <span className="text-muted"><SearchIcon /></span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search watch history"
          aria-label="Search watch history"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </label>
      <button type="button" className={`${rowClass} disabled:opacity-50`} disabled={!canClear} onClick={onClear}>
        <TrashIcon />
        Clear all watch history
      </button>
      <button type="button" className={rowClass} onClick={() => onPaused(!paused)}>
        {paused ? <PlayIcon /> : <PauseIcon />}
        {paused ? "Turn on watch history" : "Pause watch history"}
      </button>
    </aside>
  );
}

export function PausedBanner({ onTurnOn }: { onTurnOn: () => void }) {
  return (
    <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-muted">
      <span>Watch history is paused</span>
      <button type="button" className={`${ghostPillClass} text-foreground`} onClick={onTurnOn}>
        Turn on
      </button>
    </div>
  );
}
