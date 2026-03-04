import asyncio
import json
import logging
import re
from datetime import datetime

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

# Nice coordinates for geolocation
NICE_LAT = 43.7102
NICE_LNG = 7.2620

# Cities we accept (Cote d'Azur / PACA Est)
ALLOWED_CITIES = {
    "nice", "monaco", "cannes", "antibes", "hyères", "hyeres",
    "roquebrune", "menton", "grasse", "fréjus", "frejus",
    "saint-tropez", "villefranche", "cagnes", "vence", "mougins",
    "mandelieu", "juan-les-pins", "juan les pins", "vallauris",
    "beausoleil", "cap-d'ail", "èze", "eze", "beaulieu",
    "saint-laurent-du-var", "saint-raphaël", "saint-raphael",
    "côte d'azur", "cote d'azur", "riviera",
}

# Cities we explicitly reject
REJECTED_CITIES = {
    "toulouse", "marseille", "lyon", "paris", "bordeaux", "montpellier",
    "nantes", "lille", "strasbourg", "rennes", "grenoble", "toulon",
    "clermont", "dijon", "angers", "nîmes", "nimes", "perpignan",
    "avignon", "aix-en-provence", "aix en provence",
}

# City page URLs to crawl
CITY_URLS = [
    "https://shotgun.live/fr/cities/nice/events",
    "https://shotgun.live/fr/cities/cannes/events",
    "https://shotgun.live/fr/cities/monaco/events",
]

# Specific venue pages to scrape (known Cote d'Azur venues)
VENUE_URLS = [
    {
        "url": "https://shotgun.live/fr/venues/coachellito",
        "location_name": "Coachellito",
        "location_city": "Nice",
    },
    {
        "url": "https://shotgun.live/fr/venues/high-club-nice",
        "location_name": "High Club",
        "location_city": "Nice",
    },
    {
        "url": "https://shotgun.live/fr/venues/shapeshifter",
        "location_name": "Shapeshifter",
        "location_city": "Nice",
    },
    {
        "url": "https://shotgun.live/fr/venues/la-casa-del-sol",
        "location_name": "La Casa Del Sol",
        "location_city": "Nice",
    },
    {
        "url": "https://shotgun.live/fr/venues/la-cave-wilson",
        "location_name": "La Cave Wilson",
        "location_city": "Nice",
    },
    {
        "url": "https://shotgun.live/fr/venues/glam-club-nice",
        "location_name": "Glam Club",
        "location_city": "Nice",
    },
]


