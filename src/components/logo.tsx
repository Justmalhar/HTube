import Link from "next/link";

// Drawn on a 32 unit grid: every edge except the N diagonal lands on an even unit,
// so the mark is pixel-snapped at 16px and 32px. Keep src/app/icon.svg in sync.
const LETTERS = "M2 6h4v14H2zM10 6h4v14h-4zM6 10h4v4H6zM16 6h4v14h-4zM26 6h4v14h-4zM16 6h4.4L30 20h-4.4z";

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" width={size} height={size} className={className} focusable="false">
      <rect width="32" height="32" rx="7" fill="#FF6600" />
      <path fill="#FFF" d={LETTERS} />
      {/* Scrubber: the video cue. Track at 45% white, played part solid. */}
      <rect x="6" y="24" width="20" height="2" rx="1" fill="#FFF" fillOpacity={0.45} />
      <rect x="6" y="24" width="12" height="2" rx="1" fill="#FFF" />
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
      aria-label="OpenHackerTube, home"
      className={`press flex h-10 shrink-0 items-center gap-1.5 rounded-lg pr-2 ${className}`}
    >
      <LogoMark size={24} className="shrink-0" />
      <span aria-hidden className={`text-[19px] leading-none tracking-[-0.015em] ${collapse ? "hidden min-[400px]:inline" : ""}`}>
        <span className="font-normal">Open</span>
        <span className="font-bold">HackerTube</span>
      </span>
    </Link>
  );
}
