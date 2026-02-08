import logging
import re

from app.services.pocketbase import compute_event_hash, pb_client

logger = logging.getLogger(__name__)


def normalize_title(title: str) -> str:
    """Normalize title for dedup: lowercase, strip prices/percentages/whitespace."""
    t = title.lower().strip()
    # Remove price variations: "121€ A/R (−50%)" → ""
    t = re.sub(r"\d+\s*€.*$", "", t)
    # Remove trailing whitespace/dashes
    t = t.rstrip(" -–—")
    return t


async def event_exists(title: str, date_start: str, location_name: str) -> bool:
    """Check if event already exists (exact hash match)."""
    h = compute_event_hash(title, date_start, location_name)
    existing = await pb_client.get_first_record("events", f'hash = "{h}"')
    return existing is not None


async def find_similar_event(title: str, date_start: str) -> bool:
    """Check if a similar event exists on the same date (fuzzy title match)."""
    norm = normalize_title(title)
    if not norm:
        return False

    # Extract just the date part (YYYY-MM-DD)
    date_day = date_start[:10]

    # Search for events on the same day
    filter_str = f'date_start >= "{date_day}T00:00:00" && date_start <= "{date_day}T23:59:59"'
    try:
        result = await pb_client.list_records(
            "events", page=1, per_page=200, filter_str=filter_str
        )
        for existing in result.get("items", []):
            existing_norm = normalize_title(existing.get("title", ""))
            if existing_norm == norm:
                return True
    except Exception:
        logger.debug("Fuzzy dedup check failed", exc_info=True)

    return False


async def purge_duplicates() -> int:
    """Scan all events and remove duplicates, keeping the one with highest score."""
    all_events = []
    page = 1
    while True:
        result = await pb_client.list_records(
            "events", page=page, per_page=200
        )
        items = result.get("items", [])
        all_events.extend(items)
        if page >= result.get("totalPages", 1):
            break
        page += 1

    # Group by normalized title + date
    groups: dict[str, list[dict]] = {}
    for event in all_events:
        norm = normalize_title(event.get("title", ""))
        date_day = event.get("date_start", "")[:10]
        key = f"{norm}|{date_day}"
        groups.setdefault(key, []).append(event)

    deleted = 0
    for key, events in groups.items():
        if len(events) <= 1:
            continue

        # Keep the one with the highest score
        events.sort(key=lambda e: e.get("interest_score", 0), reverse=True)
        keeper = events[0]
        for dupe in events[1:]:
            try:
                await pb_client.delete_record("events", dupe["id"])
                logger.info(
                    "Dedup: removed '%s' [%s] (kept '%s' [%s])",
                    dupe.get("title", ""),
                    dupe["id"],
                    keeper.get("title", ""),
                    keeper["id"],
                )
                deleted += 1
            except Exception:
                logger.debug("Failed to delete dupe %s", dupe["id"], exc_info=True)

    return deleted