class ShotgunCrawler(BaseCrawler):
    """Crawler for Shotgun (shotgun.live) events in the Cote d'Azur area.

    Intercepts API JSON responses via Playwright to extract structured event
    data, instead of parsing DOM selectors which break on SPA updates.
    """

    source_name = "shotgun"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []
        seen_ids: set[str] = set()
        seen_urls: set[str] = set()

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    geolocation={"latitude": NICE_LAT, "longitude": NICE_LNG},
                    permissions=["geolocation"],
                    locale="fr-FR",
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    ),
                )
                page = await context.new_page()

                # --- Phase 1: Crawl city pages via network interception ---
                for city_url in CITY_URLS:
                    try:
                        city_events = await self._crawl_page_with_interception(
                            page, city_url, seen_ids,
                        )
                        for ev in city_events:
                            if ev.source_url not in seen_urls:
                                seen_urls.add(ev.source_url)
                                events.append(ev)
                    except Exception:
                        logger.exception("Failed to crawl city page: %s", city_url)

                # --- Phase 2: Crawl specific venue pages ---
                for venue_info in VENUE_URLS:
                    try:
                        venue_events = await self._crawl_page_with_interception(
                            page,
                            venue_info["url"],
                            seen_ids,
                            force_venue=venue_info["location_name"],
                            force_city=venue_info["location_city"],
                        )
                        for ev in venue_events:
                            if ev.source_url not in seen_urls:
                                seen_urls.add(ev.source_url)
                                events.append(ev)
                    except Exception:
                        logger.exception(
                            "Failed to crawl venue: %s", venue_info["url"]
                        )

                await browser.close()

        except Exception:
            logger.exception("Shotgun crawler failed")

        logger.info("Shotgun: returning %d events", len(events))
        return events

    async def _crawl_page_with_interception(
        self,
        page,
        url: str,
        seen_ids: set[str],
        force_venue: str = "",
        force_city: str = "",
    ) -> list[CrawledEvent]:
        """Navigate to a Shotgun page and intercept JSON API responses."""
        intercepted_events: list[dict] = []

        async def _on_response(response):
            """Capture JSON responses that contain event data."""
            try:
                resp_url = response.url
                content_type = response.headers.get("content-type", "")

                if "application/json" not in content_type:
                    return

                # Shotgun API patterns: look for responses with event data
                if response.status != 200:
                    return

                body = await response.text()
                if not body or len(body) < 50:
                    return

                data = json.loads(body)
                _extract_events_from_json(data, intercepted_events, resp_url)

            except Exception:
                pass  # silently skip non-JSON or malformed responses

        page.on("response", _on_response)

        try:
            logger.info("Crawling Shotgun page: %s", url)
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(3000)

            # Scroll down to trigger lazy loading of more events
            for _ in range(5):
                await page.evaluate("window.scrollBy(0, 1000)")
                await page.wait_for_timeout(1500)

            # Wait a bit more for final API responses
            await page.wait_for_timeout(2000)

        except Exception:
            logger.exception("Navigation failed for %s", url)
        finally:
            page.remove_listener("response", _on_response)

        logger.info(
            "Shotgun intercepted %d raw events from %s",
            len(intercepted_events), url,
        )

        # Parse intercepted JSON events into CrawledEvents
        events: list[CrawledEvent] = []
        for raw in intercepted_events:
            event_id = str(raw.get("_id") or raw.get("id") or "")
            if event_id and event_id in seen_ids:
                continue
            if event_id:
                seen_ids.add(event_id)

            try:
                ev = _parse_api_event(raw, force_venue, force_city)
                if ev:
                    events.append(ev)
            except Exception:
                logger.debug(
                    "Failed to parse Shotgun API event: %s",
                    raw.get("title", "?"),
                    exc_info=True,
                )

        # Fallback: if interception yielded nothing, try DOM extraction
        if not events:
            logger.info("No intercepted events, falling back to DOM for %s", url)
            events = await self._fallback_dom_extraction(
                page, seen_ids, force_venue, force_city,
            )

        return events

    async def _fallback_dom_extraction(
        self,
        page,
        seen_ids: set[str],
        force_venue: str = "",
        force_city: str = "",
    ) -> list[CrawledEvent]:
        """Extract events from the rendered DOM as a fallback."""
        events: list[CrawledEvent] = []

        try:
            raw_events = await page.evaluate("""() => {
                const results = [];
                // Look for event links in the page
                const links = document.querySelectorAll('a[href*="/events/"], a[href*="/festivals/"]');
                for (const link of links) {
                    const href = link.getAttribute('href') || '';
                    if (!href || href.includes('/cities/')) continue;

                    const img = link.querySelector('img');
                    const title = img ? (img.getAttribute('alt') || '') : '';
                    const imgSrc = img ? (img.getAttribute('src') || '') : '';
                    const text = link.innerText || '';

                    if (!title && !text) continue;

                    results.push({
                        href: href,
                        title: title,
                        image_url: imgSrc,
                        text: text,
                    });
                }
                return results;
            }""")

            for raw in raw_events:
                href = raw.get("href", "")
                if not href:
                    continue

                full_url = (
                    f"https://shotgun.live{href}"
                    if href.startswith("/")
                    else href
                )

                title = raw.get("title", "") or ""
                text = raw.get("text", "")
                image_url = raw.get("image_url", "")

                if not title:
                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    title = lines[0] if lines else ""

                if not title:
                    continue

                # Try to extract date from text lines
                date_start = None
                venue = force_venue
                city = force_city
                price_min = 0.0

                for line in text.split("\n"):
                    line = line.strip()
                    if not line:
                        continue

                    if re.search(
                        r"(lun|mar|mer|jeu|ven|sam|dim)\.\s*\d+",
                        line, re.IGNORECASE,
                    ):
                        date_start = _parse_date_fr(line)
                        continue

                    price_match = re.search(r"([\d,]+)\s*€", line)
                    if price_match:
                        price_min = float(
                            price_match.group(1).replace(",", ".")
                        )
                        continue

                    if not venue and line != title:
                        venue = line

                if not city:
                    city = _guess_city(f"{title} {venue}")

                if not city:
                    continue

                if _is_rejected(title, venue, city):
                    continue

                if not date_start:
                    continue

                events.append(CrawledEvent(
                    title=title,
                    date_start=date_start,
                    location_name=venue,
                    location_city=city,
                    source_url=full_url,
                    image_url=image_url,
                    price_min=price_min,
                    price_max=price_min,
                    currency="EUR",
                ))

        except Exception:
            logger.exception("DOM fallback extraction failed")

        logger.info("Shotgun DOM fallback: found %d events", len(events))
        return events


