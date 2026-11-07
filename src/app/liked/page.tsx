import type { Metadata } from "next";

import { LibraryPage } from "@/components/library-page";

export const metadata: Metadata = { title: "Liked videos" };

export default function Liked() {
  return <LibraryPage kind="likes" />;
}
