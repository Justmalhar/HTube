import { readShard } from "@/lib/server-catalog";

export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => {
    try {
      return new Response(readShard(id), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=86400" },
      });
    } catch {
      return Response.json({ error: "Unknown shard" }, { status: 404 });
    }
  });
}
