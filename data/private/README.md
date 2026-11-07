This folder is gitignored except for this note.

`openhackertube-full-export.zip` is the delivered snapshot, including live YouTube publish dates, durations, view counts, and like counts. `youtube-meta.jsonl` is those fields alone, written by `python3 scripts/import_licensed.py`.

The Open Data Commons attribution on the HackerTube export does not allow publishing those YouTube fields. The running app does not read them, does not put them in IndexedDB, and does not offer them for download. Thumbnails and embeds are plain YouTube URLs built from the video id.
