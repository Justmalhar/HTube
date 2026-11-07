import type { Metadata } from "next";

import { FramesSetting } from "@/components/library";
import { readingClass } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { ShortcutsSection } from "@/components/settings/shortcuts-section";

export const metadata: Metadata = { title: "Settings" };

export default function Settings() {
  return (
    <div className={readingClass}>
      <PageHeader title="Settings" />
      <section aria-labelledby="general-title">
        <h2 id="general-title" className="mb-3 text-lg font-medium">General</h2>
        <FramesSetting />
      </section>
      <ShortcutsSection />
    </div>
  );
}
