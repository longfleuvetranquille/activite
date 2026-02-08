import logging
from dataclasses import dataclass
from datetime import datetime

from app.services.pocketbase import pb_client

logger = logging.getLogger(__name__)


@dataclass
class FlightPrice:
    """A single flight price snapshot."""

    route: str
    origin: str
    destination: str
    destination_city: str
    departure_date: datetime
    return_date: datetime
    price: float
    currency: str = "EUR"
    airline: str = ""
    flight_duration: int = 0
    is_direct: bool = False
    source_url: str = ""
    crawled_at: datetime | None = None


# Mapping of airport codes to city names
DESTINATION_CITIES: dict[str, str] = {
    "BCN": "Barcelone",
    "FCO": "Rome",
    "LHR": "Londres",
    "LIS": "Lisbonne",
    "AMS": "Amsterdam",
    "RAK": "Marrakech",
}


async def store_flight_price(fp: FlightPrice) -> dict:
    """Save a flight price record to PocketBase."""
    data = {
        "route": fp.route,
        "origin": fp.origin,
        "destination": fp.destination,
        "destination_city": fp.destination_city,
        "departure_date": fp.departure_date.isoformat(),
        "return_date": fp.return_date.isoformat(),
        "price": fp.price,
        "currency": fp.currency,
        "airline": fp.airline,
        "flight_duration": fp.flight_duration,
        "is_direct": fp.is_direct,
        "source_url": fp.source_url,
        "crawled_at": (fp.crawled_at or datetime.now()).isoformat(),
    }
    return await pb_client.create_record("flight_prices", data)


async def get_price_history(route: str, days: int = 30) -> list[dict]:
    """Fetch recent price records for a route."""
    from datetime import timedelta

    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    filter_str = f'route = "{route}" && crawled_at >= "{cutoff}"'

    all_records: list[dict] = []
    page = 1
    while True:
        result = await pb_client.list_records(
            "flight_prices",
            page=page,
            per_page=200,
            sort="-crawled_at",
            filter_str=filter_str,
        )
        items = result.get("items", [])
        all_records.extend(items)
        if len(items) < 200:
            break
        page += 1

    return all_records


async def compute_average_price(route: str, days: int = 30) -> float | None:
    """Compute the rolling average price for a route over the last N days.

    Returns None if no price history is available.
    """
    records = await get_price_history(route, days)
    if not records:
        return None

    prices = [r["price"] for r in records if r.get("price")]
    if not prices:
        return None

    return sum(prices) / len(prices)


async def detect_deal(
    price: float,
    route: str,
    threshold_percent: float = 30.0,
    min_history_days: int = 7,
) -> tuple[bool, float | None, float | None]:
    """Check if a price qualifies as a deal.

    Args:
        price: The current price to evaluate.
        route: The route code (e.g. "NCE-BCN").
        threshold_percent: Minimum percentage below average to qualify as a deal.
        min_history_days: Minimum days of history required before detecting deals.

    Returns:
        Tuple of (is_deal, average_price, discount_percent).
        is_deal is False if not enough history data.
    """
    records = await get_price_history(route, days=30)

    # Need enough data points before flagging deals
    if len(records) < min_history_days:
        logger.debug(
            "Route %s: only %d records, need %d — skipping deal detection",
            route,
            len(records),
            min_history_days,
        )
        return False, None, None

    prices = [r["price"] for r in records if r.get("price")]
    if not prices:
        return False, None, None

    avg = sum(prices) / len(prices)
    if avg <= 0:
        return False, avg, None

    discount = ((avg - price) / avg) * 100
    is_deal = discount >= threshold_percent

    if is_deal:
        logger.info(
            "Deal detected on %s: %.0f€ vs avg %.0f€ (−%.0f%%)",
            route,
            price,
            avg,
            discount,
        )

    return is_deal, avg, discount
