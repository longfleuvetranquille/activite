import logging
from datetime import datetime

from app.crawlers.base import BaseCrawler, CrawledEvent
from app.ai.tagger import tag_event
from app.ai.scorer import score_event
from app.ai.summarizer import summarize_event
from app.services.dedup import event_exists
from app.services.pocketbase import compute_event_hash, pb_client

logger = logging.getLogger(__name__)


def _get_active_crawlers() -> list[BaseCrawler]:
    """Import and return all active crawlers."""
    from app.crawlers.shotgun import ShotgunCrawler
    from app.crawlers.nicefr import NiceFrCrawler
    from app.crawlers.flight_deals import FlightDealsCrawler

    return [
        NiceFrCrawler(),
        ShotgunCrawler(),
        FlightDealsCrawler(),
    ]


async def run_crawl_pipeline():
    """Main crawl pipeline: fetch → dedup → enrich → store."""
    logger.info("Starting crawl pipeline")
    crawlers = _get_active_crawlers()
    total_found = 0
    total_new = 0

    for crawler in crawlers:
        source_name = crawler.source_name
        started_at = datetime.now()
        events_found = 0
        events_new = 0
        error_msg = ""
        status = "success"

        try:
            raw_events = await crawler.crawl()
            events_found = len(raw_events)

            for raw in raw_events:
                # Dedup
                if await event_exists(
                    raw.title, raw.date_start.isoformat(), raw.location_name
                ):
                    continue

                # Enrich with AI
                tags = await tag_event(raw)
                interest = await score_event(raw, tags)
                summary = await summarize_event(raw)

                # Store
                event_hash = compute_event_hash(
                    raw.title, raw.date_start.isoformat(), raw.location_name
                )

                await pb_client.create_record(
                    "events",
                    {
                        "title": raw.title,
                        "description": raw.description,
                        "summary": summary,
                        "date_start": raw.date_start.isoformat(),
                        "date_end": raw.date_end.isoformat() if raw.date_end else None,
                        "location_name": raw.location_name,
                        "location_city": raw.location_city,
                        "location_address": raw.location_address,
                        "latitude": raw.latitude,
                        "longitude": raw.longitude,
                        "price_min": raw.price_min,
                        "price_max": raw.price_max,
                        "currency": raw.currency,
                        "source_url": raw.source_url,
                        "source_name": source_name,
                        "image_url": raw.image_url,
                        "tags_type": tags.get("type", []),
                        "tags_vibe": tags.get("vibe", []),
                        "tags_energy": tags.get("energy", []),
                        "tags_budget": tags.get("budget", []),
                        "tags_time": tags.get("time", []),
                        "tags_exclusivity": tags.get("exclusivity", []),
                        "tags_location": tags.get("location", []),
                        "tags_audience": tags.get("audience", []),
                        "tags_deals": tags.get("deals", []),
                        "tags_meta": tags.get("meta", []),
                        "interest_score": interest,
                        "is_featured": interest >= 80,
                        "status": "published",
                        "crawled_at": datetime.now().isoformat(),
                        "hash": event_hash,
                    },
                )
                events_new += 1

        except Exception as e:
            logger.exception("Crawl failed for %s", source_name)
            status = "error"
            error_msg = str(e)

        # Log crawl result
        try:
            await pb_client.create_record(
                "crawl_logs",
                {
                    "source": source_name,
                    "started_at": started_at.isoformat(),
                    "finished_at": datetime.now().isoformat(),
                    "status": status,
                    "events_found": events_found,
                    "events_new": events_new,
                    "error_message": error_msg,
                },
            )
        except Exception:
            logger.exception("Failed to log crawl result")

        total_found += events_found
        total_new += events_new

    logger.info(
        "Crawl pipeline complete: %d found, %d new", total_found, total_new
    )
