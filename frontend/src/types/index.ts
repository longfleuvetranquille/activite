export type EventStatus = "draft" | "published" | "expired" | "cancelled";

export interface Event {
  id: string;
  title: string;
  description: string;
  summary: string;
  date_start: string;
  date_end: string | null;
  location_name: string;
  location_city: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  price_min: number;
  price_max: number;
  currency: string;
  source_url: string;
  source_name: string;
  image_url: string;
  tags_type: string[];
  tags_vibe: string[];
  tags_energy: string[];
  tags_budget: string[];
  tags_time: string[];
  tags_exclusivity: string[];
  tags_location: string[];
  tags_audience: string[];
  tags_deals: string[];
  tags_meta: string[];
  interest_score: number;
  is_featured: boolean;
  status: EventStatus;
  crawled_at: string;
  hash: string;
}

export interface EventListResponse {
  items: Event[];
  total: number;
  page: number;
  per_page: number;
}

export interface DashboardDigest {
  today_count: number;
  week_count: number;
  featured: Event[];
  top_upcoming: Event[];
  deals: Event[];
}

export interface DashboardStats {
  total_events: number;
  total_sources: number;
  last_crawl: string | null;
  events_today: number;
  events_this_week: number;
}

export interface UserPreferences {
  favorite_tags: string[];
  blocked_tags: string[];
  favorite_locations: string[];
  max_budget: number;
  telegram_chat_id: string;
  notif_time: string;
  notif_enabled: boolean;
}

export type TagCategory = Record<string, string>;

export type AllTags = Record<string, TagCategory>;

export interface CrawlTriggerResponse {
  message: string;
  job_id: string | null;
}

export interface CrawlStatusResponse {
  is_running: boolean;
  last_run: string | null;
  last_status: string | null;
}

export interface EventFilters {
  city?: string;
  tag_type?: string;
  tag_vibe?: string;
  min_score?: number;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}
