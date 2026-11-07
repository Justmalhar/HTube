import type { Metadata } from "next";

import { LibraryPage } from "@/components/library-page";

export const metadata: Metadata = { title: "History" };

export default function History() {
  return <LibraryPage kind="seen" />;
}
