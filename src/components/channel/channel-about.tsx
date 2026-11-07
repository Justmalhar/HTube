import { Avatar } from "@/components/channel/avatar";
import { AvatarRow } from "@/components/channel/avatar-row";
import { ChipRow } from "@/components/topic/chip-row";
import { activeSpan, type ChannelRef } from "@/lib/channels";

const h = "mb-3 text-base font-bold";

export function ChannelAbout({ first, last, topics, curators, similar }: {
  first: number; last: number;
  topics: { id: string; name: string }[]; curators: { author: string; count: number }[]; similar: ChannelRef[];
}) {
  return (
    <div className="mt-6 max-w-3xl space-y-8">
      <section>
        <h2 className={h}>Active on HN</h2>
        <p className="text-sm tabular-nums">{activeSpan(first, last)}</p>
      </section>
      {topics.length ? (
        <section>
          <h2 className={h}>Topics</h2>
          <ChipRow label="Topics" items={topics} />
        </section>
      ) : null}
      {curators.length ? (
        <section>
          <h2 className={h}>HN curators</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {curators.map((c) => (
              <li key={c.author} className="min-w-0">
                <a href={`/u/${encodeURIComponent(c.author)}`} className="press flex items-center gap-2 hover:underline">
                  <Avatar name={c.author} className="size-8 text-sm" />
                  <span className="truncate text-sm font-medium">@{c.author}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {similar.length ? (
        <section>
          <h2 className={h}>Similar channels</h2>
          <AvatarRow label="Similar channels" size="size-16 text-2xl" items={similar.map((c) => ({ href: `/channel/${c.slug}`, name: c.name }))} />
        </section>
      ) : null}
    </div>
  );
}
