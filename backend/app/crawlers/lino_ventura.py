import json
import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

# nice.fr AJAX endpoint for venue-specific event listings
AJAX_URL = "https://www.nice.fr/wp-admin/admin-ajax.php"
PLACE_ID = 1962  # Théâtre Lino Ventura

# Only keep concerts and comedy shows
_ALLOWED_TYPES = {"concert", "humour"}



class LinoVenturaCrawler(BaseCrawler):
    """Crawler for Théâtre Lino Ventura events via nice.fr AJAX API.

    Uses the mnca_load_posts AJAX action with place relation filter.
    """

    source_name = "lino_ventura"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            # First, get a fresh nonce from the venue page
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "NiceOutside/1.0 (event aggregator)",
                    "Accept-Language": "fr-FR,fr;q=0.9",
                },
            ) as client:
                nonce = await _fetch_nonce(client)
                if not nonce:
                    logger.error("Could not fetch nonce for Lino Ventura")
                    return []

                # Fetch events via AJAX
                query = json.dumps(
                    {
                        "posts_per_page": 50,
                        "post_type": "event",
                        "evd_rel_query": {
                            "type": "post",
                            "subtype": "place",
                            "relation_id": PLACE_ID,
                        },
                        "paged": 1,
                    }
                )

                resp = await client.post(
                    AJAX_URL,
                    data={
                        "action": "mnca_load_posts",
                        "nonce": nonce,
                        "query_args": query,
                        "format": "place-events",
                        "template_vars": "[]",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                if not data.get("success"):
                    logger.warning("Lino Ventura AJAX returned success=false")
                    return []

                html = data.get("data", {}).get("content", "")
                if not html:
                    return []

                soup = BeautifulSoup(html, "html.parser")
                articles = soup.select("article")
                now = datetime.now()

                seen_titles: set[str] = set()
                for article in articles:
                    try:
                        event = _parse_article(article, now)
                        if event and event.title not in seen_titles:
                            events.append(event)
                            seen_titles.add(event.title)
                    except Exception:
                        logger.debug(
                            "Failed to parse Lino Ventura event", exc_info=True
                        )

        except Exception:
            logger.exception("Lino Ventura crawler failed")

        logger.info("Lino Ventura: returning %d events", len(events))
        return events


async def _fetch_nonce(client: httpx.AsyncClient) -> str | None:
    """Fetch a fresh AJAX nonce from the venue page."""
    try:
        resp = await client.get(
            "https://www.nice.fr/lieux/theatre-lino-ventura/"
        )
        resp.raise_for_status()
        match = re.search(r'"nonce"\s*:\s*"([a-f0-9]+)"', resp.text)
        return match.group(1) if match else None
    except Exception:
        logger.exception("Failed to fetch nonce")
        return None


def _parse_article(article, now: datetime) -> CrawledEvent | None:
    """Parse a single <article> from the AJAX HTML response."""
    # Title
    name_el = article.select_one('[itemprop="name"]')
    title = name_el.get_text(strip=True) if name_el else ""
    if not title or title == "Théâtre Lino Ventura":
        return None

    # Date
    date_el = article.select_one('[itemprop="startDate"]')
    if not date_el:
        return None
    date_str = date_el.get("content", "")
    if not date_str:
        return None

    # Parse date + try to extract time from the detail link or text
    try:
        date_start = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None

    # Try to get time from detail link URL pattern: /slug/20260214-2000/
    detail_link = ""
    for a_el in article.select("a[href*='/agenda/']"):
        href = a_el.get("href", "").replace("\\/", "/")
        time_match = re.search(r"/(\d{8})-(\d{2})(\d{2})/?$", href)
        if time_match:
            detail_link = href
            date_start = date_start.replace(
                hour=int(time_match.group(2)),
                minute=int(time_match.group(3)),
            )
            break
    # Fallback: first link with /agenda/ that's not a /type/ link
    if not detail_link:
        for a_el in article.select("a[href*='/agenda/']"):
            href = a_el.get("href", "").replace("\\/", "/")
            if "/type/" not in href:
                detail_link = href
                break

    # Only future events
    if date_start < now:
        return None

    # Image
    image_url = ""
    img_el = article.select_one('img[itemprop="image"]')
    if img_el:
        src = img_el.get("src", "").replace("\\/", "/")
        if src:
            image_url = src

    # Event type from category link
    type_el = article.select_one(".cat-links")
    event_type = type_el.get_text(strip=True) if type_el else ""

    # Filter: only concerts and humour
    if event_type.lower() not in _ALLOWED_TYPES:
        return None

    # Extract excerpt/description text
    excerpt_el = article.select_one(".entry-excerpt")
    excerpt = excerpt_el.get_text(strip=True) if excerpt_el else ""

    # Build description
    parts = []
    if event_type:
        parts.append(f"{event_type} au Théâtre Lino Ventura.")
    if excerpt:
        parts.append(excerpt)
    description = " ".join(parts)

    return CrawledEvent(
        title=title,
        description=description,
        date_start=date_start,
        location_name="Théâtre Lino Ventura",
        location_city="Nice",
        source_url=detail_link or "https://www.nice.fr/lieux/theatre-lino-ventura/",
        image_url=image_url,
        price_min=-1.0,
        price_max=-1.0,
        currency="EUR",
    )
