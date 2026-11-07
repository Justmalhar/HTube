import { feedPage } from "@/lib/pages";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search: Record<string, string> = {};
  for (const [key, value] of params) if (key !== "path") search[key] = value;
  const page = feedPage(params.get("path") ?? "", search);
  if (!page) return Response.json({ error: "Unknown feed" }, { status: 404 });
  return Response.json({ items: page.items, offset: page.offset, total: page.total });
}
