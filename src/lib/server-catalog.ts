import "server-only";

import fs from "node:fs";
import path from "node:path";

import { buildEngine, type Engine } from "@/lib/engine";
import type { Area, Card, Category, Mention, Playlist, RelatedEdge } from "@/lib/types";

const ROOT = path.join(process.cwd(), "data", "catalog");

type Shard = {
  id: string;
  videos: {
    vid: string;
    summary?: string;
    tags?: string[];
  }[];
  mentions: Mention[];
  related: { vid: string; related: RelatedEdge[] }[];
};

type Cache = {
  mtime: number;
  engine: Engine;
  mentions: Map<string, Mention[]>;
  manifest: {
    version: string;
    shardCount: number;
    shards: { id: string; bytes: number; videos: number }[];
    counts: {
      videos: number;
      mentions: number;
      related: number;
      categories: number;
      areas: number;
      playlists: number;
      channels: number;
    };
  };
};

let cache: Cache | null = null;

export function getEngine(): Engine {
  return load().engine;
}

export function getMentions(vid: string): Mention[] {
  return load().mentions.get(vid) ?? [];
}

export function getManifest() {
  return load().manifest;
}

export function readCatalogFile(name: "index.json" | "taxonomy.json" | "playlists.json" | "manifest.json"): string {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

export function readShard(id: string): string {
  if (!/^\d{2}$/.test(id)) throw new Error("Unknown shard");
  return fs.readFileSync(path.join(ROOT, "shards", `${id}.json`), "utf8");
}

function load(): Cache {
  const stamp = fs.statSync(path.join(ROOT, "manifest.json")).mtimeMs;
  if (cache && cache.mtime === stamp) return cache;
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, "index.json"), "utf8")) as Card[];
  const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, "taxonomy.json"), "utf8")) as {
    areas: Area[];
    categories: Category[];
  };
  const playlists = JSON.parse(fs.readFileSync(path.join(ROOT, "playlists.json"), "utf8")) as Playlist[];
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8")) as Cache["manifest"];
  const cards: Card[] = index.map((card) => ({ ...card, tags: card.tags ?? [], summary: card.summary ?? "" }));
  const byId = new Map(cards.map((card) => [card.vid, card]));
  const mentions = new Map<string, Mention[]>();
  const related: { vid: string; related: RelatedEdge[] }[] = [];
  for (const shard of manifest.shards) {
    const file = JSON.parse(fs.readFileSync(path.join(ROOT, "shards", `${shard.id}.json`), "utf8")) as Shard;
    for (const video of file.videos) {
      const card = byId.get(video.vid);
      if (!card) continue;
      card.summary = video.summary ?? "";
      card.tags = video.tags ?? [];
    }
    for (const mention of file.mentions) {
      const list = mentions.get(mention.vid);
      if (list) list.push(mention);
      else mentions.set(mention.vid, [mention]);
    }
    related.push(...file.related);
  }
  cache = {
    mtime: stamp,
    engine: buildEngine({ cards, areas: taxonomy.areas, categories: taxonomy.categories, playlists, related }),
    mentions,
    manifest,
  };
  return cache;
}
