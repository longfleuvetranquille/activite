import type {
  Event,
  EventListResponse,
  EventFilters,
  DashboardDigest,
  DashboardStats,
  UserPreferences,
  AllTags,
  TagCategory,
  CrawlTriggerResponse,
  CrawlStatusResponse,
} from "@/types";

/**
 * Parse a PocketBase datetime as local French time.
 * PocketBase stores naive datetimes with a Z suffix, but crawlers
 * record local Europe/Paris times. Stripping the Z makes JS treat
 * the value as local time (correct when browser is in CET/CEST).
 */
export function parseEventDate(iso: string): Date {
  return new Date(iso.replace(/Z$/i, ""));
}

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${getApiBase()}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Unknown error");
    throw new Error(
      `API error ${res.status} on ${endpoint}: ${errorBody}`
    );
  }

  return res.json() as Promise<T>;
}

// --- Events ---

export async function getEvents(
  params?: EventFilters
): Promise<EventListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.city) searchParams.set("city", params.city);
  if (params?.tag_type) searchParams.set("tag_type", params.tag_type);
  if (params?.tag_vibe) searchParams.set("tag_vibe", params.tag_vibe);
  if (params?.min_score)
    searchParams.set("min_score", String(params.min_score));
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  return fetchAPI<EventListResponse>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function getEvent(id: string): Promise<Event> {
  return fetchAPI<Event>(`/api/events/${id}`);
}

export async function getTodayEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/today");
}

export async function getWeekEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/week");
}

export async function getWeekendEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/weekend");
}

export async function getMonthEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/month");
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/featured");
}

export async function getUpcomingEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>("/api/events/upcoming");
}

// --- Dashboard ---

export async function getDashboardDigest(): Promise<DashboardDigest> {
  return fetchAPI<DashboardDigest>("/api/dashboard/digest");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>("/api/dashboard/stats");
}

// --- Tags ---

export async function getAllTags(): Promise<AllTags> {
  return fetchAPI<AllTags>("/api/tags");
}

export async function getTagsByCategory(
  category: string
): Promise<TagCategory> {
  return fetchAPI<TagCategory>(`/api/tags/${category}`);
}

// --- Crawl ---

export async function triggerCrawl(): Promise<CrawlTriggerResponse> {
  return fetchAPI<CrawlTriggerResponse>("/api/crawl/trigger", {
    method: "POST",
  });
}

export async function getCrawlStatus(): Promise<CrawlStatusResponse> {
  return fetchAPI<CrawlStatusResponse>("/api/crawl/status");
}

// --- Preferences ---

export async function getPreferences(): Promise<UserPreferences> {
  return fetchAPI<UserPreferences>("/api/preferences");
}

export async function updatePreferences(
  prefs: UserPreferences
): Promise<UserPreferences> {
  return fetchAPI<UserPreferences>("/api/preferences", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}
