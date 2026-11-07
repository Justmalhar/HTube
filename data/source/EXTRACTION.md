# HackerTube public-data snapshot

Captured 7 November 2026, Asia/Calcutta (IST). Source: https://hackertube.org.

## Integration

`hackertube-complete.json` is the combined export; separate JSON arrays allow loading only what a route needs. `videos.json` contains enriched app-ready records. Keep the full dataset server-side, paginate search/browse, and send only a page of cards to clients. Do not import the combined export into a client component.

- `videos`: stable `id` = `vid` (YouTube ID); `title`, `channel`, `summary`, `why_hn`, `content_type`, `level`, `shelf_life`, `primary_topic`, `tags`, `categories[]`, `quote`, `hn`, `score`, plus real live `published`, `duration_s`, `views`, `likes`, `thumbnail`, `whys` when present.
- `url`: original YouTube URL. `source_url`: HackerTube watch URL. `embed_url`: YouTube privacy-enhanced embed. Provider is `youtube`. These derived URLs use the exact provider ID and the site's own route templates; they do not indicate separate requests to YouTube.
- `categories`: `id`, `name`, `description`, `area_id`, `area_name`, `source_url`. A video may have multiple categories; join video.categories[].id to categories.id.
- `areas`: `id`, `name`, nested `categories`. 16 areas, 150 categories.
- `mentions`: one per HN comment/video association, joined with `vid`; `hn_comment_id`, `hn_url`, `author`, `month`, `story_title`, `stance`, `why`, `quote`, `text`.
- `related`: `vid` and `related[]` entries (`vid`, `shared_recommenders`). Not every video has co-recommendation data.
- `playlists`: public summaries. `playlist-details.json`: objects with `source_url` and raw `data` containing the full playlist, ordered sections/items, and videos as actually returned.
- `pages`: representative public HTML route shells, extracted text, links and saved HTML paths. These are JS-rendered; content records are in the dataset, not HTML.
- `coverage.json`, `requests.json`, `url-inventory.json`: coverage, pagination, request status and every discovered route. `fetched:false` means a derived/discovered URL was not individually requested, NOT a failed request.
- `provenance` per video distinguishes official export (generated 2026-10-31) from current live metadata and records acquisition time.

Dates inside source records remain ISO values with their source zone to avoid corrupting machine-readable data. Scrape timestamps have explicit IST +05:30 offsets. Missing fields are omitted, not invented. In particular, summary is an AI-generated HackerTube summary, NOT an original YouTube description. No speaker field is inferred from titles/channels.

## Completeness and method

The source explicitly offers “Everything behind this site is yours to reuse” on /about and /data. We used that official bulk export, checked live stats, fetched all /api/list pages at the actual 100-item server cap, and fetched each curated playlist. Category relationships come from the complete taxonomy and full video records. Thousands of /watch, /c and /a URLs are identical HTML application shells; URL inventory records them without pretending all were individually crawled. Unbounded search/filter query combinations and personal browser state are not part of an exhaustive claim. Sitemap was requested but returned 404. See coverage.json for actual verified counts and failures.

robots.txt disallows /api/ and /download/ to crawlers. Those are precisely the explicit Fork it/download paths provided for public dataset reuse. This user-requested export used that offering and public client-visible metadata, no credentials, no bypass, concurrency 3, delay 0.2s per worker, three attempts max, stop on 403/429. No video/image/audio media downloaded. The official embeddings file is a search vector array, not video data.

## License / attribution — important

Official dataset: ODC-By 1.0. Credit HackerTube and retain the original DATA.md. HN content retains its source licensing. The official export intentionally excludes YouTube-derived publish dates/durations/counts because of YouTube redistribution restrictions. Live metadata is separately preserved here only because requested; do NOT assume the dataset license grants redistribution rights to these fields. Review terms and, for production, refresh YouTube metadata through your own approved API integration. Thumbnail and embed links are links only.

## Reproduction

Python 3, `requests`, `beautifulsoup4`. Download the site's published manifest at /api/export and its named /download/ zip, save it as source-export.zip, save /api/stats as stats.json, /api/playlists as playlists.json, /api/export as export.json, then run `python3 scrape.py`. Source entry-point responses are included. `official/hackertube-data/` preserves every original archive file. `source-export.zip` is the unmodified original 17.8MB data archive.
