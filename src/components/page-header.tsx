import { headerGapClass } from "@/components/ui";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className={`${headerGapClass} grid grid-cols-1 gap-x-4 gap-y-1 min-[801px]:grid-cols-[minmax(0,1fr)_auto] min-[801px]:items-center`}>
      <h1 className="min-w-0 text-xl font-bold leading-7 tracking-[-0.01em] text-balance wrap-anywhere">{title}</h1>
      {description ? <p className="max-w-3xl text-sm text-muted min-[801px]:col-span-2">{description}</p> : null}
      {actions ? (
        <div className="mt-3 flex gap-2 *:flex-1 min-[801px]:col-start-2 min-[801px]:row-start-1 min-[801px]:mt-0 min-[801px]:*:flex-none">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
