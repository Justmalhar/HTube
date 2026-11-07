import { getEngine } from "@/lib/server-catalog";

export function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean).slice(0, 80) ?? [];
  const engine = getEngine();
  const items = ids.flatMap((id) => {
    const card = engine.byId.get(id);
    return card ? [card] : [];
  });
  return Response.json({ items });
}
