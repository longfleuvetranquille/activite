from datetime import datetime

from fastapi import APIRouter

from app.models.schemas import DashboardDigest, DashboardStats
from app.services import event_service
from app.services.pocketbase import pb_client

router = APIRouter()


@router.get("/digest", response_model=DashboardDigest)
async def get_digest():
    today = await event_service.get_today_events()
    week = await event_service.get_week_events()
    featured = await event_service.get_featured_events()
    best = await event_service.get_best_events(limit=15)

    # Filter deals: events with deal tags (from 3-month window)
    all_upcoming = await event_service.get_best_events(limit=100)
    deals = [
        e for e in all_upcoming if e.tags_deals or "deal_detected" in e.tags_meta
    ]

    # Deduplicate flight deals by destination — keep best score per route.
    # Flight titles follow "Vol Nice→{destination} ..." so extract destination.
    import re

    seen_destinations: set[str] = set()
    unique_deals: list = []
    for d in deals:
        if d.source_name == "google_flights":
            m = re.search(r"Nice[→\u2192](\S+)", d.title)
            dest = m.group(1) if m else d.title
            if dest in seen_destinations:
                continue
            seen_destinations.add(dest)
        unique_deals.append(d)

    return DashboardDigest(
        today_count=len(today),
        week_count=len(week),
        featured=featured[:5],
        top_upcoming=best[:15],
        deals=unique_deals[:5],
    )


@router.get("/stats", response_model=DashboardStats)
async def get_stats():
    today_events = await event_service.get_today_events()
    week_events = await event_service.get_week_events()

    # Get total events count
    all_events = await pb_client.list_records("events", per_page=1)
    total = all_events.get("totalItems", 0)

    # Get sources count
    sources = await pb_client.list_records("sources", per_page=1)
    total_sources = sources.get("totalItems", 0)

    # Get last crawl
    logs = await pb_client.list_records(
        "crawl_logs", per_page=1, sort="-started_at"
    )
    last_crawl_items = logs.get("items", [])
    last_crawl = (
        last_crawl_items[0].get("started_at") if last_crawl_items else None
    )

    return DashboardStats(
        total_events=total,
        total_sources=total_sources,
        last_crawl=last_crawl,
        events_today=len(today_events),
        events_this_week=len(week_events),
    )
