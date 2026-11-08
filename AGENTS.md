<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## HTube

- Read `design.md` before touching UI and `docs/architecture.md` before touching the ranker, sync, or the player.
- Shared class strings and the type scale live in `src/components/ui.ts`. Reuse `Avatar`, `IdentityHeader`, `UnderlineTabs`, `Section`, `CardShelf`, `ChipBar`, `StatusPanel` and `useSnackbar` instead of writing new ones.
- Preferences stay in browser storage (`oht.library.v1`). The home feed POSTs `likes`, `dislikes`, `seen` and `later` ids to `/api/feed` so the server can rank. That route does not persist the body. Do not describe ranking as on-device, or the library as data that never leaves the device. A host can receive the POST.
- Never show YouTube view counts, like counts, durations or upload dates. `data/private` is gitignored and must not be read.
- Writing rules for code, copy and docs: no em dashes, no middle dots or bullets as separators, no colored left borders.
- Verify UI changes headlessly at 375px and desktop widths, and run `bun test`, `bun run lint`, `bun run typecheck`.

