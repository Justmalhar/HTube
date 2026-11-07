export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-4 grid grid-cols-1 gap-2 min-[801px]:grid-cols-[1fr_auto] min-[801px]:items-center">
      <h1 className="text-xl font-medium">{title}</h1>
      {description ? <p className="text-sm text-muted min-[801px]:col-span-2">{description}</p> : null}
      {actions ? <div className="min-[801px]:col-start-2 min-[801px]:row-start-1">{actions}</div> : null}
    </header>
  );
}
