import Link from "next/link";

import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <div>
      <PageHeader title="Not found" description="Try another talk" />
      <Link href="/" className="text-sm text-primary">Back home</Link>
    </div>
  );
}
