from datetime import datetime, timedelta

from app.models.schemas import EventListResponse, EventRead
from app.services.pocketbase import pb_client


def _to_event_read(record: dict) -> EventRead:
    return EventRead(
        id=record["id"],
        title=record.get("title", ""),
        description=record.get("description", ""),
        summary=record.get("summary", ""),
        date_start=record.get("date_start", datetime.now().isoformat()),
        date_end=record.get("date_end") or None,
        location_name=record.get("location_name", ""),
        location_city=record.get("location_city", ""),
        location_address=record.get("location_address", ""),
        latitude=record.get("latitude"),
        longitude=record.get("longitude"),
        price_min=record.get("price_min", 0),
        price_max=record.get("price_max", 0),
        currency=record.get("currency", "EUR"),
        source_url=record.get("source_url", ""),
        source_name=record.get("source_name", ""),
        image_url=record.get("image_url", ""),
        tags_type=record.get("tags_type", []),
        tags_vibe=record.get("tags_vibe", []),
        tags_energy=record.get("tags_energy", []),
        tags_budget=record.get("tags_budget", []),
        tags_time=record.get("tags_time", []),
        tags_exclusivity=record.get("tags_exclusivity", []),
        tags_location=record.get("tags_location", []),
        tags_audience=record.get("tags_audience", []),
        tags_deals=record.get("tags_deals", []),
        tags_meta=record.get("tags_meta", []),
        interest_score=record.get("interest_score", 0),
        is_featured=record.get("is_featured", False),
        status=record.get("status", "draft"),
        crawled_at=record.get("crawled_at", record.get("created", "")),
        hash=record.get("hash", ""),
    )


async def get_events(
    page: int = 1,
    per_page: int = 50,
    sort: str = "-interest_score",
    filter_str: str = "",
) -> EventListResponse:
    result = await pb_client.list_records(
        "events", page=page, per_page=per_page, sort=sort, filter_str=filter_str
    )
    items = [_to_event_read(r) for r in result.get("items", [])]
    return EventListResponse(
        items=items,
        total=result.get("totalItems", 0),
        page=result.get("page", page),
        per_page=result.get("perPage", per_page),
    )


async def get_event_by_id(event_id: str) -> EventRead | None:
    try:
        record = await pb_client.get_record("events", event_id)
        return _to_event_read(record)
    except Exception:
        return None


async def get_today_events() -> list[EventRead]:
    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{tomorrow}" '
        f'&& status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=100,
        sort="-interest_score",
        filter_str=filter_str,
    )
    return [_to_event_read(r) for r in result.get("items", [])]


async def get_week_events() -> list[EventRead]:
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    days_until_monday = 7 - now.weekday()  # days until next Monday
    week_end = (now + timedelta(days=days_until_monday)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{week_end}" '
        f'&& status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=100,
        sort="-interest_score",
        filter_str=filter_str,
    )
    return [_to_event_read(r) for r in result.get("items", [])]


async def get_weekend_events() -> list[EventRead]:
    now = datetime.now()
    weekday = now.weekday()  # 0=Mon ... 6=Sun
    if weekday < 4:  # Mon-Thu: next Friday
        friday = now + timedelta(days=(4 - weekday))
    elif weekday == 4:  # Friday: today
        friday = now
    elif weekday == 5:  # Saturday: yesterday (Friday)
        friday = now - timedelta(days=1)
    else:  # Sunday: Friday before
        friday = now - timedelta(days=2)
    fri_str = friday.strftime("%Y-%m-%d")
    monday = (friday + timedelta(days=3)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{fri_str}" && date_start < "{monday}" '
        f'&& status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=100,
        sort="-interest_score",
        filter_str=filter_str,
    )
    return [_to_event_read(r) for r in result.get("items", [])]


async def get_month_events() -> list[EventRead]:
    today = datetime.now().strftime("%Y-%m-%d")
    month_end = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{month_end}" '
        f'&& status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=100,
        sort="-interest_score",
        filter_str=filter_str,
    )
    return [_to_event_read(r) for r in result.get("items", [])]


async def get_featured_events() -> list[EventRead]:
    today = datetime.now().strftime("%Y-%m-%d")
    end = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{end}" '
        f'&& interest_score >= 70 && status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=50,
        sort="-interest_score",
        filter_str=filter_str,
    )
    all_events = [_to_event_read(r) for r in result.get("items", [])]

    # Diversify: limit events per primary type tag to avoid
    # the featured section being dominated by a single event category.
    type_limits: dict[str, int] = {"sport_match": 1}
    default_limit = 2

    diversified: list[EventRead] = []
    type_counts: dict[str, int] = {}

    for event in all_events:
        primary_type = event.tags_type[0] if event.tags_type else "_none"
        count = type_counts.get(primary_type, 0)
        limit = type_limits.get(primary_type, default_limit)
        if count < limit:
            diversified.append(event)
            type_counts[primary_type] = count + 1

    return diversified


async def get_best_events(limit: int = 20) -> list[EventRead]:
    """Get the best upcoming events over the next 3 months, sorted by score."""
    today = datetime.now().strftime("%Y-%m-%d")
    end = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{end}" '
        f'&& status = "published"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=limit,
        sort="-interest_score",
        filter_str=filter_str,
    )
    return [_to_event_read(r) for r in result.get("items", [])]


async def get_upcoming_events() -> list[EventRead]:
    """Get the best upcoming events over the next 6 months, diversified."""
    today = datetime.now().strftime("%Y-%m-%d")
    end = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
    filter_str = (
        f'date_start >= "{today}" && date_start < "{end}" '
        f'&& status = "published"'
        f' && tags_type !~ "travel"'
    )
    result = await pb_client.list_records(
        "events",
        per_page=200,
        sort="-interest_score",
        filter_str=filter_str,
    )
    all_events = [_to_event_read(r) for r in result.get("items", [])]

    # Diversify: cap sport_match to avoid football domination
    type_limits: dict[str, int] = {"sport_match": 3}
    default_limit = 100

    diversified: list[EventRead] = []
    type_counts: dict[str, int] = {}

    for event in all_events:
        primary_type = event.tags_type[0] if event.tags_type else "_none"
        count = type_counts.get(primary_type, 0)
        limit = type_limits.get(primary_type, default_limit)
        if count < limit:
            diversified.append(event)
            type_counts[primary_type] = count + 1

    return diversified
