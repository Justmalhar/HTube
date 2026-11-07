import { getEngine } from "@/lib/server-catalog";

// Matches the history cap in the library (seen keeps the last 500 ids).
const MAX_IDS = 500;

export function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean).slice(0, MAX_IDS) ?? [];
  const engine = getEngine();
  const items = ids.flatMap((id) => {
    const card = engine.byId.get(id);
    return card ? [card] : [];
  });
  return Response.json({ items });
}
