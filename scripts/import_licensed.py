#!/usr/bin/env python3
"""Build the committed catalogue from the delivered snapshot.

Strips YouTube fields the official ODC-By export does not grant for
redistribution: publish time, duration, view count, like count, and the
stored thumbnail URL. Those values are written only under data/private.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/tmp/oht-extract/hackertube-complete.json")
CATALOG = ROOT / "data" / "catalog"
PRIVATE = ROOT / "data" / "private"
RESTRICTED = {"published", "duration_s", "views", "likes", "thumbnail", "minutes"}


def shard_key(vid: str, count: int) -> str:
    digest = 2166136261
    for char in vid:
        digest ^= ord(char)
        digest = (digest * 16777619) & 0xFFFFFFFF
    return f"{digest % count:02d}"


def slugify(name: str) -> str:
    text = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (text or "channel")[:80]


def load() -> dict:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source snapshot: {SOURCE}")
    with SOURCE.open() as handle:
        return json.load(handle)


def main() -> None:
    data = load()
    videos = data["videos"]
    CATALOG.mkdir(parents=True, exist_ok=True)
    PRIVATE.mkdir(parents=True, exist_ok=True)

    used: dict[str, str] = {}
    meta_rows = []
    licensed_rows = []
    for video in videos:
        meta_rows.append(
            {
                "vid": video["vid"],
                "duration_s": video.get("duration_s"),
                "views": video.get("views"),
                "likes": video.get("likes"),
                "published": video.get("published"),
            }
        )
        slug = slugify(video.get("channel") or "channel")
        owner = used.get(slug)
        if owner and owner != video["channel"]:
            suffix = 2
            while f"{slug}-{suffix}" in used and used[f"{slug}-{suffix}"] != video["channel"]:
                suffix += 1
            slug = f"{slug}-{suffix}"
        used[slug] = video["channel"]
        row = {key: value for key, value in video.items() if key not in RESTRICTED}
        row["channel_slug"] = slug
        provenance = dict(row.get("provenance") or {})
        provenance["youtube_fields_stripped"] = [
            "published",
            "duration_s",
            "views",
            "likes",
            "thumbnail",
        ]
        provenance["note"] = (
            "Live YouTube metadata from the Nov 2026 enrichment was removed "
            "before commit. Duration and view filters read data/private only."
        )
        row["provenance"] = provenance
        licensed_rows.append(row)

    with (PRIVATE / "youtube-meta.jsonl").open("w") as handle:
        for row in meta_rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    shard_count = 16
    shard_of = {}
    for row in licensed_rows:
        shard_of[row["vid"]] = shard_key(row["vid"], shard_count)

    by_cat: dict[str, int] = defaultdict(int)
    by_area: dict[str, set[str]] = defaultdict(set)
    for video in videos:
        for category in video["categories"]:
            by_cat[category["id"]] += 1
            by_area[category["area"]].add(video["vid"])

    categories = []
    for category in data["categories"]:
        categories.append({**category, "video_count": by_cat[category["id"]]})

    areas = []
    for area in data["areas"]:
        nested = []
        for category in area["categories"]:
            nested.append({**category, "video_count": by_cat[category["id"]]})
        areas.append(
            {
                "id": area["id"],
                "name": area["name"],
                "video_count": len(by_area[area["id"]]),
                "categories": nested,
            }
        )
    details = {item["data"]["slug"]: item for item in data["playlist_details"]}
    playlists = []
    for summary in data["playlists"]:
        detail = details[summary["slug"]]["data"]
        playlists.append(
            {
                "slug": summary["slug"],
                "title": summary["title"],
                "pitch": summary["pitch"],
                "intro": detail.get("intro") or "",
                "kind": summary.get("kind"),
                "tier": summary.get("tier") or "deep",
                "source_url": details[summary["slug"]].get("source_url"),
                "cover": summary.get("cover") or [],
                "items": [
                    {"vid": item["vid"], "note": item.get("note") or ""}
                    for item in detail["videos"]
                ],
            }
        )
    (CATALOG / "playlists.json").write_text(json.dumps(playlists, ensure_ascii=False, indent=2))

    channels: dict[str, dict] = {}
    for row in licensed_rows:
        current = channels.setdefault(
            row["channel_slug"],
            {"slug": row["channel_slug"], "name": row["channel"], "video_count": 0},
        )
        current["video_count"] += 1
    channel_rows = sorted(channels.values(), key=lambda item: (-item["video_count"], item["name"]))
    (CATALOG / "channels.json").write_text(json.dumps(channel_rows, ensure_ascii=False, indent=2))

    taxonomy = {"areas": areas, "categories": categories}
    (CATALOG / "taxonomy.json").write_text(json.dumps(taxonomy, ensure_ascii=False, separators=(",", ":")))
    index = []
    buckets: dict[str, dict] = {
        f"{i:02d}": {"id": f"{i:02d}", "videos": [], "mentions": [], "related": []}
        for i in range(shard_count)
    }
    for row in licensed_rows:
        quote = row.get("quote") or None
        key = shard_of[row["vid"]]
        row["shard"] = key
        buckets[key]["videos"].append(row)
        index.append(
            {
                "vid": row["vid"],
                "shard": key,
                "title": row["title"],
                "channel": row["channel"],
                "channelSlug": row["channel_slug"],
                "contentType": row["content_type"],
                "level": row["level"],
                "shelfLife": row["shelf_life"],
                "primaryTopic": row.get("primary_topic") or "",
                "categories": [item["id"] for item in row["categories"]],
                "score": row["score"],
                "recommenders": row["hn"]["recommenders"],
                "recMonths": row["hn"]["rec_months"],
                "strongRecs": row["hn"]["strong_recs"],
                "mentions": row["hn"]["mentions"],
                "firstYear": row["hn"]["first_year"],
                "lastYear": row["hn"]["last_year"],
                "whyHn": row.get("why_hn") or "",
                "quote": quote.get("text") if quote else None,
            }
        )
    for mention in data["mentions"]:
        buckets[shard_of[mention["vid"]]]["mentions"].append(mention)
    for edge in data["related"]:
        buckets[shard_of[edge["vid"]]]["related"].append(edge)
    shard_dir = CATALOG / "shards"
    shard_dir.mkdir(exist_ok=True)
    shard_bytes = {}
    for key, bucket in buckets.items():
        target = shard_dir / f"{key}.json"
        target.write_text(json.dumps(bucket, ensure_ascii=False, separators=(",", ":")))
        shard_bytes[key] = target.stat().st_size
    (CATALOG / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")))
    manifest = {
        "version": "2026-10-31+2026-11-07",
        "shardCount": shard_count,
        "shards": [{"id": key, "bytes": shard_bytes[key], "videos": len(buckets[key]["videos"])} for key in buckets],
        "counts": {
            "videos": len(licensed_rows),
            "mentions": len(data["mentions"]),
            "related": len(data["related"]),
            "categories": len(categories),
            "areas": len(areas),
            "playlists": len(playlists),
            "channels": len(channel_rows),
        },
    }
    (CATALOG / "manifest.json").write_text(json.dumps(manifest, indent=2))
    for stale in [
        CATALOG / "videos.jsonl",
        CATALOG / "mentions.jsonl",
        CATALOG / "related.jsonl",
        CATALOG / "areas.json",
        CATALOG / "categories.json",
        CATALOG / "sync" / "cards.json",
        CATALOG / "sync" / "taxonomy.json",
        CATALOG / "sync" / "playlists.json",
        CATALOG / "sync" / "related.json",
    ]:
        if stale.exists():
            stale.unlink()

    ids = {video["vid"] for video in videos}
    cat_ids = {category["id"] for category in data["categories"]}
    missing_cats = sorted(
        {
            category["id"]
            for video in videos
            for category in video["categories"]
            if category["id"] not in cat_ids
        }
    )
    missing_mentions = sorted({row["vid"] for row in data["mentions"] if row["vid"] not in ids})
    missing_related = sorted(
        {row["vid"] for row in data["related"] if row["vid"] not in ids}
        | {
            item["vid"]
            for row in data["related"]
            for item in row["related"]
            if item["vid"] not in ids
        }
    )
    missing_playlist = sorted(
        {item["vid"] for playlist in playlists for item in playlist["items"] if item["vid"] not in ids}
    )
    restricted_left = sorted(
        {
            key
            for row in licensed_rows
            for key in row
            if key in RESTRICTED
        }
    )
    if missing_cats or missing_mentions or missing_related or missing_playlist or restricted_left:
        raise SystemExit(
            json.dumps(
                {
                    "missing_cats": missing_cats[:10],
                    "missing_mentions": missing_mentions[:10],
                    "missing_related": missing_related[:10],
                    "missing_playlist": missing_playlist[:10],
                    "restricted_left": restricted_left,
                },
                indent=2,
            )
        )
    if len(videos) != 6454 or len(data["categories"]) != 150 or len(data["areas"]) != 16:
        raise SystemExit("Unexpected catalogue counts")
    if len(data["playlists"]) != 27 or len(data["mentions"]) != 39834 or len(data["related"]) != 3778:
        raise SystemExit("Unexpected relation counts")

    ds_hits = [
        category["id"]
        for category in categories
        if "distributed systems" in category.get("description", "").lower()
    ]
    report = {
        "videos": len(licensed_rows),
        "categories": len(categories),
        "areas": len(areas),
        "playlists": len(playlists),
        "mentions": len(data["mentions"]),
        "related": len(data["related"]),
        "channels": len(channel_rows),
        "restricted_fields_committed": [],
        "distributed_systems_categories": ds_hits,
        "source_provenance": data.get("provenance"),
        "source_coverage_counts": data.get("coverage", {}).get("counts"),
        "failed_source_requests": data.get("coverage", {}).get("failed_requests"),
    }
    (CATALOG / "import-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
