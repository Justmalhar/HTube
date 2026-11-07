export type ShelfLife = "evergreen" | "dated" | "news";

export type Card = {
  vid: string;
  shard: string;
  title: string;
  channel: string;
  channelSlug: string;
  contentType: string;
  level: string;
  shelfLife: ShelfLife | string;
  primaryTopic: string;
  tags: string[];
  categories: string[];
  score: number;
  recommenders: number;
  recMonths: number;
  strongRecs: number;
  mentions: number;
  firstYear: number;
  lastYear: number;
  whyHn: string;
  summary: string;
  quote: string | null;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  area_id: string;
  area_name: string;
  source_url?: string;
  video_count: number;
};

export type Area = {
  id: string;
  name: string;
  video_count: number;
  categories: { id: string; name: string; description: string; video_count: number }[];
};

export type PlaylistItem = { vid: string; note: string };

export type Playlist = {
  slug: string;
  title: string;
  pitch: string;
  intro: string;
  kind: string;
  tier: string;
  source_url?: string;
  cover: string[];
  items: PlaylistItem[];
};

export type Mention = {
  hn_comment_id: number;
  hn_url: string;
  vid: string;
  author: string;
  month: string;
  story_title: string;
  stance: string;
  why: string;
  quote: string;
  text: string;
};

export type RelatedEdge = { vid: string; shared_recommenders: number };

export type FeedCard = Card & { reason?: string; via?: string };

export type PageResult<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

export type BrowseQuery = {
  type?: string;
  level?: string;
  area?: string;
  category?: string;
  channel?: string;
  shelf?: string;
  evergreen?: boolean;
  gems?: "" | "1" | "insistent";
  sort?: "hn" | "recent" | "title";
  news?: "hide" | "show";
  cited?: "hide" | "show";
  offset: number;
  limit: number;
};

export type FeedQuery = {
  likes: string[];
  dislikes: string[];
  seen: string[];
  offset: number;
  limit: number;
};

export type SearchQuery = BrowseQuery & { q: string };

export type SearchResult = PageResult<FeedCard> & { weak: boolean };
