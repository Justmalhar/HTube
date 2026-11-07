import Link from "next/link";

import { ChevronIcon } from "@/components/icons";
import { ghostPillClass, sectionTitleClass } from "@/components/ui";

/** Titled page section with an optional "View all" link; consecutive sections are divided by a line. */
export function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="my-8 border-t border-line pt-6 first:mt-2 first:border-t-0">
      <div className="mb-4 flex items-center gap-2">
        <h2 className={`min-w-0 truncate ${sectionTitleClass}`}>{title}</h2>
        {href ? (
          <Link href={href} prefetch={false} className={`${ghostPillClass} ml-auto`}>
            View all
            <ChevronIcon />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
