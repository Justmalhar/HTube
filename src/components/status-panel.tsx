import Link from "next/link";

import { pillOnClass } from "@/components/ui";

type Action = { label: string; href?: string; onClick?: () => void };

/** One panel for empty and error states: what happened, what to try, and a way out. */
export function StatusPanel({ title, body, action }: { title: string; body?: string; action?: Action }) {
  return (
    <div role="status" className="grid place-items-center rounded-2xl bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium">{title}</p>
      {body ? <p className="mt-1 text-sm text-muted">{body}</p> : null}
      {action ? (
        action.href ? (
          <Link href={action.href} className={`${pillOnClass} mt-4`}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={`${pillOnClass} mt-4`}>
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
