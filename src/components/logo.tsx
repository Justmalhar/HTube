import Link from "next/link";

// Drawn on a 32 unit grid with every edge on a whole unit, so the mark is pixel-snapped at
// 16px and 32px: an "H" whose crossbar carries a play notch. Keep src/app/icon.svg in sync.
const LETTER = "M7 6h4v20H7zM21 6h4v20h-4zM11 12h10v8H11z";
const NOTCH = "M14 14l5 2-5 2z";

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" width={size} height={size} className={className} focusable="false">
      <rect width="32" height="32" rx="7" fill="#FF6600" />
      <path fill="#FFF" d={LETTER} />
      <path fill="#FF6600" d={NOTCH} />
    </svg>
  );
}

/** `collapse` hides the text under 400px (top bar on narrow phones); the drawer keeps it. */
export function Wordmark({
  onNavigate,
  className = "",
  collapse = false,
}: {
  onNavigate?: () => void;
  className?: string;
  collapse?: boolean;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="HTube, home"
      className={`press flex h-10 shrink-0 items-center gap-1.5 rounded-lg pr-2 ${className}`}
    >
      <LogoMark size={24} className="shrink-0" />
      <span aria-hidden className={`text-[19px] leading-none tracking-[-0.015em] ${collapse ? "hidden min-[400px]:inline" : ""}`}>
        <span className="font-bold">H</span>
        <span className="font-medium">Tube</span>
      </span>
    </Link>
  );
}
