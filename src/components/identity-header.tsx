/**
 * Avatar, title, stats, description and an actions slot, shared by channel, profile and You.
 * One DOM copy: actions sit under the text on desktop and span the full width under the header on phones.
 * Top aligned so the h1 starts at the same offset on every identity page.
 */
export function IdentityHeader({ avatar, title, stats, description, actions }: {
  avatar: React.ReactNode; title: string; stats?: React.ReactNode; description?: string | null; actions?: React.ReactNode;
}) {
  return (
    <header className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 min-[801px]:gap-x-6">
      <div className="min-[801px]:row-span-2">{avatar}</div>
      <div className="min-w-0">
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em] wrap-anywhere min-[801px]:text-4xl min-[801px]:leading-10">{title}</h1>
        {stats ? <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted tabular-nums">{stats}</p> : null}
        {description ? <p className="mt-1 line-clamp-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? (
        <div className="col-span-2 mt-3 flex gap-2 *:flex-1 min-[801px]:col-span-1 min-[801px]:col-start-2 min-[801px]:self-start min-[801px]:*:flex-none">{actions}</div>
      ) : null}
    </header>
  );
}
