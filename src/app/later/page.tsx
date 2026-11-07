import type { Metadata } from "next";

import { LibraryPage } from "@/components/library-page";

export const metadata: Metadata = { title: "Watch later" };

export default function Later() {
  return <LibraryPage kind="later" />;
}
