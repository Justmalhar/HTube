import { avatarColor } from "@/lib/comment-format";

/** Letter avatar; decorative, the name is always next to it. */
export function Avatar({ name, className = "size-10 text-base" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full font-medium text-white uppercase select-none ${className}`} style={{ backgroundColor: avatarColor(name) }}>
      {name.charAt(0)}
    </span>
  );
}
