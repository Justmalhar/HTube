import { AvatarRow } from "@/components/channel/avatar-row";
import { Section } from "@/components/section";
import type { ChannelRef } from "@/lib/channels";
import { videos } from "@/lib/format";

export function TopChannels({ channels }: { channels: ChannelRef[] }) {
  if (!channels.length) return null;
  return (
    <Section title="Top channels">
      <AvatarRow label="Top channels" items={channels.map((c) => ({ href: `/channel/${c.slug}`, name: c.name, label: videos(c.count) }))} />
    </Section>
  );
}
