import logging

import httpx

logger = logging.getLogger(__name__)

# Timeout court pour ne pas ralentir le pipeline
_TIMEOUT = 10


async def is_url_alive(url: str) -> bool:
    """Check if a URL is still accessible (HEAD request, fallback to GET)."""
    if not url:
        return False

    try:
        async with httpx.AsyncClient(
            timeout=_TIMEOUT, follow_redirects=True
        ) as client:
            # Try HEAD first (faster, no body download)
            resp = await client.head(
                url, headers={"User-Agent": "NiceOutside/1.0"}
            )
            if resp.status_code < 400 or resp.status_code == 429:
                return True

            # Some servers reject HEAD, fallback to GET
            if resp.status_code == 405:
                resp = await client.get(
                    url, headers={"User-Agent": "NiceOutside/1.0"}
                )
                return resp.status_code < 400

            return False

    except Exception:
        logger.debug("URL check failed for %s", url, exc_info=True)
        return False


async def check_source_url(url: str) -> bool:
    """Validate an event source URL. Returns True if reachable."""
    if not url:
        return True  # No URL = nothing to check

    # Skip validation for flight deals (dynamic prices, URLs change)
    if "google.com/travel" in url:
        return True

    # Skip validation for official team sites (always valid, some match
    # preview pages may not exist yet)
    if "asmonaco.com" in url or "ogcnice.com" in url:
        return True

    return await is_url_alive(url)


async def purge_dead_urls() -> int:
    """Check all published events and expire those with dead source URLs."""
    from app.services.pocketbase import pb_client

    expired_count = 0
    page = 1

    while True:
        result = await pb_client.list_records(
            "events",
            page=page,
            per_page=100,
            filter_str='status = "published" && source_url != ""',
        )
        items = result.get("items", [])
        if not items:
            break

        for event in items:
            url = event.get("source_url", "")
            if not url:
                continue

            alive = await check_source_url(url)
            if not alive:
                logger.info(
                    "Dead URL for event %s (%s): %s",
                    event["id"],
                    event.get("title", ""),
                    url,
                )
                await pb_client.update_record(
                    "events", event["id"], {"status": "expired"}
                )
                expired_count += 1

        if len(items) < 100:
            break
        page += 1

    logger.info("URL check complete: %d events expired", expired_count)
    return expired_count
