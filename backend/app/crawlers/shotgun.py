import logging
from datetime import datetime

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)


class ShotgunCrawler(BaseCrawler):
    """Crawler for Shotgun (shotgun.live) events in Nice area."""

    source_name = "shotgun"

    # Shotgun exposes a JSON API for their event listings
    CITIES = ["nice", "monaco", "cannes", "antibes"]
    BASE_URL = "https://shotgun.live/cities/{city}"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                for city in self.CITIES:
                    url = self.BASE_URL.format(city=city)
                    logger.info("Crawling Shotgun: %s", url)

                    try:
                        await page.goto(url, wait_until="networkidle", timeout=30000)
                        await page.wait_for_timeout(2000)

                        # Extract event cards from the page
                        event_elements = await page.query_selector_all(
                            "[data-testid='event-card'], .event-card, article"
                        )

                        for el in event_elements:
                            try:
                                title_el = await el.query_selector(
                                    "h2, h3, [data-testid='event-title']"
                                )
                                title = (
                                    await title_el.inner_text() if title_el else None
                                )
                                if not title:
                                    continue

                                # Try to get date
                                date_el = await el.query_selector(
                                    "time, [data-testid='event-date'], .date"
                                )
                                date_text = (
                                    await date_el.inner_text() if date_el else ""
                                )

                                # Try to get venue
                                venue_el = await el.query_selector(
                                    "[data-testid='event-venue'], .venue, .location"
                                )
                                venue = (
                                    await venue_el.inner_text() if venue_el else ""
                                )

                                # Try to get link
                                link_el = await el.query_selector("a")
                                href = (
                                    await link_el.get_attribute("href")
                                    if link_el
                                    else ""
                                )
                                if href and not href.startswith("http"):
                                    href = f"https://shotgun.live{href}"

                                # Try to get image
                                img_el = await el.query_selector("img")
                                img_src = (
                                    await img_el.get_attribute("src")
                                    if img_el
                                    else ""
                                )

                                events.append(
                                    CrawledEvent(
                                        title=title.strip(),
                                        date_start=_parse_date(date_text),
                                        location_name=venue.strip(),
                                        location_city=city.capitalize(),
                                        source_url=href or url,
                                        image_url=img_src or "",
                                    )
                                )
                            except Exception:
                                logger.debug(
                                    "Failed to parse event element", exc_info=True
                                )
                                continue

                    except Exception:
                        logger.warning("Failed to crawl Shotgun %s", city, exc_info=True)
                        continue

                await browser.close()

        except Exception:
            logger.exception("Shotgun crawler failed")

        logger.info("Shotgun: found %d events", len(events))
        return events


def _parse_date(text: str) -> datetime:
    """Best-effort date parsing from various formats."""
    from dateutil import parser

    try:
        return parser.parse(text, dayfirst=True)
    except (ValueError, TypeError):
        return datetime.now()
