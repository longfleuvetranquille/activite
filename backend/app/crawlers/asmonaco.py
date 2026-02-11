import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

CALENDAR_URL = "https://www.asmonaco.com/equipe-pro/calendrier/"

# Season 2025-2026: month blocks are ordered Jul..May (indices 0..10)
_SEASON_MONTHS = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5]


class ASMonacoCrawler(BaseCrawler):
    """Crawler for AS Monaco home matches from asmonaco.com.

    Uses httpx + BeautifulSoup.  The calendar page renders .asm-match
    blocks inside .asm-calendar-month-block containers (one per month).
    Filters for home matches only (Stade Louis-II).
    """

    source_name = "asmonaco"

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
                logger.info("Crawling AS Monaco calendar")
                response = await client.get(CALENDAR_URL)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")
                now = datetime.now()

                month_blocks = soup.select(".asm-calendar-month-block")
                logger.info(
                    "ASMonaco: found %d month blocks", len(month_blocks)
                )

                for block_idx, month_block in enumerate(month_blocks):
                    month_num = (
                        _SEASON_MONTHS[block_idx]
                        if block_idx < len(_SEASON_MONTHS)
                        else None
                    )
                    if month_num is None:
                        continue

                    year = _year_for_month(month_num)

                    for match in month_block.select(".asm-match"):
                        try:
                            event = _parse_match(match, month_num, year, now)
                            if event:
                                events.append(event)
                        except Exception:
                            logger.debug(
                                "Failed to parse ASMonaco match",
                                exc_info=True,
                            )

        except Exception:
            logger.exception("ASMonaco crawler failed")

        logger.info("ASMonaco: returning %d events", len(events))
        return events


def _year_for_month(month: int) -> int:
    """Return calendar year for a given month in the 2025-2026 season."""
    return 2025 if month >= 7 else 2026


def _parse_match(
    block, month: int, year: int, now: datetime
) -> CrawledEvent | None:
    """Parse a .asm-match block into a CrawledEvent.

    Only returns future home matches (Stade Louis-II).
    """
    # --- Is it a future match?  (played matches have numeric scores) ---
    home_score_el = block.select_one(".asm-match-team-home-score")
    if home_score_el:
        score_text = home_score_el.get_text(strip=True)
        if score_text.isdigit():
            return None  # already played

    # --- Home match?  Monaco must be the home team at Stade Louis-II ---
    home_name_el = block.select_one(".asm-match-team-home-name")
    if not home_name_el:
        return None
    home_name = home_name_el.get_text(strip=True)
    if "monaco" not in home_name.lower():
        return None

    location_el = block.select_one(".asm-match-location")
    location = location_el.get_text(strip=True) if location_el else ""
    if "louis" not in location.lower():
        return None

    # --- Opponent ---
    away_name_el = block.select_one(".asm-match-team-away-name")
    opponent = away_name_el.get_text(strip=True) if away_name_el else ""
    if not opponent:
        return None

    # --- Opponent logo ---
    opponent_logo = ""
    away_logo_el = block.select_one(".asm-match-team-away-logo")
    if away_logo_el:
        opponent_logo = away_logo_el.get("src", "")

    # --- Competition ---
    details_el = block.select_one(".asm-match-details")
    competition_raw = details_el.get_text(strip=True) if details_el else ""
    competition = _normalise_competition(competition_raw)

    # --- Date & time ---
    day_el = block.select_one(".asm-match-day")
    hour_el = block.select_one(".asm-match-hour")

    if not day_el:
        return None

    day_text = day_el.get_text(strip=True)  # e.g. "Dim 05"
    day_match = re.search(r"(\d{1,2})", day_text)
    if not day_match:
        return None
    day = int(day_match.group(1))

    hour, minute = 21, 0  # default kick-off
    if hour_el:
        time_match = re.search(r"(\d{1,2}):(\d{2})", hour_el.get_text(strip=True))
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2))

    try:
        date_start = datetime(year, month, day, hour, minute)
    except ValueError:
        return None

    if date_start < now:
        return None

    # --- Link ---
    link = ""
    link_el = block.select_one("a.asm-match-preview[href]")
    if link_el:
        link = link_el.get("href", "")
        if link and not link.startswith("http"):
            link = f"https://www.asmonaco.com{link}"

    # --- Build event ---
    title = f"AS Monaco vs {opponent}"
    if competition:
        title += f" ({competition})"

    return CrawledEvent(
        title=title,
        description=f"Match de {competition or 'football'} au Stade Louis-II.",
        date_start=date_start,
        location_name="Stade Louis-II",
        location_city="Monaco",
        source_url=link or CALENDAR_URL,
        image_url=opponent_logo,
        price_min=-1,
        price_max=-1,
        currency="EUR",
    )


def _normalise_competition(raw: str) -> str:
    """Normalise competition text like 'Ligue 1, J28' → 'Ligue 1'."""
    low = raw.lower()
    if "ligue 1" in low:
        return "Ligue 1"
    if "coupe de france" in low:
        return "Coupe de France"
    if "champions" in low:
        return "Ligue des Champions"
    if "europa" in low:
        return "Ligue Europa"
    if "conference" in low:
        return "Conference League"
    if "amical" in low:
        return "Match amical"
    return raw.split(",")[0].strip() if raw else ""
