import { AvatarRow } from "@/components/channel/avatar-row";
import { videos } from "@/components/shelf";
import type { ChannelRef } from "@/lib/channels";

export function TopChannels({ channels }: { channels: ChannelRef[] }) {
  return <AvatarRow label="Top channels" size="size-14 text-xl" items={channels.map((c) => ({ href: `/channel/${c.slug}`, name: c.name, label: videos(c.count) }))} />;
}
