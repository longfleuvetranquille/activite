from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class CrawledEvent:
    """Raw event data extracted by a crawler."""

    title: str
    description: str = ""
    date_start: datetime = field(default_factory=datetime.now)
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
    image_url: str = ""


class BaseCrawler(ABC):
    """Abstract base class for all event crawlers."""

    source_name: str = "unknown"

    @abstractmethod
    async def crawl(self) -> list[CrawledEvent]:
        """Crawl the source and return a list of raw events."""
        ...
