import asyncio
import logging
import random
from datetime import datetime, timedelta

from app.config import settings
from app.crawlers.base import BaseCrawler, CrawledEvent
from app.services.flight_deals import (
    DESTINATION_CITIES,
    FlightPrice,
    detect_deal,
    store_flight_price,
)

logger = logging.getLogger(__name__)


# Routes monitored: NCE → popular weekend destinations
ROUTES: list[dict[str, str]] = [
    {"origin": "NCE", "destination": "BCN", "city": "Barcelone"},
    {"origin": "NCE", "destination": "FCO", "city": "Rome"},
    {"origin": "NCE", "destination": "LHR", "city": "Londres"},
    {"origin": "NCE", "destination": "LIS", "city": "Lisbonne"},
    {"origin": "NCE", "destination": "AMS", "city": "Amsterdam"},
    {"origin": "NCE", "destination": "RAK", "city": "Marrakech"},
]

# Google Flights URL template for round-trip search
GFLIGHTS_URL = (
    "https://www.google.com/travel/flights/search"
    "?tfs=CBwQAhooEgoyMDI2LTAyLTIwagwIAhIIL20vMGttMnRyDAgCEggvbS8wMWYwOBooEgoyMDI2LTAyLTIyagwIAhIIL20vMDFmMDhyDAgCEggvbS8wa20ydA"
    "&hl=fr&gl=fr&curr=EUR"
)


def _next_weekend() -> tuple[datetime, datetime]:
    """Return the next Friday and Sunday dates."""
    today = datetime.now()
    days_until_friday = (4 - today.weekday()) % 7
    if days_until_friday == 0 and today.hour >= 12:
        days_until_friday = 7
    friday = today + timedelta(days=days_until_friday)
    sunday = friday + timedelta(days=2)
    return friday, sunday


def _format_date_for_url(dt: datetime) -> str:
    """Format date as YYYY-MM-DD for Google Flights URL."""
    return dt.strftime("%Y-%m-%d")


