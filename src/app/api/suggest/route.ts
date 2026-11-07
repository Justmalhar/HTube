import { getEngine } from "@/lib/server-catalog";
import { suggest } from "@/lib/suggest";

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return Response.json({ items: suggest(getEngine(), q) }, { headers: { "Cache-Control": "public, max-age=300" } });
}
