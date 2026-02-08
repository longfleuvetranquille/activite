from datetime import datetime

from pydantic import BaseModel, HttpUrl

from app.models.event import EventStatus


class EventBase(BaseModel):
    title: str
    description: str = ""
    summary: str = ""
    date_start: datetime
    date_end: datetime | None = None
    location_name: str = ""
    location_city: str = ""
    location_address: str = ""
    latitude: float | None = None
    longitude: float | None = None
    price_min: float = 0
    price_max: float = 0
    currency: str = "EUR"
    source_url: str = ""
    source_name: str = ""
    image_url: str = ""
    tags_type: list[str] = []
    tags_vibe: list[str] = []
    tags_energy: list[str] = []
    tags_budget: list[str] = []
    tags_time: list[str] = []
    tags_exclusivity: list[str] = []
    tags_location: list[str] = []
    tags_audience: list[str] = []
    tags_deals: list[str] = []
    tags_meta: list[str] = []
    interest_score: int = 0
    is_featured: bool = False
    status: EventStatus = EventStatus.DRAFT


class EventCreate(EventBase):
    hash: str = ""


class EventRead(EventBase):
    id: str
    crawled_at: datetime
    hash: str

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    items: list[EventRead]
    total: int
    page: int
    per_page: int


class SourceRead(BaseModel):
    id: str
    name: str
    base_url: str
    crawler_type: str
    is_active: bool
    last_crawl: datetime | None
    reliability: int

    model_config = {"from_attributes": True}


class CrawlLogRead(BaseModel):
    id: str
    source: str
    started_at: datetime
    finished_at: datetime | None
    status: str
    events_found: int
    events_new: int
    error_message: str = ""

    model_config = {"from_attributes": True}


class UserPreferences(BaseModel):
    favorite_tags: list[str] = []
    blocked_tags: list[str] = []
    favorite_locations: list[str] = []
    max_budget: float = 0
    telegram_chat_id: str = ""
    notif_time: str = "08:00"
    notif_enabled: bool = True


class DashboardDigest(BaseModel):
    today_count: int
    week_count: int
    featured: list[EventRead]
    top_today: list[EventRead]
    deals: list[EventRead]


class DashboardStats(BaseModel):
    total_events: int
    total_sources: int
    last_crawl: datetime | None
    events_today: int
    events_this_week: int


class CrawlTriggerResponse(BaseModel):
    message: str
    job_id: str | None = None


class CrawlStatusResponse(BaseModel):
    is_running: bool
    last_run: datetime | None
    last_status: str | None
