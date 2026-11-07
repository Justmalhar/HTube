import { gridClass } from "@/components/ui";

// Route-level fallback so a nav click swaps to this instantly while the next page renders.
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="motion-safe:animate-pulse">
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-7 w-48 rounded-lg bg-surface" />
        <div className="h-4 w-64 max-w-full rounded bg-surface" />
      </div>
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="aspect-video rounded-xl bg-surface" />
            <div className="h-4 w-11/12 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
