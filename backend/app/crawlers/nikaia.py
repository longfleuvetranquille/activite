import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

PROGRAMMATION_URL = "https://www.nikaia.fr/programmation"
MAX_PAGES = 6


class NikaiaCrawler(BaseCrawler):
    """Crawler for Palais Nikaia events (nikaia.fr).

    Uses Schema.org microdata (article.bloc-event) for clean extraction.
    Paginates through all pages.
    """

    source_name = "nikaia"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "NiceOutside/1.0 (event aggregator)",
                    "Accept-Language": "fr-FR,fr;q=0.9",
                },
            ) as client:
                for page_num in range(1, MAX_PAGES + 1):
                    url = PROGRAMMATION_URL
                    if page_num > 1:
                        url = f"{PROGRAMMATION_URL}?page_programmation={page_num}"

                    logger.info("Crawling Nikaia page %d", page_num)
                    response = await client.get(url)
                    response.raise_for_status()

                    soup = BeautifulSoup(response.text, "html.parser")
                    cards = soup.select("article.bloc-event")

                    if not cards:
                        break

                    now = datetime.now()

                    for card in cards:
                        try:
                            event = _parse_card(card, now)
                            if event:
                                events.append(event)
                        except Exception:
                            logger.debug("Failed to parse Nikaia card", exc_info=True)

        except Exception:
            logger.exception("Nikaia crawler failed")

        logger.info("Nikaia: returning %d events", len(events))
        return events


def _parse_card(card, now: datetime) -> CrawledEvent | None:
    """Parse a Nikaia article.bloc-event into a CrawledEvent."""
    # Title: prefer meta[itemprop="performer"] (untruncated), fallback to h1
    performer_meta = card.select_one('meta[itemprop="performer"]')
    title = performer_meta["content"] if performer_meta else ""
    if not title:
        h1 = card.select_one('h1[itemprop="name"]')
        title = h1.get_text(strip=True) if h1 else ""
    if not title or len(title) < 2:
        return None

    # Date: use time[itemprop="startDate"] datetime attribute (ISO format)
    time_el = card.select_one('time[itemprop="startDate"]')
    if not time_el:
        return None
    dt_str = time_el.get("datetime", "")
    if not dt_str:
        return None
    try:
        date_start = datetime.fromisoformat(dt_str)
    except ValueError:
        return None

    # Only future events
    if date_start < now:
        return None

    # Link
    link_el = card.select_one(".imageholder a") or card.select_one("a.button.action")
    link = ""
    if link_el:
        link = link_el.get("href", "")
        if link and not link.startswith("http"):
            link = f"https://www.nikaia.fr{link}"

    # Image: prefer meta[itemprop="image"] (full URL)
    image_meta = card.select_one('meta[itemprop="image"]')
    image_url = image_meta["content"] if image_meta else ""
    if not image_url:
        img_el = card.select_one(".imageholder img")
        if img_el:
            image_url = img_el.get("src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = f"https://www.nikaia.fr{image_url}"

    # Price: from meta[itemprop="offers"]
    price_min = -1.0
    offers_meta = card.select_one('meta[itemprop="offers"]')
    if offers_meta:
        offers_text = offers_meta.get("content", "")
        if "complet" in offers_text.lower():
            price_min = -1.0
        else:
            # "De 33 à 45€" or "49€"
            price_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:€|EUR)", offers_text)
            if price_match:
                price_min = float(price_match.group(1).replace(",", "."))

    return CrawledEvent(
        title=title,
        date_start=date_start,
        location_name="Palais Nikaia",
        location_city="Nice",
        source_url=link or PROGRAMMATION_URL,
        image_url=image_url,
        price_min=price_min,
        price_max=price_min,
        currency="EUR",
    )