class FlightDealsCrawler(BaseCrawler):
    """Crawler for flight deals from Nice (NCE) via Google Flights.

    Scrapes Google Flights for round-trip prices to popular weekend
    destinations. Stores ALL prices in the flight_prices collection
    for history tracking, and returns CrawledEvent only for detected
    deals (prices significantly below the 30-day average).
    """

    source_name = "google_flights"

    async def crawl(self) -> list[CrawledEvent]:
        """Crawl Google Flights for all monitored routes.

        Returns at most 3 deal events (the best discounts).
        """
        if not settings.flight_crawl_enabled:
            logger.info("Flight crawl disabled, skipping")
            return []

        # Collect (discount_pct, event) tuples to pick the best deals
        deal_candidates: list[tuple[float, CrawledEvent]] = []
        departure, return_date = _next_weekend()

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    locale="fr-FR",
                    viewport={"width": 1280, "height": 720},
                )
                page = await context.new_page()

                for route in ROUTES:
                    route_code = f"{route['origin']}-{route['destination']}"
                    logger.info("Crawling flights: %s", route_code)

                    try:
                        route_deals = await self._crawl_route(
                            page, route, departure, return_date
                        )
                        deal_candidates.extend(route_deals)
                    except Exception:
                        logger.warning(
                            "Failed to crawl route %s", route_code, exc_info=True
                        )

                    # Randomized delay between routes (2-5 seconds)
                    await asyncio.sleep(random.uniform(2.0, 5.0))

                await browser.close()

        except Exception:
            logger.exception("Flight deals crawler failed")

        # Keep only the top 3 deals by discount percentage
        MAX_FLIGHT_DEALS = 3
        deal_candidates.sort(key=lambda x: x[0], reverse=True)
        events = [event for _, event in deal_candidates[:MAX_FLIGHT_DEALS]]

        logger.info(
            "Flight deals: %d candidates, returning top %d",
            len(deal_candidates),
            len(events),
        )
        return events

    async def _crawl_route(
        self,
        page: "playwright.async_api.Page",
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
    ) -> list[tuple[float, CrawledEvent]]:
        """Crawl a single route and return (discount_pct, event) tuples."""
        route_code = f"{route['origin']}-{route['destination']}"
        dep_str = _format_date_for_url(departure)
        ret_str = _format_date_for_url(return_date)

        # Build Google Flights search URL
        url = (
            f"https://www.google.com/travel/flights?"
            f"q=Flights+from+{route['origin']}+to+{route['destination']}"
            f"+on+{dep_str}+return+{ret_str}"
            f"&curr=EUR&hl=fr&gl=fr"
        )

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        # Wait for flight results to render
        await page.wait_for_timeout(random.randint(3000, 5000))

        # Accept cookies dialog if present
        try:
            accept_btn = await page.query_selector(
                "button[aria-label*='Accept'], "
                "button[aria-label*='Accepter'], "
                "button[aria-label*='Tout accepter']"
            )
            if accept_btn:
                await accept_btn.click()
                await page.wait_for_timeout(1000)
        except Exception:
            pass

        # Extract flight prices from the results page
        prices_found = await self._extract_prices(
            page, route, departure, return_date, url
        )

        if not prices_found:
            logger.warning("No prices found for %s", route_code)
            return []

        # Store all prices and check for deals
        deal_events: list[tuple[float, CrawledEvent]] = []
        for fp in prices_found:
            await store_flight_price(fp)

            is_deal, avg_price, discount_pct = await detect_deal(
                fp.price,
                route_code,
                threshold_percent=settings.flight_deal_threshold_percent,
                min_history_days=settings.flight_deal_min_history_days,
            )

            if is_deal and avg_price is not None and discount_pct is not None:
                event = self._create_deal_event(
                    fp, route, avg_price, discount_pct, departure, return_date
                )
                deal_events.append((discount_pct, event))

        logger.info(
            "Route %s: %d prices stored, %d deals detected",
            route_code,
            len(prices_found),
            len(deal_events),
        )
        return deal_events

    async def _extract_prices(
        self,
        page: "playwright.async_api.Page",
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
        source_url: str,
    ) -> list[FlightPrice]:
        """Extract flight prices from the Google Flights results page."""
        route_code = f"{route['origin']}-{route['destination']}"
        prices: list[FlightPrice] = []

        # Google Flights uses various selectors for price display
        price_elements = await page.query_selector_all(
            "[class*='price'] span, "
            "[data-gs] [aria-label*='EUR'], "
            "[data-gs] [aria-label*='euros'], "
            ".YMlIz, .BVAVmf"
        )

        # Also try to get flight result list items
        result_items = await page.query_selector_all(
            "li[class*='pIav2d'], "
            "[class*='Rk10dc'], "
            "div[data-resultid]"
        )

        if result_items:
            prices = await self._parse_result_items(
                result_items, route, departure, return_date, source_url
            )
        elif price_elements:
            prices = await self._parse_price_elements(
                price_elements, route, departure, return_date, source_url
            )

        # Fallback: try extracting from aria-labels on the whole page
        if not prices:
            prices = await self._parse_aria_prices(
                page, route, departure, return_date, source_url
            )

        return prices

    async def _parse_result_items(
        self,
        items: list,
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
        source_url: str,
    ) -> list[FlightPrice]:
        """Parse structured flight result items."""
        route_code = f"{route['origin']}-{route['destination']}"
        prices: list[FlightPrice] = []

        for item in items:
            try:
                # Extract price
                price_el = await item.query_selector(
                    "[class*='price'], [aria-label*='EUR'], .YMlIz, .BVAVmf"
                )
                if not price_el:
                    continue
                price_text = await price_el.inner_text()
                price = _parse_price_text(price_text)
                if price is None or price <= 0:
                    continue

                # Extract airline
                airline_el = await item.query_selector(
                    "[class*='airline'], .sSHqwe, [data-test-id='airline']"
                )
                airline = ""
                if airline_el:
                    airline = (await airline_el.inner_text()).strip()

                # Extract duration
                duration_el = await item.query_selector(
                    "[class*='duration'], .gvkrdb, [aria-label*='h']"
                )
                duration_min = 0
                if duration_el:
                    duration_text = await duration_el.inner_text()
                    duration_min = _parse_duration(duration_text)

                # Check if direct flight
                stops_el = await item.query_selector(
                    "[class*='stop'], .EfT7Ae, [aria-label*='escale']"
                )
                is_direct = True
                if stops_el:
                    stops_text = (await stops_el.inner_text()).lower()
                    is_direct = "direct" in stops_text or "sans" in stops_text

                prices.append(
                    FlightPrice(
                        route=route_code,
                        origin=route["origin"],
                        destination=route["destination"],
                        destination_city=route["city"],
                        departure_date=departure,
                        return_date=return_date,
                        price=price,
                        currency="EUR",
                        airline=airline,
                        flight_duration=duration_min,
                        is_direct=is_direct,
                        source_url=source_url,
                        crawled_at=datetime.now(),
                    )
                )
            except Exception:
                continue

        return prices

    async def _parse_price_elements(
        self,
        elements: list,
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
        source_url: str,
    ) -> list[FlightPrice]:
        """Parse standalone price elements."""
        route_code = f"{route['origin']}-{route['destination']}"
        prices: list[FlightPrice] = []

        for el in elements:
            try:
                text = await el.inner_text()
                price = _parse_price_text(text)
                if price is None or price <= 0:
                    continue

                prices.append(
                    FlightPrice(
                        route=route_code,
                        origin=route["origin"],
                        destination=route["destination"],
                        destination_city=route["city"],
                        departure_date=departure,
                        return_date=return_date,
                        price=price,
                        currency="EUR",
                        source_url=source_url,
                        crawled_at=datetime.now(),
                    )
                )
            except Exception:
                continue

        return prices

    async def _parse_aria_prices(
        self,
        page: "playwright.async_api.Page",
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
        source_url: str,
    ) -> list[FlightPrice]:
        """Fallback: extract prices from aria-label attributes."""
        route_code = f"{route['origin']}-{route['destination']}"
        prices: list[FlightPrice] = []

        elements = await page.query_selector_all("[aria-label]")
        for el in elements:
            try:
                label = await el.get_attribute("aria-label")
                if not label:
                    continue
                # Look for patterns like "29 euros" or "29 EUR" in aria-labels
                price = _parse_price_from_label(label)
                if price is None or price <= 0:
                    continue

                prices.append(
                    FlightPrice(
                        route=route_code,
                        origin=route["origin"],
                        destination=route["destination"],
                        destination_city=route["city"],
                        departure_date=departure,
                        return_date=return_date,
                        price=price,
                        currency="EUR",
                        source_url=source_url,
                        crawled_at=datetime.now(),
                    )
                )
            except Exception:
                continue

        return prices

    def _create_deal_event(
        self,
        fp: FlightPrice,
        route: dict[str, str],
        avg_price: float,
        discount_pct: float,
        departure: datetime,
        return_date: datetime,
    ) -> CrawledEvent:
        """Create a CrawledEvent for a detected flight deal."""
        dep_str = departure.strftime("%d/%m")
        ret_str = return_date.strftime("%d/%m")
        direct_str = " direct" if fp.is_direct else ""
        airline_str = f" ({fp.airline})" if fp.airline else ""

        title = (
            f"Vol Nice\u2192{route['city']} "
            f"{fp.price:.0f}\u20ac A/R "
            f"(\u2212{discount_pct:.0f}%)"
        )

        description = (
            f"Vol{direct_str} Nice (NCE) \u2192 {route['city']} "
            f"({route['destination']}){airline_str}. "
            f"Prix actuel : {fp.price:.0f}\u20ac A/R, "
            f"soit {discount_pct:.0f}% sous la moyenne de {avg_price:.0f}\u20ac. "
            f"Dates : {dep_str} \u2013 {ret_str}."
        )

        return CrawledEvent(
            title=title,
            description=description,
            date_start=departure,
            date_end=return_date,
            location_name=f"A\u00e9roport Nice C\u00f4te d'Azur (NCE)",
            location_city="Nice",
            price_min=fp.price,
            price_max=fp.price,
            currency="EUR",
            source_url=fp.source_url,
        )


