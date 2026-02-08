import asyncio
import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config import settings

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _run_crawl_sync():
    """Sync wrapper to run async crawl pipeline from APScheduler."""
    from app.scheduler.jobs import run_crawl_pipeline

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(run_crawl_pipeline())
    except Exception:
        logger.exception("Scheduled crawl failed")
    finally:
        loop.close()


def start_scheduler():
    global _scheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _run_crawl_sync,
        trigger=CronTrigger(hour=settings.crawl_schedule_hour, minute=0),
        id="daily_crawl",
        name="Daily event crawl",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info(
        "Scheduler started — daily crawl at %02d:00", settings.crawl_schedule_hour
    )


def stop_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
