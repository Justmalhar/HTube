import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { pillClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div>
      <PageHeader title="Not found" description="Try another talk" />
      <Link href="/" className={pillClass}>Back home</Link>
    </div>
  );
}
