import { readCatalogFile } from "@/lib/server-catalog";

export function GET() {
  return new Response(readCatalogFile("index.json"), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=86400" },
  });
}
