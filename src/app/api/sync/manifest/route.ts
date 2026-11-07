import { getManifest } from "@/lib/server-catalog";

export function GET() {
  return Response.json(getManifest());
}
