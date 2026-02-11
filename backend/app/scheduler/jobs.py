import logging
import re
from datetime import datetime

from app.crawlers.base import BaseCrawler, CrawledEvent
from app.ai.tagger import tag_event
from app.ai.scorer import score_event
from app.ai.summarizer import summarize_event
from app.services.dedup import event_exists, find_similar_event, purge_duplicates
from app.services.pocketbase import compute_event_hash, pb_client
from app.services.url_checker import check_source_url

logger = logging.getLogger(__name__)

# Keyword blocklist — events matching any of these (case-insensitive, in title
# or description) are silently dropped before AI enrichment.
_BLOCKED_PATTERNS: list[re.Pattern] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        # Hard electronic music
        r"\btechno\b",
        r"\brave\b",
        r"\bhard\s*bounce\b",
        r"\bhard\s*trance\b",
        r"\bhard\s*style\b",
        r"\bgabber\b",
        # Yoga / wellness / personal development
        r"\byoga\b",
        r"\bm[eé]ditation\b",
        r"\bbien[- ]?[eê]tre\b",
        r"\bd[eé]veloppement\s+personnel\b",
        r"\bpleine\s+conscience\b",
        r"\bmindfulness\b",
        # Salons & expos not interesting
        r"\bsalon\s+du\s+mariage\b",
        r"\bsalon\s+b[eé]b[eé]\b",
        r"\bpu[eé]riculture\b",
        r"\bsalon\s+de\s+la\s+parentalit[eé]\b",
        # Political / social gatherings
        r"\bmanifestation\b",
        r"\bgr[eè]ve\b",
        r"\brassemblement\s+politique\b",
        # Senior activities
        r"\bth[eé]\s+dansant\b",
        r"\bbridge\b.*\btourn",
        r"\bchorale\b",
        r"\bloto\b",
        # Education open days
        r"\bjourn[eé]e[s]?\s+portes?\s+ouvertes?\b",
        # Parenting / education workshops
        r"\batelier\s+parentalit[eé]\b",
        r"\batelier\s+[eé]ducation\b",
        # Braderies / vide-greniers
        r"\bbraderie\b",
        r"\bvide[- ]?grenier\b",
    ]
]


def _is_blocked(event: CrawledEvent) -> bool:
    """Return True if the event matches any blocked keyword pattern."""
    text = f"{event.title} {event.description}"
    return any(p.search(text) for p in _BLOCKED_PATTERNS)


