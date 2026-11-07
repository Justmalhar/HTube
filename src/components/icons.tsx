export function ClockIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <circle cx="12" cy="12" r="8" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5l3 2" fill="none" stroke={filled ? "var(--background)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ThumbUpIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M7 10v10H4V10zm3 .2 3.2-4.5c.4-.5 1.2-.4 1.4.2L14 9h4.2c1.2 0 2.1 1.1 1.8 2.2l-1.2 5.2A2 2 0 0 1 16.9 18H10z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
      />
    </svg>
  );
}

export function ThumbDownIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M17 14V4h3v10zm-3-.2-3.2 4.5c-.4.5-1.2.4-1.4-.2L10 15H5.8c-1.2 0-2.1-1.1-1.8-2.2l1.2-5.2A2 2 0 0 1 7.1 6H14z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
      />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M14 5h5v5M19 5l-9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 5H6v13h13v-5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function HideIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M6.5 6.5l11 11" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export { pillClass } from "@/components/ui";
