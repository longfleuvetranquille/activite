import uuid
from datetime import datetime

from fastapi import APIRouter

from app.models.schemas import CrawlLogRead, CrawlStatusResponse, CrawlTriggerResponse
from app.services.pocketbase import pb_client

router = APIRouter()

# In-memory crawl state (simple approach for single-instance)
_crawl_state = {
    "is_running": False,
    "last_run": None,
    "last_status": None,
}


@router.post("/trigger", response_model=CrawlTriggerResponse)
async def trigger_crawl():
    if _crawl_state["is_running"]:
        return CrawlTriggerResponse(message="Crawl already in progress")

    # Import here to avoid circular imports
    from app.scheduler.jobs import run_crawl_pipeline

    job_id = str(uuid.uuid4())[:8]
    _crawl_state["is_running"] = True

    try:
        await run_crawl_pipeline()
        _crawl_state["last_run"] = datetime.now()
        _crawl_state["last_status"] = "success"
    except Exception as e:
        _crawl_state["last_status"] = "error"
        return CrawlTriggerResponse(message=f"Crawl failed: {e}", job_id=job_id)
    finally:
        _crawl_state["is_running"] = False

    return CrawlTriggerResponse(message="Crawl completed", job_id=job_id)


@router.post("/dedup")
async def trigger_dedup():
    from app.services.dedup import purge_duplicates

    deleted = await purge_duplicates()
    return {"message": f"Purged {deleted} duplicates"}


@router.post("/check-urls")
async def trigger_url_check():
    from app.services.url_checker import purge_dead_urls

    expired = await purge_dead_urls()
    return {"message": f"Expired {expired} events with dead URLs"}


@router.get("/status", response_model=CrawlStatusResponse)
async def crawl_status():
    return CrawlStatusResponse(
        is_running=_crawl_state["is_running"],
        last_run=_crawl_state["last_run"],
        last_status=_crawl_state["last_status"],
    )


@router.get("/logs", response_model=list[CrawlLogRead])
async def crawl_logs():
    result = await pb_client.list_records(
        "crawl_logs", per_page=20, sort="-started_at"
    )
    items = result.get("items", [])
    return [
        CrawlLogRead(
            id=r["id"],
            source=r.get("source", ""),
            started_at=r.get("started_at", ""),
            finished_at=r.get("finished_at"),
            status=r.get("status", ""),
            events_found=r.get("events_found", 0),
            events_new=r.get("events_new", 0),
            error_message=r.get("error_message", ""),
        )
        for r in items
    ]
