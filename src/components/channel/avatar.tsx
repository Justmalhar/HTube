import { avatarColor } from "@/lib/comment-format";

/** The only avatar sizes in the app. `xl` is 128px on desktop, 80px on phones; `comment` is 32px on phones, 40px from 640. */
const SIZES = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-base",
  row: "size-14 text-xl",
  lg: "size-20 text-4xl",
  xl: "size-20 text-4xl min-[801px]:size-32 min-[801px]:text-6xl",
  comment: "size-8 text-sm sm:size-10 sm:text-base",
} as const;

export type AvatarSize = keyof typeof SIZES;

/** Letter avatar; decorative, the name is always next to it. */
export function Avatar({ name, size = "md" }: { name: string; size?: AvatarSize }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full font-medium text-white uppercase select-none ${SIZES[size]}`} style={{ backgroundColor: avatarColor(name) }}>
      {name.charAt(0)}
    </span>
  );
}
