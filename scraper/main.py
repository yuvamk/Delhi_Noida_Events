"""
Main Scraper Entry Point — Updated with all scrapers, normalizer, API client.
Runs on APScheduler every 6 hours.

Usage:
    python main.py              # Start scheduler (runs forever)
    python main.py --once       # Run all scrapers once
    python main.py --source eventbrite  # Run single source
    python main.py --dry-run    # Scrape but don't send to API
"""
import asyncio
import sys
import argparse
from datetime import datetime
from uuid import uuid4
from loguru import logger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from scrapers.base_scraper import EventModel
from scrapers.eventbrite_scraper import EventbriteScraper
from scrapers.meraevents_scraper import MeraEventsScraper
from scrapers.meetup_scraper import MeetupScraper
from scrapers.unstop_scraper import UnstopScraper
from scrapers.linkedin_scraper import LinkedInScraper
from scrapers.university_scraper import IITDelhiScraper
from scrapers.corporate_scraper import CorporateScraper
from processors.deduplicator import Deduplicator
from processors.normalizer import EventNormalizer
from utils.api_client import APIClient
from utils.logger import setup_logger

# ─── Setup ────────────────────────────────────────────────────
setup_logger()

# ─── Registry ─────────────────────────────────────────────────
ALL_SCRAPERS = {
    "eventbrite":  EventbriteScraper,
    "meraevents":  MeraEventsScraper,
    "meetup":      MeetupScraper,
    "unstop":      UnstopScraper,
    "iit_delhi":   IITDelhiScraper,
    "linkedin":    LinkedInScraper,
    "corporate":   CorporateScraper,
}


async def run_scraper(scraper_name: str, scraper_class, job_id: str, dry_run: bool = False) -> dict:
    """Run a single scraper and return its result summary."""
    start = datetime.now()
    scraper = scraper_class()
    result = await scraper.run()
    elapsed_ms = int((datetime.now() - start).total_seconds() * 1000)

    return {
        "source": scraper_name,
        "job_id": f"{job_id}-{scraper_name}",
        "status": result["status"],
        "events_found": result.get("total_found", 0),
        "valid_events": result.get("valid_events", []),
        "duration_ms": elapsed_ms,
        "error": result.get("error"),
    }


async def run_pipeline(
    sources: list[str] = None,
    dry_run: bool = False,
) -> dict:
    """
    Main scraping pipeline:
    1. Run all scrapers concurrently
    2. Normalize data
    3. Deduplicate
    4. Send to backend API
    5. Report results
    """
    job_id = f"job-{uuid4().hex[:12]}"
    start_time = datetime.now()

    logger.info(f"\n{'='*60}")
    logger.info(f"🚀 SCRAPER PIPELINE STARTED — Job: {job_id}")
    logger.info(f"📅 {start_time.strftime('%Y-%m-%d %H:%M:%S IST')}")
    logger.info(f"{'='*60}")

    # Select scrapers
    scrapers_to_run = {
        name: cls for name, cls in ALL_SCRAPERS.items()
        if sources is None or name in sources or "all" in (sources or [])
    }
    logger.info(f"📦 Running {len(scrapers_to_run)} scrapers: {list(scrapers_to_run.keys())}")

    # API health check
    api = APIClient()
    if not dry_run:
        api_healthy = await api.health_check()
        if not api_healthy:
            logger.warning("⚠️  Backend API unreachable. Running in dry-run mode.")
            dry_run = True

    # Run all scrapers concurrently
    tasks = [
        run_scraper(name, cls, job_id, dry_run)
        for name, cls in scrapers_to_run.items()
    ]
    scraper_results = await asyncio.gather(*tasks, return_exceptions=True)

    # Aggregate all events
    all_events: list[EventModel] = []
    pipeline_summary = {
        "job_id": job_id,
        "started_at": start_time.isoformat(),
        "sources": {},
        "total_found": 0,
        "total_valid": 0,
        "total_normalized": 0,
        "total_unique": 0,
        "total_sent": 0,
        "duplicates_removed": 0,
    }

    for result in scraper_results:
        if isinstance(result, Exception):
            logger.error(f"Scraper exception: {result}")
            continue

        source = result["source"]
        valid = result.get("valid_events", [])
        all_events.extend(valid)

        pipeline_summary["sources"][source] = {
            "status": result["status"],
            "found": result["events_found"],
            "valid": len(valid),
            "duration_ms": result["duration_ms"],
            "error": result.get("error"),
        }
        pipeline_summary["total_found"] += result["events_found"]
        pipeline_summary["total_valid"] += len(valid)

    logger.info(f"\n📊 Aggregated: {len(all_events)} valid events from {len(scrapers_to_run)} sources")

    # Normalize
    normalizer = EventNormalizer()
    normalized = normalizer.normalize_batch(all_events)
    pipeline_summary["total_normalized"] = len(normalized)
    logger.info(f"✨ Normalized: {len(normalized)} events")

    # Deduplicate
    dedup = Deduplicator()
    unique = dedup.deduplicate(normalized)
    removed = len(normalized) - len(unique)
    pipeline_summary["total_unique"] = len(unique)
    pipeline_summary["duplicates_removed"] = removed
    logger.info(f"🔍 Deduplicated: {len(unique)} unique events ({removed} duplicates removed)")

    # Send to backend API
    if not dry_run and unique:
        logger.info(f"📤 Sending {len(unique)} events to backend API...")
        send_result = await api.send_events(unique, job_id)
        pipeline_summary["total_sent"] = send_result["sent"]
        logger.info(f"✅ Sent: {send_result['sent']} events in {send_result['batches']} batches")
    elif dry_run:
        logger.info(f"🏃 Dry-run mode: would send {len(unique)} events")
        pipeline_summary["total_sent"] = 0
    else:
        logger.warning("No unique events to send")

    # Report to backend
    elapsed_total = int((datetime.now() - start_time).total_seconds() * 1000)
    pipeline_summary["completed_at"] = datetime.now().isoformat()
    pipeline_summary["total_duration_ms"] = elapsed_total

    if not dry_run:
        for source, stats in pipeline_summary["sources"].items():
            await api.report_scraper_result(
                job_id=f"{job_id}-{source}",
                source=source,
                status=stats["status"],
                events_found=stats["found"],
                events_inserted=stats["valid"],
                events_updated=0,
                duplicates_removed=0,
                duration_ms=stats["duration_ms"],
                error_message=stats.get("error"),
            )

    logger.info(f"\n{'='*60}")
    logger.info(f"✅ PIPELINE COMPLETE — Job: {job_id}")
    logger.info(f"   Found: {pipeline_summary['total_found']} | Valid: {pipeline_summary['total_valid']} | Unique: {pipeline_summary['total_unique']} | Sent: {pipeline_summary['total_sent']}")
    logger.info(f"   Duration: {elapsed_total/1000:.1f}s | Duplicates removed: {removed}")
    logger.info(f"{'='*60}\n")

    return pipeline_summary


