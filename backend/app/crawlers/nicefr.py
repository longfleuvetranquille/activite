import logging
import re
from datetime import datetime
from html import unescape

import httpx

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

# nice.fr WP REST API — 2143+ events with full ACF metadata
API_BASE = "https://www.nice.fr/wp-json/wp/v2/events"
PER_PAGE = 50


class NiceFrCrawler(BaseCrawler):
    """Crawler for nice.fr (Ville de Nice official agenda).

    Uses the WordPress REST API — no scraping needed.
    Returns concerts, exhibitions, sports, festivals, workshops, etc.
    """

    source_name = "nice_fr"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            async with httpx.AsyncClient(
                timeout=30, follow_redirects=True
            ) as client:
                # Fetch recent/upcoming events (3 pages = ~150 events)
                for page_num in range(1, 4):
                    logger.info("nice.fr API page %d", page_num)
                    resp = await client.get(
                        API_BASE,
                        params={"per_page": PER_PAGE, "page": page_num},
                        headers={"User-Agent": "NiceOutside/1.0"},
                    )

                    if resp.status_code != 200:
                        logger.warning(
                            "nice.fr API returned %d on page %d",
                            resp.status_code,
                            page_num,
                        )
                        break

                    items = resp.json()
                    if not items:
                        break

                    for item in items:
                        try:
                            event = _parse_event(item)
                            if event:
                                events.append(event)
                        except Exception:
                            logger.debug(
                                "Failed to parse nice.fr event %s",
                                item.get("id"),
                                exc_info=True,
                            )

                    # Stop if we've reached the last page
                    total_pages = int(resp.headers.get("x-wp-totalpages", "1"))
                    if page_num >= total_pages:
                        break

        except Exception:
            logger.exception("nice.fr crawler failed")

        logger.info("nice.fr: returning %d events", len(events))
        return events


def _parse_event(item: dict) -> CrawledEvent | None:
    """Parse a single event from the nice.fr WP REST API."""
    title_raw = item.get("title", {}).get("rendered", "")
    title = unescape(re.sub(r"<[^>]+>", "", title_raw)).strip()
    if not title:
        return None

    link = item.get("link", "")
    acf = item.get("acf", {})

    # Parse dates from ACF event_dates
    event_dates = acf.get("event_dates", [])
    date_start = datetime.now()
    date_end = None

    if event_dates:
        first_date = event_dates[0]
        date_start = _parse_acf_date(
            first_date.get("start_date", ""),
            first_date.get("start_time", ""),
        )
        end_raw = first_date.get("end_date", "")
        if end_raw:
            date_end = _parse_acf_date(
                end_raw, first_date.get("end_time", "")
            )

    # Skip past events
    if date_end and date_end < datetime.now():
        return None
    if not date_end and date_start < datetime.now():
        # Single-date event in the past
        return None

    # Parse description
    content_raw = item.get("content", {}).get("rendered", "")
    description = unescape(re.sub(r"<[^>]+>", "", content_raw)).strip()
    # Limit length
    if len(description) > 500:
        description = description[:497] + "..."

    # Pricing
    price_min = 0.0
    if acf.get("free"):
        price_min = 0.0
    elif acf.get("pricing"):
        price_match = re.search(r"(\d+(?:[.,]\d+)?)\s*€", str(acf["pricing"]))
        if price_match:
            price_min = float(price_match.group(1).replace(",", "."))

    # Location
    location_name = str(acf.get("location", "")) or ""
    # acf.place is an ID reference — use it as a fallback indicator
    if not location_name and acf.get("place"):
        location_name = f"Lieu #{acf['place']}"

    # Format — exhibition, concert, etc.
    event_format = acf.get("format", "")

    # Image
    image_url = ""
    featured = item.get("_embedded", {}).get("wp:featuredmedia", [])
    if featured:
        image_url = featured[0].get("source_url", "")

    return CrawledEvent(
        title=title,
        description=description,
        date_start=date_start,
        date_end=date_end,
        location_name=location_name,
        location_city="Nice",
        source_url=link,
        image_url=image_url,
        price_min=price_min,
        price_max=price_min,
        currency="EUR",
    )


def _parse_acf_date(date_str: str, time_str: str = "") -> datetime:
    """Parse ACF date format '20260223' + optional time '10:00:00'."""
    try:
        if len(date_str) == 8:
            dt = datetime.strptime(date_str, "%Y%m%d")
            if time_str:
                parts = time_str.split(":")
                dt = dt.replace(
                    hour=int(parts[0]),
                    minute=int(parts[1]) if len(parts) > 1 else 0,
                )
            return dt
    except (ValueError, IndexError):
        pass
    return datetime.now()
