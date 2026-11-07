import type { Metadata } from "next";

import { YouPage } from "@/components/you/you-page";

export const metadata: Metadata = { title: "You" };

export default function You() {
  return <YouPage />;
}
