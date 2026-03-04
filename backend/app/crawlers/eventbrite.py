import asyncio
import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

# Category URLs to crawl on Eventbrite
EVENTBRITE_URLS = [
    "https://www.eventbrite.fr/d/france--nice/events/",
    "https://www.eventbrite.fr/d/france--nice/events--this-weekend/",
    "https://www.eventbrite.fr/d/france--nice/nightlife--events/",
    "https://www.eventbrite.fr/d/france--nice/music--events/",
    "https://www.eventbrite.fr/d/france--cannes/events/",
    "https://www.eventbrite.fr/d/france--monaco/events/",
]

# Map URL patterns to default city
_CITY_FROM_URL = {
    "france--nice": "Nice",
    "france--cannes": "Cannes",
    "france--monaco": "Monaco",
}

# Delay between requests (seconds) to respect rate limiting
REQUEST_DELAY = 1.5


class EventbriteCrawler(BaseCrawler):
    """Crawler for Eventbrite events in the Cote d'Azur area.

    Uses httpx + BeautifulSoup to scrape event listing pages and detail pages.
    """

    source_name = "eventbrite"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []
        seen_urls: set[str] = set()

        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "Palmier/1.0 (event aggregator)",
                    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
                    "Accept": (
                        "text/html,application/xhtml+xml,"
                        "application/xml;q=0.9,*/*;q=0.8"
                    ),
                },
            ) as client:
                for listing_url in EVENTBRITE_URLS:
                    try:
                        page_events = await self._crawl_listing(
                            client, listing_url, seen_urls,
                        )
                        events.extend(page_events)
                        await asyncio.sleep(REQUEST_DELAY)
                    except Exception:
                        logger.exception(
                            "Failed to crawl Eventbrite listing: %s",
                            listing_url,
                        )

        except Exception:
            logger.exception("Eventbrite crawler failed")

        logger.info("Eventbrite: returning %d events", len(events))
        return events

    async def _crawl_listing(
        self,
        client: httpx.AsyncClient,
        listing_url: str,
        seen_urls: set[str],
    ) -> list[CrawledEvent]:
        """Crawl a single Eventbrite listing page."""
        logger.info("Crawling Eventbrite listing: %s", listing_url)
        response = await client.get(listing_url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Determine default city from URL
        default_city = "Nice"
        for pattern, city in _CITY_FROM_URL.items():
            if pattern in listing_url:
                default_city = city
                break

        events: list[CrawledEvent] = []

        # Strategy 1: Find event cards via links to /e/ (event detail pages)
        event_links = soup.select('a[href*="/e/"]')
        event_urls: list[str] = []

        for link in event_links:
            href = link.get("href", "")
            if not href or "/e/" not in href:
                continue
            # Normalize URL
            if href.startswith("/"):
                href = f"https://www.eventbrite.fr{href}"
            # Strip query params and fragments
            href = href.split("?")[0].split("#")[0]
            if href not in seen_urls:
                seen_urls.add(href)
                event_urls.append(href)

        logger.info(
            "Eventbrite listing %s: found %d event URLs",
            listing_url, len(event_urls),
        )

        # Strategy 2: Try to extract structured data from listing page itself
        # Eventbrite often embeds JSON-LD or uses structured card components
        listing_events = _extract_from_listing_page(soup, default_city, seen_urls)
        events.extend(listing_events)

        # Fetch individual event detail pages for any remaining URLs
        # (only those not already found via listing extraction)
        found_urls = {ev.source_url for ev in events}
        remaining_urls = [u for u in event_urls if u not in found_urls]

        for event_url in remaining_urls[:30]:  # cap to avoid too many requests
            try:
                await asyncio.sleep(REQUEST_DELAY)
                ev = await self._crawl_event_page(
                    client, event_url, default_city,
                )
                if ev:
                    events.append(ev)
            except Exception:
                logger.debug(
                    "Failed to crawl Eventbrite event: %s",
                    event_url, exc_info=True,
                )

        return events

    async def _crawl_event_page(
        self,
        client: httpx.AsyncClient,
        event_url: str,
        default_city: str,
    ) -> CrawledEvent | None:
        """Crawl an individual Eventbrite event page."""
        response = await client.get(event_url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Try JSON-LD first (most reliable)
        event = _extract_jsonld_event(soup, event_url, default_city)
        if event:
            return event

        # Fallback: parse meta tags and page content
        return _extract_from_meta_tags(soup, event_url, default_city)


def _extract_from_listing_page(
    soup: BeautifulSoup,
    default_city: str,
    seen_urls: set[str],
) -> list[CrawledEvent]:
    """Extract events from structured data on the listing page."""
    events: list[CrawledEvent] = []

    # Try JSON-LD scripts
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            import json
            data = json.loads(script.string or "")
            if isinstance(data, list):
                for item in data:
                    ev = _parse_jsonld_item(item, "", default_city)
                    if ev and ev.source_url not in seen_urls:
                        seen_urls.add(ev.source_url)
                        events.append(ev)
            elif isinstance(data, dict):
                if data.get("@type") == "ItemList":
                    for elem in data.get("itemListElement", []):
                        item = elem.get("item", elem)
                        ev = _parse_jsonld_item(item, "", default_city)
                        if ev and ev.source_url not in seen_urls:
                            seen_urls.add(ev.source_url)
                            events.append(ev)
                else:
                    ev = _parse_jsonld_item(data, "", default_city)
                    if ev and ev.source_url not in seen_urls:
                        seen_urls.add(ev.source_url)
                        events.append(ev)
        except Exception:
            continue

    return events


def _extract_jsonld_event(
    soup: BeautifulSoup,
    event_url: str,
    default_city: str,
) -> CrawledEvent | None:
    """Extract event data from JSON-LD on an event detail page."""
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            import json
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("@type") == "Event":
                return _parse_jsonld_item(data, event_url, default_city)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("@type") == "Event":
                        return _parse_jsonld_item(item, event_url, default_city)
        except Exception:
            continue
    return None


def _parse_jsonld_item(
    data: dict,
    event_url: str,
    default_city: str,
) -> CrawledEvent | None:
    """Parse a JSON-LD Event item into a CrawledEvent."""
    if not isinstance(data, dict):
        return None

    event_type = data.get("@type", "")
    if event_type not in ("Event", "SocialEvent", "MusicEvent", ""):
        return None

    title = data.get("name", "")
    if not title:
        return None

    # Date
    start_str = data.get("startDate", "")
    if not start_str:
        return None

    try:
        date_start = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        # Strip timezone for consistency with other crawlers
        date_start = date_start.replace(tzinfo=None)
    except (ValueError, TypeError):
        return None

    # Only future events
    if date_start < datetime.now():
        return None

    end_str = data.get("endDate", "")
    date_end = None
    if end_str:
        try:
            date_end = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
            date_end = date_end.replace(tzinfo=None)
        except (ValueError, TypeError):
            pass

    # Location
    location = data.get("location", {})
    venue = ""
    city = default_city
    address = ""
    lat = None
    lng = None

    if isinstance(location, dict):
        venue = location.get("name", "")
        addr_data = location.get("address", {})
        if isinstance(addr_data, dict):
            city = (
                addr_data.get("addressLocality", "")
                or addr_data.get("addressRegion", "")
                or default_city
            )
            address = addr_data.get("streetAddress", "")
        elif isinstance(addr_data, str):
            address = addr_data

        geo = location.get("geo", {})
        if isinstance(geo, dict):
            lat = geo.get("latitude")
            lng = geo.get("longitude")

    # Price
    price_min = 0.0
    price_max = 0.0
    offers = data.get("offers", {})
    if isinstance(offers, dict):
        price_str = offers.get("price", "0")
        try:
            price_min = float(price_str)
        except (ValueError, TypeError):
            pass
        price_max = price_min
        high_str = offers.get("highPrice", "")
        if high_str:
            try:
                price_max = float(high_str)
            except (ValueError, TypeError):
                pass
        low_str = offers.get("lowPrice", "")
        if low_str:
            try:
                price_min = float(low_str)
            except (ValueError, TypeError):
                pass
    elif isinstance(offers, list):
        prices = []
        for offer in offers:
            if isinstance(offer, dict):
                try:
                    prices.append(float(offer.get("price", 0)))
                except (ValueError, TypeError):
                    pass
        if prices:
            price_min = min(prices)
            price_max = max(prices)

    # Image
    image_url = ""
    image_data = data.get("image", "")
    if isinstance(image_data, list) and image_data:
        image_url = image_data[0] if isinstance(image_data[0], str) else ""
    elif isinstance(image_data, str):
        image_url = image_data

    # Description
    description = data.get("description", "")
    if len(description) > 500:
        description = description[:500] + "..."

    # Source URL
    source = event_url or data.get("url", "")

    return CrawledEvent(
        title=title,
        description=description,
        date_start=date_start,
        date_end=date_end,
        location_name=venue,
        location_city=city,
        location_address=address,
        latitude=float(lat) if lat else None,
        longitude=float(lng) if lng else None,
        price_min=price_min,
        price_max=price_max,
        currency="EUR",
        source_url=source,
        image_url=image_url,
    )


def _extract_from_meta_tags(
    soup: BeautifulSoup,
    event_url: str,
    default_city: str,
) -> CrawledEvent | None:
    """Fallback: extract event data from meta tags."""
    title = ""
    og_title = soup.select_one('meta[property="og:title"]')
    if og_title:
        title = og_title.get("content", "")
    if not title:
        title_tag = soup.select_one("title")
        title = title_tag.get_text(strip=True) if title_tag else ""
        # Strip " | Eventbrite" suffix
        title = re.sub(r"\s*\|?\s*Eventbrite\s*$", "", title)

    if not title:
        return None

    # Image
    image_url = ""
    og_image = soup.select_one('meta[property="og:image"]')
    if og_image:
        image_url = og_image.get("content", "")

    # Description
    description = ""
    og_desc = soup.select_one('meta[property="og:description"]')
    if og_desc:
        description = og_desc.get("content", "")

    # Try to find date from the page content
    date_start = None

    # Look for time elements with datetime attribute
    time_el = soup.select_one("time[datetime]")
    if time_el:
        dt_str = time_el.get("datetime", "")
        if dt_str:
            try:
                date_start = datetime.fromisoformat(
                    dt_str.replace("Z", "+00:00")
                )
                date_start = date_start.replace(tzinfo=None)
            except (ValueError, TypeError):
                pass

    # Look for date in meta tags
    if not date_start:
        for meta_name in ("event:start_time", "startDate"):
            meta = soup.select_one(f'meta[property="{meta_name}"]')
            if meta:
                dt_str = meta.get("content", "")
                if dt_str:
                    try:
                        date_start = datetime.fromisoformat(
                            dt_str.replace("Z", "+00:00")
                        )
                        date_start = date_start.replace(tzinfo=None)
                    except (ValueError, TypeError):
                        pass
                    break

    if not date_start:
        return None

    if date_start < datetime.now():
        return None

    # Venue: look for location meta tag
    venue = ""
    loc_meta = soup.select_one('meta[property="event:location"]')
    if loc_meta:
        venue = loc_meta.get("content", "")

    return CrawledEvent(
        title=title,
        description=description[:500] if description else "",
        date_start=date_start,
        location_name=venue,
        location_city=default_city,
        source_url=event_url,
        image_url=image_url,
        currency="EUR",
    )
