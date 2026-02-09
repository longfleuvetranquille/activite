import logging
import re
from datetime import datetime

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

# Nice coordinates for geolocation
NICE_LAT = 43.7102
NICE_LNG = 7.2620

# Cities we accept (Côte d'Azur / PACA Est)
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

# Keywords in titles that indicate events outside Côte d'Azur
REJECTED_KEYWORDS = {
    "nuits sonores", "brunch electronik bordeaux", "dystopia 2026 • rennes",
}

# Specific venue pages to scrape (bypass city filter)
VENUE_URLS = [
    {
        "url": "https://shotgun.live/fr/venues/coachellito",
        "location_name": "Coachellito",
        "location_city": "Nice",
    },
]


class ShotgunCrawler(BaseCrawler):
    """Crawler for Shotgun (shotgun.live) events in the Côte d'Azur area.

    Uses the homepage with Nice geolocation to get locally relevant events,
    then visits each event page to extract full details.
    """

    source_name = "shotgun"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    geolocation={"latitude": NICE_LAT, "longitude": NICE_LNG},
                    permissions=["geolocation"],
                    locale="fr-FR",
                )
                page = await context.new_page()

                # Load Shotgun homepage — geolocation filters to Côte d'Azur
                logger.info("Crawling Shotgun homepage with Nice geolocation")
                await page.goto(
                    "https://shotgun.live/fr",
                    wait_until="networkidle",
                    timeout=30000,
                )
                await page.wait_for_timeout(3000)

                # Collect event/festival links from the homepage
                link_els = await page.query_selector_all(
                    'a[href*="/fr/events/"], a[href*="/fr/festivals/"]'
                )

                seen_hrefs: set[str] = set()
                event_links: list[dict] = []

                for el in link_els:
                    href = await el.get_attribute("href") or ""
                    if not href or href in seen_hrefs:
                        continue
                    seen_hrefs.add(href)

                    full_url = (
                        f"https://shotgun.live{href}"
                        if href.startswith("/")
                        else href
                    )

                    # Parse the card text: title | venue | date | price | tags
                    text = (await el.inner_text()).strip()
                    lines = [l.strip() for l in text.split("\n") if l.strip() and l.strip() != "|"]

                    # Try to get image alt (= title)
                    img = await el.query_selector("img")
                    img_alt = await img.get_attribute("alt") if img else ""
                    img_src = await img.get_attribute("src") if img else ""

                    title = img_alt or (lines[0] if lines else "")
                    if not title:
                        continue

                    event_links.append({
                        "title": title,
                        "url": full_url,
                        "lines": lines,
                        "image_url": img_src or "",
                    })

                logger.info("Shotgun: found %d event links", len(event_links))

                # Parse each event card from homepage text
                for info in event_links:
                    try:
                        event = _parse_event_card(info)
                        if event:
                            events.append(event)
                    except Exception:
                        logger.debug("Failed to parse Shotgun event: %s", info["title"], exc_info=True)

                # Crawl specific venue pages
                for venue_info in VENUE_URLS:
                    try:
                        logger.info("Crawling Shotgun venue: %s", venue_info["url"])
                        await page.goto(
                            venue_info["url"],
                            wait_until="networkidle",
                            timeout=30000,
                        )
                        await page.wait_for_timeout(3000)

                        venue_link_els = await page.query_selector_all(
                            'a[href*="/fr/events/"], a[href*="/fr/festivals/"]'
                        )

                        venue_event_links: list[dict] = []
                        for el in venue_link_els:
                            href = await el.get_attribute("href") or ""
                            if not href or href in seen_hrefs:
                                continue
                            seen_hrefs.add(href)

                            full_url = (
                                f"https://shotgun.live{href}"
                                if href.startswith("/")
                                else href
                            )

                            text = (await el.inner_text()).strip()
                            lines = [l.strip() for l in text.split("\n") if l.strip() and l.strip() != "|"]

                            img = await el.query_selector("img")
                            img_alt = await img.get_attribute("alt") if img else ""
                            img_src = await img.get_attribute("src") if img else ""

                            title = img_alt or (lines[0] if lines else "")
                            if not title:
                                continue

                            venue_event_links.append({
                                "title": title,
                                "url": full_url,
                                "lines": lines,
                                "image_url": img_src or "",
                            })

                        logger.info("Shotgun venue %s: found %d events", venue_info["location_name"], len(venue_event_links))

                        for info in venue_event_links:
                            try:
                                event = _parse_event_card(
                                    info,
                                    force_venue=venue_info["location_name"],
                                    force_city=venue_info["location_city"],
                                )
                                if event:
                                    events.append(event)
                            except Exception:
                                logger.debug("Failed to parse venue event: %s", info["title"], exc_info=True)

                    except Exception:
                        logger.exception("Failed to crawl venue: %s", venue_info["url"])

                await browser.close()

        except Exception:
            logger.exception("Shotgun crawler failed")

        logger.info("Shotgun: returning %d events", len(events))
        return events


