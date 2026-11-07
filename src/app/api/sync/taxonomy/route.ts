import { readCatalogFile } from "@/lib/server-catalog";

export function GET() {
  return new Response(readCatalogFile("taxonomy.json"), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=86400" },
  });
}
