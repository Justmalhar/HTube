import { PAGE } from "@/lib/engine";
import { getEngine } from "@/lib/server-catalog";
import { subscriptionCards } from "@/lib/subscriptions";

const MAX_SLUGS = 500;

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const slugs = params.get("slugs")?.split(",").filter(Boolean).slice(0, MAX_SLUGS) ?? [];
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const engine = getEngine();
  const rows = subscriptionCards(engine.cards, slugs);
  const channels = offset
    ? []
    : slugs.flatMap((slug) => {
        const name = engine.cards.find((card) => card.channelSlug === slug)?.channel;
        return name ? [{ slug, name }] : [];
      });
  return Response.json({ items: rows.slice(offset, offset + PAGE), offset, total: rows.length, channels });
}
