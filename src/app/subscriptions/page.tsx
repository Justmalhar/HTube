import type { Metadata } from "next";

import { SubscriptionsFeed } from "@/components/subscriptions-feed";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Subscriptions" };

export default function Subscriptions() {
  return (
    <div>
      <PageHeader title="Subscriptions" />
      <SubscriptionsFeed />
    </div>
  );
}
