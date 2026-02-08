import asyncio
import base64
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

# Reasonable price bounds for short-haul round-trip flights from Nice
MIN_PRICE_EUR = 25
MAX_PRICE_EUR = 800


def _next_weekend() -> tuple[datetime, datetime]:
    """Return the next Friday and Sunday dates (midnight, no time component)."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    days_until_friday = (4 - today.weekday()) % 7
    if days_until_friday == 0:
        days_until_friday = 7
    friday = today + timedelta(days=days_until_friday)
    sunday = friday + timedelta(days=2)
    return friday, sunday


def _build_tfs(origin: str, dest: str, dep_date: str, ret_date: str) -> str:
    """Build the tfs parameter for Google Flights search URL.

    Encodes a round-trip flight search as a base64-encoded protobuf,
    which is what Google Flights expects for direct search URLs.
    """

    def varint(val: int) -> bytes:
        buf = b""
        while val > 127:
            buf += bytes([val & 0x7F | 0x80])
            val >>= 7
        buf += bytes([val & 0x7F])
        return buf

    def tag(field: int, wire_type: int) -> bytes:
        return varint((field << 3) | wire_type)

    def string_field(field: int, s: str) -> bytes:
        encoded = s.encode()
        return tag(field, 2) + varint(len(encoded)) + encoded

    def message_field(field: int, data: bytes) -> bytes:
        return tag(field, 2) + varint(len(data)) + data

    def varint_field(field: int, val: int) -> bytes:
        return tag(field, 0) + varint(val)

    def airport(code: str) -> bytes:
        return varint_field(1, 1) + string_field(2, code)

    def leg(date: str, orig: str, dst: str) -> bytes:
        return (
            string_field(2, date)
            + message_field(13, airport(orig))
            + message_field(14, airport(dst))
        )

    tfs_bytes = (
        varint_field(1, 28)
        + varint_field(2, 2)
        + message_field(3, leg(dep_date, origin, dest))
        + message_field(3, leg(ret_date, dest, origin))
    )

    return base64.urlsafe_b64encode(tfs_bytes).rstrip(b"=").decode()


class FlightDealsCrawler(BaseCrawler):
    """Crawler for flight deals from Nice (NCE) via Google Flights.

    Uses proper Google Flights search URLs (tfs= protobuf parameter) to load
    actual round-trip search results. Prices are extracted via targeted JS
    evaluation that only captures prices from flight result rows.

    Returns at most 3 deal events (the best discounts).
    """

    source_name = "google_flights"

    async def crawl(self) -> list[CrawledEvent]:
        """Crawl Google Flights for all monitored routes."""
        if not settings.flight_crawl_enabled:
            logger.info("Flight crawl disabled, skipping")
            return []

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
        page,
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
    ) -> list[tuple[float, CrawledEvent]]:
        """Crawl a single route and return (discount_pct, event) tuples."""
        route_code = f"{route['origin']}-{route['destination']}"
        dep_str = departure.strftime("%Y-%m-%d")
        ret_str = return_date.strftime("%Y-%m-%d")

        # Build proper Google Flights search URL with tfs protobuf parameter
        tfs = _build_tfs(route["origin"], route["destination"], dep_str, ret_str)
        url = (
            f"https://www.google.com/travel/flights/search"
            f"?tfs={tfs}&hl=fr&gl=fr&curr=EUR"
        )

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(random.randint(5000, 7000))

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

        # Extract flight prices
        prices_found = await self._extract_prices(
            page, route, departure, return_date, url
        )

        if not prices_found:
            logger.warning("No valid prices found for %s", route_code)
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
        page,
        route: dict[str, str],
        departure: datetime,
        return_date: datetime,
        source_url: str,
    ) -> list[FlightPrice]:
        """Extract round-trip prices from Google Flights search results.

        Uses targeted JS evaluation that only captures prices from actual
        flight result rows — identified by the presence of time patterns
        (HH:MM) and sufficient element width. Ignores calendar views, ads,
        sidebars, and "starting from" labels.
        """
        route_code = f"{route['origin']}-{route['destination']}"

        raw_prices = await page.evaluate(
            r"""
            () => {
                const results = [];
                const seen = new Set();
                const allElements = document.querySelectorAll('*');

                for (const el of allElements) {
                    // Only leaf elements — the actual rendered price text
                    if (el.children.length > 0) continue;

                    const text = el.textContent.trim();

                    // Match "XX €" or "XXX €" (2-4 digits + optional space + €)
                    const match = text.match(/^(\d{2,4})\s*€$/);
                    if (!match) continue;

                    const price = parseInt(match[1]);

                    // Walk up the DOM to find the flight result row container.
                    // A real flight result row contains departure/arrival times
                    // like "14:30" or "22h55" and is a wide, visible element.
                    let parent = el;
                    let isFlightResult = false;
                    for (let depth = 0; depth < 8; depth++) {
                        parent = parent.parentElement;
                        if (!parent) break;

                        const parentText = parent.textContent || '';
                        const hasTime = /\d{1,2}[h:]\d{2}/.test(parentText);
                        if (!hasTime) continue;

                        const rect = parent.getBoundingClientRect();
                        if (rect.width > 300 && rect.height > 40) {
                            isFlightResult = true;
                            break;
                        }
                    }

                    if (isFlightResult && !seen.has(price)) {
                        seen.add(price);
                        results.push(price);
                    }
                }

                return results.sort((a, b) => a - b);
            }
        """
        )

        logger.info(
            "Route %s: extracted %d prices: %s",
            route_code,
            len(raw_prices),
            raw_prices,
        )

        # Validate and build FlightPrice objects
        prices: list[FlightPrice] = []
        for price_val in raw_prices:
            if price_val < MIN_PRICE_EUR or price_val > MAX_PRICE_EUR:
                logger.debug(
                    "Route %s: rejected price %d€ (outside %d-%d range)",
                    route_code,
                    price_val,
                    MIN_PRICE_EUR,
                    MAX_PRICE_EUR,
                )
                continue

            prices.append(
                FlightPrice(
                    route=route_code,
                    origin=route["origin"],
                    destination=route["destination"],
                    destination_city=route["city"],
                    departure_date=departure,
                    return_date=return_date,
                    price=float(price_val),
                    currency="EUR",
                    source_url=source_url,
                    crawled_at=datetime.now(),
                )
            )

        # Keep at most 5 cheapest prices per route
        return prices[:5]

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
            location_name="A\u00e9roport Nice C\u00f4te d'Azur (NCE)",
            location_city="Nice",
            price_min=fp.price,
            price_max=fp.price,
            currency="EUR",
            source_url=fp.source_url,
        )