def _extract_events_from_json(
    data: dict | list, out: list[dict], resp_url: str,
) -> None:
    """Recursively extract event-like objects from JSON API response."""
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                _extract_events_from_json(item, out, resp_url)
        return

    if not isinstance(data, dict):
        return

    # Check if this dict looks like an event
    if _looks_like_event(data):
        out.append(data)
        return

    # Recurse into common API wrapper patterns
    for key in ("data", "events", "items", "results", "hits", "content"):
        if key in data:
            val = data[key]
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict):
                        _extract_events_from_json(item, out, resp_url)
            elif isinstance(val, dict):
                _extract_events_from_json(val, out, resp_url)


def _looks_like_event(d: dict) -> bool:
    """Heuristic: does this dict look like a Shotgun event?"""
    # Must have a title/name
    has_title = bool(d.get("title") or d.get("name"))
    # Must have some date-like field
    has_date = bool(
        d.get("startDate") or d.get("start_date") or d.get("startTime")
        or d.get("start_time") or d.get("date") or d.get("startAt")
        or d.get("start_at") or d.get("startsAt") or d.get("starts_at")
    )
    # Must have a slug or URL or ID
    has_id = bool(
        d.get("_id") or d.get("id") or d.get("slug") or d.get("url")
    )
    return has_title and has_date and has_id


def _parse_api_event(
    raw: dict,
    force_venue: str = "",
    force_city: str = "",
) -> CrawledEvent | None:
    """Parse a JSON event object from Shotgun's API into a CrawledEvent."""
    title = raw.get("title") or raw.get("name") or ""
    if not title:
        return None

    # Date
    date_str = (
        raw.get("startDate") or raw.get("start_date") or raw.get("startTime")
        or raw.get("start_time") or raw.get("date") or raw.get("startAt")
        or raw.get("start_at") or raw.get("startsAt") or raw.get("starts_at")
        or ""
    )
    date_start = _parse_iso_date(date_str)
    if not date_start:
        return None

    date_end_str = (
        raw.get("endDate") or raw.get("end_date") or raw.get("endTime")
        or raw.get("end_time") or raw.get("endAt") or raw.get("end_at")
        or raw.get("endsAt") or raw.get("ends_at") or ""
    )
    date_end = _parse_iso_date(date_end_str) if date_end_str else None

    # Venue / location
    venue = force_venue
    city = force_city

    venue_data = raw.get("venue") or raw.get("location") or {}
    if isinstance(venue_data, dict):
        if not venue:
            venue = (
                venue_data.get("name") or venue_data.get("title") or ""
            )
        if not city:
            city = (
                venue_data.get("city") or venue_data.get("locality") or ""
            )
    elif isinstance(venue_data, str) and not venue:
        venue = venue_data

    # Also check top-level location fields
    if not city:
        city = raw.get("city") or raw.get("locality") or ""
    if not venue:
        venue = raw.get("venueName") or raw.get("venue_name") or ""

    # City validation
    if not city:
        city = _guess_city(f"{title} {venue}")

    if not city:
        logger.debug("Rejected Shotgun event (no CDA city): %s", title)
        return None

    if _is_rejected(title, venue, city):
        return None

    # Price
    price_min = 0.0
    price_max = 0.0
    price_data = raw.get("price") or raw.get("pricing") or {}
    if isinstance(price_data, dict):
        price_min = float(price_data.get("min") or price_data.get("amount") or 0)
        price_max = float(price_data.get("max") or price_min)
    elif isinstance(price_data, (int, float)):
        price_min = float(price_data)
        price_max = price_min

    # Image
    image_url = ""
    image_data = raw.get("image") or raw.get("cover") or raw.get("coverImage") or {}
    if isinstance(image_data, dict):
        image_url = (
            image_data.get("url") or image_data.get("src")
            or image_data.get("original") or ""
        )
    elif isinstance(image_data, str):
        image_url = image_data
    if not image_url:
        image_url = raw.get("imageUrl") or raw.get("image_url") or ""

    # Source URL
    slug = raw.get("slug") or raw.get("_id") or raw.get("id") or ""
    source_url = raw.get("url") or ""
    if not source_url and slug:
        source_url = f"https://shotgun.live/fr/events/{slug}"

    # Sold out
    is_sold_out = bool(
        raw.get("soldOut") or raw.get("sold_out") or raw.get("isSoldOut")
    )

    # Address
    address = ""
    if isinstance(venue_data, dict):
        address = venue_data.get("address") or venue_data.get("formattedAddress") or ""

    # Coordinates
    lat = None
    lng = None
    if isinstance(venue_data, dict):
        geo = venue_data.get("geo") or venue_data.get("coordinates") or {}
        if isinstance(geo, dict):
            lat = geo.get("lat") or geo.get("latitude")
            lng = geo.get("lng") or geo.get("lon") or geo.get("longitude")

    return CrawledEvent(
        title=title,
        date_start=date_start,
        date_end=date_end,
        location_name=venue,
        location_city=city.title(),
        location_address=address,
        latitude=float(lat) if lat else None,
        longitude=float(lng) if lng else None,
        source_url=source_url,
        image_url=image_url,
        price_min=price_min,
        price_max=price_max,
        currency="EUR",
        is_sold_out=is_sold_out,
    )


