import logging
from datetime import datetime

import httpx

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)


class GoogleSearchCrawler(BaseCrawler):
    """Crawler that scrapes Google search results for local events."""

    source_name = "google_search"

    QUERIES = [
        "que faire à Nice aujourd'hui",
        "sortie Nice ce soir",
        "événements Nice cette semaine",
        "soirée Nice ce weekend",
        "activités Monaco cette semaine",
        "événements Cannes aujourd'hui",
    ]

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                # Set a realistic user agent
                await page.set_extra_http_headers(
                    {"Accept-Language": "fr-FR,fr;q=0.9"}
                )

                for query in self.QUERIES:
                    logger.info("Google search: %s", query)

                    try:
                        search_url = f"https://www.google.com/search?q={query}&hl=fr&gl=fr"
                        await page.goto(
                            search_url, wait_until="domcontentloaded", timeout=15000
                        )
                        await page.wait_for_timeout(1500)

                        # Extract event cards from Google's event carousel
                        event_cards = await page.query_selector_all(
                            "[data-attrid='kc:/local/events:events'] .klitem, "
                            ".mnr-c .kno-nf, "
                            "g-scrolling-carousel .klitem"
                        )

                        for card in event_cards:
                            try:
                                title_el = await card.query_selector(
                                    ".kCrYT, .ellip, [role='heading'], .GHDvEf"
                                )
                                title = (
                                    await title_el.inner_text() if title_el else None
                                )
                                if not title:
                                    continue

                                date_el = await card.query_selector(
                                    ".FGlSad, .cEZxRc"
                                )
                                date_text = (
                                    await date_el.inner_text() if date_el else ""
                                )

                                venue_el = await card.query_selector(
                                    ".RVclrc, .tNxQIb"
                                )
                                venue = (
                                    await venue_el.inner_text() if venue_el else ""
                                )

                                link_el = await card.query_selector("a")
                                href = (
                                    await link_el.get_attribute("href")
                                    if link_el
                                    else ""
                                )

                                # Determine city from query
                                city = "Nice"
                                if "monaco" in query.lower():
                                    city = "Monaco"
                                elif "cannes" in query.lower():
                                    city = "Cannes"

                                events.append(
                                    CrawledEvent(
                                        title=title.strip(),
                                        date_start=_parse_date_fr(date_text),
                                        location_name=venue.strip(),
                                        location_city=city,
                                        source_url=href or search_url,
                                    )
                                )
                            except Exception:
                                continue

                    except Exception:
                        logger.warning(
                            "Google search failed for: %s", query, exc_info=True
                        )
                        continue

                await browser.close()

        except Exception:
            logger.exception("Google crawler failed")

        logger.info("Google: found %d events", len(events))
        return events


def _parse_date_fr(text: str) -> datetime:
    """Parse French date text."""
    from dateutil import parser

    # Common French mappings
    replacements = {
        "lun.": "Mon",
        "mar.": "Tue",
        "mer.": "Wed",
        "jeu.": "Thu",
        "ven.": "Fri",
        "sam.": "Sat",
        "dim.": "Sun",
        "janv.": "Jan",
        "févr.": "Feb",
        "mars": "Mar",
        "avr.": "Apr",
        "mai": "May",
        "juin": "Jun",
        "juil.": "Jul",
        "août": "Aug",
        "sept.": "Sep",
        "oct.": "Oct",
        "nov.": "Nov",
        "déc.": "Dec",
    }

    normalized = text.lower()
    for fr, en in replacements.items():
        normalized = normalized.replace(fr, en)

    try:
        return parser.parse(normalized, dayfirst=True)
    except (ValueError, TypeError):
        return datetime.now()
