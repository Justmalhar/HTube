import { buildFeed } from "@/lib/engine";
import { getEngine } from "@/lib/server-catalog";
import { VideoGrid } from "@/components/video-card";

export const dynamic = "force-dynamic";

const CHIPS = [
  { href: "/", label: "All", on: true },
  { href: "/browse?type=talk", label: "Talks" },
  { href: "/browse?type=lecture", label: "Lectures" },
  { href: "/browse?type=explainer", label: "Explainers" },
  { href: "/browse?type=documentary", label: "Documentaries" },
  { href: "/browse?type=demo", label: "Demos" },
  { href: "/browse?dur=xlong", label: "Longs" },
] as const;

export default function Home() {
  const engine = getEngine();
  const feed = buildFeed(engine, { likes: [], dislikes: [], seen: [], offset: 0, limit: 24 });
  const lead = feed.items.slice(0, 6);
  const rest = feed.items.slice(6);
  return (
    <div>
      <nav aria-label="Formats" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((chip) => (
          <a
            key={chip.label}
            href={chip.href}
            className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-sm ${"on" in chip && chip.on ? "bg-[var(--chip-on)] text-[var(--chip-on-text)]" : "bg-surface"}`}
          >
            {chip.label}
          </a>
        ))}
      </nav>
      <VideoGrid items={lead} />
      <nav aria-label="Areas" className="my-6 flex gap-2 overflow-x-auto pb-1">
        {engine.areas.map((area) => (
          <a key={area.id} href={`/a/${area.id}`} className="inline-flex h-8 shrink-0 items-center rounded-full bg-surface px-3 text-sm">
            {area.name}
          </a>
        ))}
      </nav>
      <VideoGrid items={rest} />
    </div>
  );
}
