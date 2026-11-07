import type { Metadata } from "next";

import { FramesSetting } from "@/components/library";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function Settings() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" />
      <FramesSetting />
    </div>
  );
}
