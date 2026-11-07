"use client";

import { buildEngine, type Engine } from "@/lib/engine";
import type { Area, Card, Category, Mention, Playlist, RelatedEdge } from "@/lib/types";

export type SyncStatus = {
  phase: "starting" | "index" | "shards" | "ready";
  shardsDone: number;
  shardCount: number;
  detail: string;
};

type Listener = () => void;
type Manifest = { version: string; shardCount: number; shards: { id: string }[] };
type ShardFile = {
  id: string;
  videos: { vid: string; summary?: string; tags?: string[] }[];
  mentions: Mention[];
  related: { vid: string; related: RelatedEdge[] }[];
};

let engine: Engine | null = null;
const mentions = new Map<string, Mention[]>();
const loadedShards = new Set<string>();
let manifest: Manifest | null = null;
let status: SyncStatus = { phase: "starting", shardsDone: 0, shardCount: 16, detail: "Opening this device" };
const listeners = new Set<Listener>();
let started = false;

const DB = "openhackertube";

export function getClientEngine(): Engine | null {
  return engine;
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeCatalog(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(next: SyncStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

export function mentionsFor(vid: string): Mention[] | null {
  return mentions.get(vid) ?? null;
}

export function shardFor(vid: string): string | null {
  return engine?.byId.get(vid)?.shard ?? null;
}

export function startCatalogSync() {
  if (started || typeof indexedDB === "undefined") return;
  started = true;
  void run();
}

async function run() {
  try {
    const db = await openDb();
    const nextManifest = await fetch("/api/sync/manifest").then((response) => {
      if (!response.ok) throw new Error("manifest");
      return response.json() as Promise<Manifest>;
    });
    manifest = nextManifest;
    const cachedVersion = await getKv<string>(db, "version");
    emit({ phase: "index", shardsDone: 0, shardCount: nextManifest.shardCount, detail: "Saving the index on this device" });
    if (cachedVersion !== nextManifest.version) {
      const [indexText, taxonomyText, playlistText] = await Promise.all([
        fetch("/api/sync/index").then((response) => response.text()),
        fetch("/api/sync/taxonomy").then((response) => response.text()),
        fetch("/api/sync/playlists").then((response) => response.text()),
      ]);
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(indexText, "index");
      tx.objectStore("kv").put(taxonomyText, "taxonomy");
      tx.objectStore("kv").put(playlistText, "playlists");
      tx.objectStore("kv").put(nextManifest.version, "version");
      await txDone(tx);
      const clear = db.transaction("shards", "readwrite");
      clear.objectStore("shards").clear();
      await txDone(clear);
      hydrateBase(indexText, taxonomyText, playlistText);
    } else {
      const [indexText, taxonomyText, playlistText] = await Promise.all([
        getKv<string>(db, "index"),
        getKv<string>(db, "taxonomy"),
        getKv<string>(db, "playlists"),
      ]);
      if (!indexText || !taxonomyText || !playlistText) {
        await setKv(db, "version", "");
        started = false;
        return run();
      }
      hydrateBase(indexText, taxonomyText, playlistText);
      const stored = await getAllShards(db);
      for (const shard of stored) applyShard(shard);
    }
    emit({
      phase: "shards",
      shardsDone: loadedShards.size,
      shardCount: manifest.shardCount,
      detail: "Saving talks and comments",
    });
    for (const shard of nextManifest.shards) {
      if (loadedShards.has(shard.id)) continue;
      const response = await fetch(`/api/sync/shard/${shard.id}`);
      if (!response.ok) throw new Error(shard.id);
      const file = (await response.json()) as ShardFile;
      const tx = db.transaction("shards", "readwrite");
      tx.objectStore("shards").put(file, shard.id);
      await txDone(tx);
      applyShard(file);
      emit({
        phase: loadedShards.size === nextManifest.shardCount ? "ready" : "shards",
        shardsDone: loadedShards.size,
        shardCount: nextManifest.shardCount,
        detail: loadedShards.size === nextManifest.shardCount ? "Catalogue is on this device" : "Saving talks and comments",
      });
    }
  } catch {
    emit({ ...status, detail: "Catalogue will stay on the server for this visit" });
  }
}

export async function ensureShard(id: string): Promise<void> {
  if (loadedShards.has(id)) return;
  const db = await openDb();
  const stored = await new Promise<ShardFile | undefined>((resolve, reject) => {
    const request = db.transaction("shards", "readonly").objectStore("shards").get(id);
    request.onsuccess = () => resolve(request.result as ShardFile | undefined);
    request.onerror = () => reject(request.error);
  });
  if (stored) {
    applyShard(stored);
    return;
  }
  const response = await fetch(`/api/sync/shard/${id}`);
  if (!response.ok) return;
  const file = (await response.json()) as ShardFile;
  const tx = db.transaction("shards", "readwrite");
  tx.objectStore("shards").put(file, id);
  await txDone(tx);
  applyShard(file);
}

function hydrateBase(indexText: string, taxonomyText: string, playlistText: string) {
  const taxonomy = JSON.parse(taxonomyText) as { areas: Area[]; categories: Category[] };
  const cards = (JSON.parse(indexText) as Card[]).map((card) => ({
    ...card,
    tags: card.tags ?? [],
    summary: card.summary ?? "",
  }));
  engine = buildEngine({
    cards,
    areas: taxonomy.areas,
    categories: taxonomy.categories,
    playlists: JSON.parse(playlistText) as Playlist[],
    related: [],
  });
  listeners.forEach((listener) => listener());
}

function applyShard(file: ShardFile) {
  if (!engine || loadedShards.has(file.id)) return;
  for (const video of file.videos) {
    const card = engine.byId.get(video.vid);
    if (!card) continue;
    card.summary = video.summary ?? "";
    card.tags = video.tags ?? [];
  }
  for (const mention of file.mentions) {
    const list = mentions.get(mention.vid);
    if (list) list.push(mention);
    else mentions.set(mention.vid, [mention]);
  }
  for (const row of file.related) engine.related.set(row.vid, row.related);
  loadedShards.add(file.id);
  listeners.forEach((listener) => listener());
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (db.objectStoreNames.contains("mentions")) db.deleteObjectStore("mentions");
      if (!db.objectStoreNames.contains("shards")) db.createObjectStore("shards");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getKv<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = db.transaction("kv", "readonly").objectStore("kv").get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

function setKv(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  const tx = db.transaction("kv", "readwrite");
  tx.objectStore("kv").put(value, key);
  return txDone(tx);
}

function getAllShards(db: IDBDatabase): Promise<ShardFile[]> {
  return new Promise((resolve, reject) => {
    const request = db.transaction("shards", "readonly").objectStore("shards").getAll();
    request.onsuccess = () => resolve((request.result as ShardFile[]) ?? []);
    request.onerror = () => reject(request.error);
  });
}
