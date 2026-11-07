import { AvatarRow } from "@/components/channel/avatar-row";
import { Section } from "@/components/section";
import { ChipRow } from "@/components/topic/chip-row";
import { readingClass } from "@/components/ui";
import { activeSpan, type ChannelRef } from "@/lib/channels";

export function ChannelAbout({ first, last, topics, curators, similar }: {
  first: number; last: number;
  topics: { id: string; name: string }[]; curators: { author: string; count: number }[]; similar: ChannelRef[];
}) {
  return (
    <div className={`mt-6 ${readingClass}`}>
      <Section title="Active on HN">
        <p className="text-sm tabular-nums">{activeSpan(first, last)}</p>
      </Section>
      {topics.length ? (
        <Section title="Topics">
          <ChipRow label="Topics" items={topics} />
        </Section>
      ) : null}
      {curators.length ? (
        <Section title="HN curators">
          <AvatarRow label="HN curators" items={curators.map((c) => ({ href: `/u/${encodeURIComponent(c.author)}`, name: c.author, title: `@${c.author}`, label: `${c.count} ${c.count === 1 ? "comment" : "comments"}` }))} />
        </Section>
      ) : null}
      {similar.length ? (
        <Section title="Similar channels">
          <AvatarRow label="Similar channels" items={similar.map((c) => ({ href: `/channel/${c.slug}`, name: c.name }))} />
        </Section>
      ) : null}
    </div>
  );
}