def start_scheduler(dry_run: bool = False):
    """Start APScheduler with cron jobs."""
    scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

    # Full scrape every 6 hours (00:00, 06:00, 12:00, 18:00 IST)
    scheduler.add_job(
        lambda: asyncio.create_task(run_pipeline(dry_run=dry_run)),
        CronTrigger(hour="*/6", minute=0),
        id="full_scrape",
        name="Full scrape — all sources",
        misfire_grace_time=600,
        coalesce=True,
        max_instances=1,
    )

    # Quick scrape (Meetup + Unstop) every 2 hours
    scheduler.add_job(
        lambda: asyncio.create_task(run_pipeline(sources=["meetup", "unstop"], dry_run=dry_run)),
        CronTrigger(hour="*/2", minute=30),
        id="quick_scrape",
        name="Quick scrape — fast sources",
        misfire_grace_time=300,
        coalesce=True,
        max_instances=1,
    )

    scheduler.start()
    logger.success(f"⏰ Scheduler started (IST timezone)")
    logger.info(f"   Full scrape: every 6 hours (00:00, 06:00, 12:00, 18:00)")
    logger.info(f"   Quick scrape: every 2 hours at :30")
    return scheduler


async def main():
    parser = argparse.ArgumentParser(description="Delhi-Noida Events Scraper")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--source", type=str, help="Run a single source (e.g. --source meetup)")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but don't send to API")
    parser.add_argument("--list", action="store_true", help="List all available scrapers")
    args = parser.parse_args()

    if args.list:
        print("\nAvailable scrapers:")
        for name in ALL_SCRAPERS:
            print(f"  • {name}")
        return

    sources = [args.source] if args.source else None
    dry_run = args.dry_run

    if dry_run:
        logger.info("🏃 DRY-RUN MODE — events will not be sent to API")

    if args.once or args.source:
        await run_pipeline(sources=sources, dry_run=dry_run)
        return

    # Scheduled mode (default)
    scheduler = start_scheduler(dry_run=dry_run)

    # Run immediately on startup
    logger.info("Running initial scrape on startup...")
    await run_pipeline(dry_run=dry_run)

    # Keep the event loop alive
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown(wait=False)
        logger.info("Scraper stopped.")


if __name__ == "__main__":
    asyncio.run(main())
