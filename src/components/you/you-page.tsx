"use client";

import Link from "next/link";

import { ChevronIcon, GearIcon, LaterIcon, LikeIcon, PlayIcon } from "@/components/icons";
import { useHydrated, useLibrary } from "@/components/library";
import { CardShelf, Shelf } from "@/components/shelf";
import { Section } from "@/components/section";
import { listRowClass, sectionGapClass, tileWidth } from "@/components/ui";
import { Avatar } from "@/components/channel/avatar";
import { AvatarRow } from "@/components/channel/avatar-row";
import { IdentityHeader } from "@/components/identity-header";
import { EmptyState } from "@/components/video-card";
import { useYouData } from "@/components/you/use-you-data";
import { videos } from "@/lib/format";

function ListTile({ href, label, Icon, count }: { href: string; label: string; Icon: typeof LaterIcon; count: number }) {
  return (
    <li className={tileWidth}>
      <Link href={href} prefetch={false} className="press block">
        <span className="relative grid aspect-video place-items-center rounded-xl bg-surface">
          <Icon />
          <span className="absolute bottom-2 right-2 inline-flex h-6 items-center gap-1 rounded-md bg-black/80 px-1.5 text-xs font-medium text-white">
            <PlayIcon />
            {videos(count)}
          </span>
        </span>
        <span className="mt-3 block text-base font-medium leading-[22px]">{label}</span>
        <span className="mt-1 block text-sm text-muted">Private</span>
      </Link>
    </li>
  );
}

export function YouPage() {
  const library = useLibrary();
  const ready = useHydrated();
  const history = [...library.seen].reverse();
  const { cards, channels, SHELF } = useYouData(history.slice(0, 12), library.later.slice(0, 12), library.likes.slice(0, 12), library.subs);

  const pick = (ids: string[]) => ids.slice(0, SHELF).flatMap((id) => cards[id] ?? []);

  if (!ready) return null;
  const empty = !history.length && !library.later.length && !library.likes.length && !library.subs.length;

  return (
    <div>
      <IdentityHeader avatar={<Avatar name="You" size="xl" />} title="You" />

      {empty ? (
        <div className={sectionGapClass}>
          <EmptyState title="Enjoy your favourite videos" body="Videos you watch, save and like appear here" href="/" action="Go to Home" />
        </div>
      ) : (
        <>
          <CardShelf title="History" href="/history" items={pick(history)} />
          <CardShelf title="Watch later" href="/later" items={pick(library.later)} />
          <CardShelf title="Liked videos" href="/liked" items={pick(library.likes)} />
          {channels.length ? (
            <Section title="Subscriptions" href="/subscriptions">
              <AvatarRow label="Subscribed channels" items={channels.map((channel) => ({ href: `/channel/${channel.slug}`, name: channel.name }))} />
            </Section>
          ) : null}
          {library.later.length || library.likes.length ? (
            <Shelf title="Playlists">
              {library.later.length ? <ListTile href="/later" label="Watch later" Icon={LaterIcon} count={library.later.length} /> : null}
              {library.likes.length ? <ListTile href="/liked" label="Liked videos" Icon={LikeIcon} count={library.likes.length} /> : null}
            </Shelf>
          ) : null}
        </>
      )}

      <Link href="/settings" className={`${listRowClass} ${sectionGapClass}`}>
        <GearIcon />
        <span className="flex-1 text-base">Settings</span>
        <ChevronIcon />
      </Link>
    </div>
  );
}
