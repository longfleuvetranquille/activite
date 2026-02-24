import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler, CrawledEvent

logger = logging.getLogger(__name__)

CALENDAR_URL = "https://www.ogcnice.com/fr/calendrier/f/2025-2026/equipe-pro"

# Competition ID to name mapping (from CSS class suffix)
COMPETITION_NAMES = {
    "1": "Ligue 1",
    "3": "Coupe de France",
    "5": "Ligue des Champions",
    "6": "Ligue Europa",
    "11": "Match amical",
}

FR_MONTHS = {
    "janvier": 1, "février": 2, "fevrier": 2,
    "mars": 3, "avril": 4, "mai": 5, "juin": 6,
    "juillet": 7, "août": 8, "aout": 8,
    "septembre": 9, "octobre": 10,
    "novembre": 11, "décembre": 12, "decembre": 12,
}


class OGCNCrawler(BaseCrawler):
    """Crawler for OGC Nice home matches from ogcnice.com.

    Uses httpx + BeautifulSoup (no Playwright needed, page is server-rendered).
    Selects .calendrier_bloc_incoming blocks where Nice is the home team.
    """

    source_name = "ogcn"

    async def crawl(self) -> list[CrawledEvent]:
        events: list[CrawledEvent] = []

        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "Palmier/1.0 (event aggregator)",
                    "Accept-Language": "fr-FR,fr;q=0.9",
                },
            ) as client:
                logger.info("Crawling OGC Nice calendar")
                response = await client.get(CALENDAR_URL)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Only upcoming matches (not played)
                match_blocks = soup.select(".calendrier_bloc_incoming")
                logger.info("OGCN: found %d upcoming match blocks", len(match_blocks))

                now = datetime.now()

                for block in match_blocks:
                    try:
                        event = _parse_match_block(block, now)
                        if event:
                            events.append(event)
                    except Exception:
                        logger.debug("Failed to parse OGCN match", exc_info=True)

        except Exception:
            logger.exception("OGCN crawler failed")

        logger.info("OGCN: returning %d events", len(events))
        return events


def _parse_match_block(block, now: datetime) -> CrawledEvent | None:
    """Parse a .calendrier_bloc_incoming into a CrawledEvent.

    Only returns home matches (Nice in calendrier_bloc_equipedom).
    """
    # Check if Nice is the home team
    home_el = block.select_one(".calendrier_bloc_equipedom .calendrier_bloc_equipe_nom")
    if not home_el:
        return None
    home_team = home_el.get_text(strip=True)
    if home_team.lower() != "nice":
        return None

    # Get opponent (away team)
    away_el = block.select_one(".calendrier_bloc_equipeext .calendrier_bloc_equipe_nom")
    opponent = away_el.get_text(strip=True) if away_el else "?"

    # Get opponent logo
    opponent_logo = ""
    away_img = block.select_one(".calendrier_bloc_equipeext img")
    if away_img:
        opponent_logo = away_img.get("src", "") or away_img.get("data-src", "")
        if opponent_logo and not opponent_logo.startswith("http"):
            opponent_logo = f"https://www.ogcnice.com{opponent_logo}"

    # Get competition from CSS class
    competition = ""
    classes = block.get("class", [])
    for cls in classes:
        if cls.startswith("calendrier_bloc_competition_"):
            comp_id = cls.split("_")[-1]
            competition = COMPETITION_NAMES.get(comp_id, "")
            break

    # Get venue (stade)
    stade_el = block.select_one(".calendrier_bloc_stade")
    venue = stade_el.get_text(strip=True) if stade_el else "Allianz Riviera"

    # Parse date: "15 février" from calendrier_bloc_date_chiffre
    date_chiffre_el = block.select_one(".calendrier_bloc_date_chiffre")
    if not date_chiffre_el:
        return None
    date_text = date_chiffre_el.get_text(strip=True).lower()

    date_start = _parse_date_text(date_text, now)
    if not date_start:
        return None

    # Only future matches
    if date_start < now:
        return None

    # Parse time from calendrier_bloc_date_jour: "dimanche  20:45"
    jour_el = block.select_one(".calendrier_bloc_date_jour")
    if jour_el:
        jour_text = jour_el.get_text(strip=True)
        time_match = re.search(r"(\d{1,2}):(\d{2})", jour_text)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2))
            if 0 <= hour <= 23:
                date_start = date_start.replace(hour=hour, minute=minute)

    # Get match center link
    link_el = block.select_one(".calendrier_bloc_liens a")
    link = ""
    if link_el:
        link = link_el.get("href", "")
        if link and not link.startswith("http"):
            link = f"https://www.ogcnice.com{link}"

    # Build title
    title = f"OGC Nice vs {opponent}"
    if competition:
        title += f" ({competition})"

    return CrawledEvent(
        title=title,
        description=f"Match de {competition or 'football'} a l'Allianz Riviera.",
        date_start=date_start,
        location_name=venue,
        location_city="Nice",
        source_url=link or CALENDAR_URL,
        image_url=opponent_logo,
        price_min=-1,
        price_max=-1,
        currency="EUR",
    )


def _parse_date_text(text: str, now: datetime) -> datetime | None:
    """Parse French date text like '15 février' or '15 mars 2026'."""
    for month_name, month_num in FR_MONTHS.items():
        match = re.search(
            rf"(\d{{1,2}})\s*{re.escape(month_name)}\s*(\d{{4}})?",
            text,
        )
        if match:
            day = int(match.group(1))
            year = int(match.group(2)) if match.group(2) else _guess_year(month_num, now)
            try:
                return datetime(year, month_num, day)
            except ValueError:
                continue
    return None


def _guess_year(month: int, now: datetime) -> int:
    """Guess year for a month in a football season (Aug-May)."""
    # Season 2025-2026: Aug-Dec = 2025, Jan-May = 2026
    if month >= 8:
        return now.year if now.month >= 8 else now.year - 1
    return now.year if now.month <= 7 else now.year + 1