def _parse_event_card(
    info: dict,
    force_venue: str = "",
    force_city: str = "",
) -> CrawledEvent | None:
    """Parse an event from the homepage card info.

    Args:
        info: Dict with title, url, lines, image_url.
        force_venue: If set, override venue name (for venue-specific pages).
        force_city: If set, override city and skip city filtering.
    """
    title = info["title"]
    lines = info["lines"]
    url = info["url"]
    image_url = info["image_url"]

    venue = ""
    city = ""
    date_start: datetime | None = None
    price_min = 0.0

    for line in lines:
        # Skip the title itself
        if line == title:
            continue

        # Date pattern: "sam. 7 févr." or "ven. 14 mars"
        if re.search(r"(lun|mar|mer|jeu|ven|sam|dim)\.\s*\d+", line, re.IGNORECASE):
            date_start = _parse_date_fr(line)
            continue

        # Time pattern: "20:00" or "23:30"
        if re.match(r"^\d{1,2}:\d{2}$", line):
            continue

        # Price pattern: "11,00 €" or "35,90 €"
        price_match = re.search(r"([\d,]+)\s*€", line)
        if price_match:
            price_min = float(price_match.group(1).replace(",", "."))
            continue

        # Skip known non-venue text
        if line in ("Liste d'attente", "|"):
            continue

        # Genre tags (all uppercase short words)
        if line.isupper() and len(line) < 20:
            continue

        # Otherwise it's likely the venue or city
        if not venue:
            # Check if it contains a city name
            known_cities = ["Nice", "Monaco", "Cannes", "Antibes", "Hyères",
                          "Roquebrune", "Menton", "Grasse", "Toulon", "Fréjus"]
            for kc in known_cities:
                if kc.lower() in line.lower():
                    city = kc
                    break
            venue = line

    # Apply force overrides for venue-specific pages
    if force_venue:
        venue = force_venue
    if force_city:
        city = force_city

    if not city:
        # Try to guess city from title or venue
        text = f"{title} {venue}".lower()
        for allowed in ALLOWED_CITIES:
            if allowed in text:
                city = allowed.title()
                break

    if not city:
        # No identifiable Côte d'Azur city — reject the event
        logger.debug("Rejected event (no CDA city found): %s", title)
        return None

    # Skip city filtering for venue-specific pages (already known location)
    if not force_city:
        # Filter out events from cities outside Côte d'Azur
        all_text = f"{title} {venue} {city}".lower()
        for rejected in REJECTED_CITIES:
            if rejected in all_text:
                logger.debug("Rejected event from %s: %s", rejected, title)
                return None
        for keyword in REJECTED_KEYWORDS:
            if keyword in all_text:
                logger.debug("Rejected event by keyword %s: %s", keyword, title)
                return None

    if not date_start:
        logger.debug("Rejected event (no date found): %s", title)
        return None

    return CrawledEvent(
        title=title,
        date_start=date_start,
        location_name=venue,
        location_city=city,
        source_url=url,
        image_url=image_url,
        price_min=price_min,
        price_max=price_min,
        currency="EUR",
    )


def _parse_date_fr(text: str) -> datetime | None:
    """Parse French date text like 'sam. 7 févr.' or 'ven. 14 mars | 20:00'."""
    from dateutil import parser as dateutil_parser

    replacements = {
        "lun.": "Mon", "mar.": "Tue", "mer.": "Wed", "jeu.": "Thu",
        "ven.": "Fri", "sam.": "Sat", "dim.": "Sun",
        "janv.": "Jan", "févr.": "Feb", "mars": "Mar", "avr.": "Apr",
        "mai": "May", "juin": "Jun", "juil.": "Jul", "août": "Aug",
        "sept.": "Sep", "oct.": "Oct", "nov.": "Nov", "déc.": "Dec",
        "janvier": "January", "février": "February", "mars": "March",
        "avril": "April", "juillet": "July",
        "septembre": "September", "octobre": "October",
        "novembre": "November", "décembre": "December",
    }

    normalized = text.lower().strip()
    # Remove time and pipes
    normalized = re.sub(r"\|.*", "", normalized).strip()

    for fr_word, en_word in replacements.items():
        normalized = normalized.replace(fr_word, en_word)

    try:
        return dateutil_parser.parse(normalized, dayfirst=True)
    except (ValueError, TypeError):
        return None
