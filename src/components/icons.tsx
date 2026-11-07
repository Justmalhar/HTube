import {
  Ban,
  SquarePlay,
  Bell,
  BellRing,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock,
  ClockCheck,
  Compass,
  EllipsisVertical,
  ExternalLink,
  Forward,
  History,
  House,
  Keyboard,
  LayoutGrid,
  ListFilter,
  ListVideo,
  Menu,
  Moon,
  Play,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Sun,
  ThumbsDown,
  ThumbsUp,
  TvMinimalPlay,
  X,
  type LucideIcon,
} from "lucide-react";

// One icon language (Lucide): 1.75 stroke idle, 2.5 for the current nav item or an "on" toggle.
// Action icons are 20px (inside 36px pills and menus), chrome icons 24px.
const IDLE = 1.75;
const ON = 2.5;

type Props = { active?: boolean };
type ToggleProps = { filled?: boolean };

function action(Icon: LucideIcon) {
  return function ActionIcon() {
    return <Icon size={20} strokeWidth={IDLE} className="shrink-0" />;
  };
}

function chrome(Icon: LucideIcon) {
  return function ChromeIcon({ active = false }: Props) {
    return <Icon size={24} strokeWidth={active ? ON : IDLE} className="shrink-0" />;
  };
}

export function ClockIcon({ filled = false }: ToggleProps) {
  // A filled Lucide clock hides its hands, so "saved" swaps to a clock with a check.
  return filled ? <ClockCheck size={20} strokeWidth={ON} className="shrink-0" /> : <Clock size={20} strokeWidth={IDLE} className="shrink-0" />;
}

export function ThumbUpIcon({ filled = false }: ToggleProps) {
  return <ThumbsUp size={20} strokeWidth={IDLE} fill={filled ? "currentColor" : "none"} className="shrink-0" />;
}

export function ThumbDownIcon({ filled = false }: ToggleProps) {
  return <ThumbsDown size={20} strokeWidth={IDLE} fill={filled ? "currentColor" : "none"} className="shrink-0" />;
}

export function PlayIcon() {
  return <Play size={20} strokeWidth={IDLE} fill="currentColor" className="shrink-0" />;
}

export const ExternalIcon = action(ExternalLink);
export const MoreIcon = action(EllipsisVertical);
export const HideIcon = action(Ban);
export const ChevronIcon = action(ChevronRight);
export const ChevronLeftIcon = action(ChevronLeft);
export const ShareIcon = action(Forward);
export const CloseIcon = action(X);
export const BellIcon = action(Bell);
export const BellRingIcon = action(BellRing);
export const SortIcon = action(ListFilter);
export const SkipBackIcon = action(SkipBack);
export const SkipForwardIcon = action(SkipForward);
export const ChevronDownIcon = action(ChevronDown);

export const MenuIcon = chrome(Menu);
export const SearchIcon = chrome(Search);
export const KeyboardIcon = chrome(Keyboard);
export const SunIcon = chrome(Sun);
export const MoonIcon = chrome(Moon);
export const LongsIcon = chrome(TvMinimalPlay);
export const YouIcon = chrome(CircleUserRound);
export const HomeIcon = chrome(House);
export const SubscriptionsIcon = chrome(SquarePlay);
export const LaterIcon = chrome(Clock);
export const GridIcon = chrome(LayoutGrid);
export const ListIcon = chrome(ListVideo);
export const CompassIcon = chrome(Compass);
export const LikeIcon = chrome(ThumbsUp);
export const HistoryIcon = chrome(History);
export const GearIcon = chrome(Settings);

export { pillClass } from "@/components/ui";