def _get_active_crawlers() -> list[BaseCrawler]:
    """Import and return all active crawlers."""
    from app.crawlers.shotgun import ShotgunCrawler
    from app.crawlers.nicefr import NiceFrCrawler
    from app.crawlers.flight_deals import FlightDealsCrawler
    from app.crawlers.ogcn import OGCNCrawler
    from app.crawlers.nikaia import NikaiaCrawler
    from app.crawlers.google import GoogleSearchCrawler
    from app.crawlers.lino_ventura import LinoVenturaCrawler
    from app.crawlers.asmonaco import ASMonacoCrawler

    return [
        NiceFrCrawler(),
        ShotgunCrawler(),
        FlightDealsCrawler(),
        OGCNCrawler(),
        ASMonacoCrawler(),
        NikaiaCrawler(),
        LinoVenturaCrawler(),
        GoogleSearchCrawler(),
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

            now = datetime.now()

            for raw in raw_events:
                # Skip past events
                if raw.date_start < now:
                    continue

                # Dedup: exact hash match
                if await event_exists(
                    raw.title, raw.date_start.isoformat(), raw.location_name
                ):
                    continue

                # Dedup: fuzzy title match on same date
                if await find_similar_event(
                    raw.title, raw.date_start.isoformat()
                ):
                    continue

                # Blocklist: skip events matching blocked keywords
                if _is_blocked(raw):
                    logger.info("Blocked event: %s", raw.title)
                    continue

                # Validate source URL before enriching
                if not await check_source_url(raw.source_url):
                    logger.info("Skipping event with dead URL: %s", raw.title)
                    continue

                # Enrich with AI
                tags = await tag_event(raw)
                interest = await score_event(raw, tags)
                summary = await summarize_event(raw)

                # Ligue 1 scoring for football matches — use fixed base + tier bonus
                # instead of raw AI score to ensure consistent differentiation.
                if (
                    source_name in ("ogcn", "asmonaco")
                    and "sport_match" in tags.get("type", [])
                ):
                    from app.data.ligue1 import get_opponent_bonus

                    opponent_name = _extract_opponent(raw.title)
                    bonus = get_opponent_bonus(opponent_name)
                    interest = min(100, 70 + bonus)
                    logger.info(
                        "Ligue 1 score: 70 + %d = %d for %s (opponent: %s)",
                        bonus, interest, raw.title, opponent_name,
                    )

                # Sold-out flag from crawler
                if raw.is_sold_out:
                    excl = tags.get("exclusivity", [])
                    if "sold_out" not in excl:
                        excl.append("sold_out")
                    tags["exclusivity"] = excl

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

    # Expire past events still marked as published
    try:
        expired_past = await _expire_past_events()
        if expired_past:
            logger.info("Expired %d past events", expired_past)
    except Exception:
        logger.exception("Failed to expire past events")

    # Post-crawl dedup pass to catch any remaining duplicates
    try:
        purged = await purge_duplicates()
        if purged:
            logger.info("Post-crawl dedup: removed %d duplicates", purged)
    except Exception:
        logger.exception("Post-crawl dedup failed")

    # Post-crawl URL validation on existing events
    try:
        from app.services.url_checker import purge_dead_urls

        expired = await purge_dead_urls()
        if expired:
            logger.info("Post-crawl URL check: expired %d events", expired)
    except Exception:
        logger.exception("Post-crawl URL check failed")

    logger.info(
        "Crawl pipeline complete: %d found, %d new", total_found, total_new
    )


def _extract_opponent(title: str) -> str:
    """Extract opponent name from a match title like 'OGC Nice vs Lyon (Ligue 1)'."""
    match = re.match(r"(?:OGC Nice|AS Monaco)\s+vs\s+(.+?)(?:\s*\(|$)", title)
    return match.group(1).strip() if match else ""


async def recalibrate_match_scores() -> int:
    """Recalibrate football match scores based on opponent Ligue 1 tier.

    Sets a base score of 70 for all football matches from ogcn/asmonaco,
    then adds a tier-based bonus (+15 for Tier 1, +10 Tier 2, +5 Tier 3, +0 Tier 4).
    """
    from app.data.ligue1 import get_opponent_bonus

    updated = 0
    base_score = 70
    page = 1

    while True:
        result = await pb_client.list_records(
            "events",
            page=page,
            per_page=200,
            filter_str=(
                '(source_name = "ogcn" || source_name = "asmonaco")'
                ' && status = "published"'
            ),
        )
        items = result.get("items", [])
        if not items:
            break

        for item in items:
            opponent = _extract_opponent(item["title"])
            bonus = get_opponent_bonus(opponent)
            new_score = min(100, base_score + bonus)
            old_score = item.get("interest_score", 0)

            if new_score != old_score:
                await pb_client.update_record(
                    "events",
                    item["id"],
                    {
                        "interest_score": new_score,
                        "is_featured": new_score >= 80,
                    },
                )
                logger.info(
                    "Recalibrated %s: %d → %d (opponent=%s, bonus=+%d)",
                    item["title"], old_score, new_score, opponent, bonus,
                )
                updated += 1

        if page >= result.get("totalPages", 1):
            break
        page += 1

    return updated


async def _expire_past_events() -> int:
    """Set status='expired' on published events whose date_start is in the past."""
    now_iso = datetime.now().isoformat()
    expired = 0
    page = 1

    while True:
        result = await pb_client.list_records(
            "events",
            page=page,
            per_page=200,
            filter_str=f'status = "published" && date_start < "{now_iso}"',
        )
        items = result.get("items", [])
        if not items:
            break

        for item in items:
            await pb_client.update_record(
                "events", item["id"], {"status": "expired"}
            )
            expired += 1

        if page >= result.get("totalPages", 1):
            break
        page += 1

    return expired
