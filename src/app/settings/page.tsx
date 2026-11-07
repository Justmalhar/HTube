import type { Metadata } from "next";

import { FramesSetting } from "@/components/library";
import { readingClass } from "@/components/ui";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function Settings() {
  return (
    <div className={readingClass}>
      <PageHeader title="Settings" />
      <FramesSetting />
    </div>
  );
}
