"use client";

import Link from "next/link";

import { ChevronIcon, GearIcon, LaterIcon, LikeIcon, PlayIcon } from "@/components/icons";
import { useHydrated, useLibrary } from "@/components/library";
import { Shelf, videos } from "@/components/shelf";
import { EmptyState, VideoCard } from "@/components/video-card";
import { useYouData } from "@/components/you/use-you-data";
import { avatarColor } from "@/lib/comment-format";
import type { FeedCard } from "@/lib/types";

const tile = "w-[240px] shrink-0 snap-start min-[801px]:w-[280px]";

function CardShelf({ title, href, ids, cards }: { title: string; href: string; ids: string[]; cards: Record<string, FeedCard> }) {
  const items = ids.flatMap((id) => cards[id] ?? []);
  if (!items.length) return null;
  return (
    <Shelf title={title} href={href}>
      {items.map((item) => (
        <li key={item.vid} className={`${tile}`}>
          <VideoCard item={item} />
        </li>
      ))}
    </Shelf>
  );
}

function ListTile({ href, label, Icon, count }: { href: string; label: string; Icon: typeof LaterIcon; count: number }) {
  return (
    <li className={tile}>
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

  if (!ready) return null;
  const empty = !history.length && !library.later.length && !library.likes.length && !library.subs.length;

  return (
    <div>
      <header className="flex items-center gap-4 py-2">
        <span aria-hidden className="grid size-20 shrink-0 place-items-center rounded-full bg-surface-hover text-4xl font-medium min-[801px]:size-28 min-[801px]:text-6xl">
          Y
        </span>
        <h1 className="text-2xl font-bold tracking-[-0.01em] min-[801px]:text-4xl">You</h1>
      </header>

      {empty ? (
        <div className="mt-6">
          <EmptyState title="Enjoy your favourite videos" body="Videos you watch, save and like appear here" href="/" action="Go to Home" />
        </div>
      ) : (
        <>
          <CardShelf title="History" href="/history" ids={history.slice(0, SHELF)} cards={cards} />
          <CardShelf title="Watch later" href="/later" ids={library.later.slice(0, SHELF)} cards={cards} />
          <CardShelf title="Liked videos" href="/liked" ids={library.likes.slice(0, SHELF)} cards={cards} />
          {channels.length ? (
            <Shelf title="Subscriptions" href="/subscriptions">
              {channels.map((channel) => (
                <li key={channel.slug} className="w-20 shrink-0">
                  <Link href={`/channel/${channel.slug}`} prefetch={false} className="press flex flex-col items-center gap-2 text-center">
                    <span aria-hidden className="grid size-14 place-items-center rounded-full text-xl font-medium text-white" style={{ backgroundColor: avatarColor(channel.name) }}>
                      {channel.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="line-clamp-2 w-full text-xs wrap-anywhere">{channel.name}</span>
                  </Link>
                </li>
              ))}
            </Shelf>
          ) : null}
          {library.later.length || library.likes.length ? (
            <Shelf title="Playlists">
              {library.later.length ? <ListTile href="/later" label="Watch later" Icon={LaterIcon} count={library.later.length} /> : null}
              {library.likes.length ? <ListTile href="/liked" label="Liked videos" Icon={LikeIcon} count={library.likes.length} /> : null}
            </Shelf>
          ) : null}
        </>
      )}

      <Link href="/settings" className="press mt-8 flex h-14 items-center gap-4 rounded-xl px-2 hover:bg-surface">
        <GearIcon />
        <span className="flex-1 text-base">Settings</span>
        <ChevronIcon />
      </Link>
    </div>
  );
}