def _parse_price_text(text: str) -> float | None:
    """Extract a numeric price from text like '29 €', '€29', '29,50€'."""
    import re

    if not text:
        return None
    # Remove non-numeric chars except comma and dot
    cleaned = re.sub(r"[^\d,.]", "", text.strip())
    # Handle European format: 1.234,56 or 29,50
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def _parse_price_from_label(label: str) -> float | None:
    """Extract price from an aria-label like '29 euros' or '45 EUR'."""
    import re

    match = re.search(r"(\d[\d\s.,]*)\s*(?:euros?|EUR|€)", label, re.IGNORECASE)
    if not match:
        return None
    return _parse_price_text(match.group(1))


def _parse_duration(text: str) -> int:
    """Parse duration text like '2 h 30 min' or '2h30' into minutes."""
    import re

    hours = 0
    minutes = 0
    h_match = re.search(r"(\d+)\s*h", text)
    if h_match:
        hours = int(h_match.group(1))
        # Check for digits right after "h" with no suffix (e.g. "2h30")
        after_h = text[h_match.end():]
        compact_match = re.match(r"\s*(\d+)(?:\s*$|\s*[^a-zA-Z]|$)", after_h)
        if compact_match:
            minutes = int(compact_match.group(1))
    m_match = re.search(r"(\d+)\s*(?:min|m(?!o))", text)
    if m_match:
        minutes = int(m_match.group(1))
    return hours * 60 + minutes
