import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "catalog");

describe("licensed catalogue", () => {
  test("counts, foreign keys, and stripped YouTube fields", () => {
    const index = JSON.parse(fs.readFileSync(path.join(root, "index.json"), "utf8")) as { vid: string; shard: string; categories: string[] }[];
    const taxonomy = JSON.parse(fs.readFileSync(path.join(root, "taxonomy.json"), "utf8")) as {
      areas: { id: string; categories: { id: string }[] }[];
      categories: { id: string }[];
    };
    const playlists = JSON.parse(fs.readFileSync(path.join(root, "playlists.json"), "utf8")) as { items: { vid: string }[] }[];
    const ids = new Set(index.map((row) => row.vid));
    const categoryIds = new Set(taxonomy.categories.map((category) => category.id));
    expect(index.length).toBe(6454);
    expect(taxonomy.categories.length).toBe(150);
    expect(taxonomy.areas.length).toBe(16);
    expect(playlists.length).toBe(27);
    expect(ids.size).toBe(6454);
    let mentions = 0;
    let related = 0;
    for (const shardId of Array.from({ length: 16 }, (_, index) => String(index).padStart(2, "0"))) {
      const shard = JSON.parse(fs.readFileSync(path.join(root, "shards", `${shardId}.json`), "utf8")) as {
        videos: Record<string, unknown>[];
        mentions: { vid: string }[];
        related: { vid: string; related: { vid: string }[] }[];
      };
      for (const video of shard.videos) {
        expect(video.duration_s).toBeUndefined();
        expect(video.views).toBeUndefined();
        expect(video.likes).toBeUndefined();
        expect(video.published).toBeUndefined();
        expect(video.thumbnail).toBeUndefined();
        for (const category of video.categories as { id: string }[]) {
          expect(categoryIds.has(category.id)).toBe(true);
        }
      }
      for (const mention of shard.mentions) expect(ids.has(mention.vid)).toBe(true);
      for (const edge of shard.related) {
        expect(ids.has(edge.vid)).toBe(true);
        for (const item of edge.related) expect(ids.has(item.vid)).toBe(true);
      }
      mentions += shard.mentions.length;
      related += shard.related.length;
    }
    expect(mentions).toBe(39834);
    expect(related).toBe(3778);
    for (const playlist of playlists) {
      for (const item of playlist.items) expect(ids.has(item.vid)).toBe(true);
    }
  });
});