def _parse_iso_date(text: str) -> datetime | None:
    """Parse an ISO-ish date string."""
    if not text:
        return None
    # Handle unix timestamps (seconds or milliseconds)
    if isinstance(text, (int, float)):
        ts = text if text < 1e11 else text / 1000
        return datetime.fromtimestamp(ts)

    text = str(text).strip()

    # Try numeric timestamp
    if text.isdigit():
        ts = int(text)
        if ts > 1e11:
            ts = ts / 1000
        return datetime.fromtimestamp(ts)

    # Try ISO format
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue

    # dateutil as last resort
    try:
        from dateutil import parser as dateutil_parser
        return dateutil_parser.parse(text)
    except Exception:
        return None


def _parse_date_fr(text: str) -> datetime | None:
    """Parse French date text like 'sam. 7 fevr.' or 'ven. 14 mars | 20:00'."""
    from dateutil import parser as dateutil_parser

    replacements = {
        "lun.": "Mon", "mar.": "Tue", "mer.": "Wed", "jeu.": "Thu",
        "ven.": "Fri", "sam.": "Sat", "dim.": "Sun",
        "janv.": "Jan", "févr.": "Feb", "mars": "Mar", "avr.": "Apr",
        "mai": "May", "juin": "Jun", "juil.": "Jul", "août": "Aug",
        "sept.": "Sep", "oct.": "Oct", "nov.": "Nov", "déc.": "Dec",
        "janvier": "January", "février": "February",
        "avril": "April", "juillet": "July",
        "septembre": "September", "octobre": "October",
        "novembre": "November", "décembre": "December",
    }

    normalized = text.lower().strip()
    normalized = re.sub(r"\|.*", "", normalized).strip()

    for fr_word, en_word in replacements.items():
        normalized = normalized.replace(fr_word, en_word)

    try:
        return dateutil_parser.parse(normalized, dayfirst=True)
    except (ValueError, TypeError):
        return None


def _guess_city(text: str) -> str:
    """Try to match a Cote d'Azur city from the given text."""
    lower = text.lower()
    for allowed in ALLOWED_CITIES:
        if allowed in lower:
            return allowed.title()
    return ""


def _is_rejected(title: str, venue: str, city: str) -> bool:
    """Check if the event should be rejected based on city/keyword filters."""
    all_text = f"{title} {venue} {city}".lower()
    for rejected in REJECTED_CITIES:
        if rejected in all_text:
            logger.debug("Rejected event from %s: %s", rejected, title)
            return True
    return False
