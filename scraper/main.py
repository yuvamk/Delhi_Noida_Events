"""
Main Scraper Entry Point — Updated with Dynamic AI Browser Scraper.
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
from scrapers.dynamic_browser_scraper import DynamicBrowserScraper
from processors.deduplicator import Deduplicator
from processors.normalizer import EventNormalizer
from utils.api_client import APIClient
from utils.logger import setup_logger

setup_logger()

ALL_SCRAPERS = {
    "eventbrite":  EventbriteScraper,
    "meraevents":  MeraEventsScraper,
    "meetup":      MeetupScraper,
    "unstop":      UnstopScraper,
    "iit_delhi":   IITDelhiScraper,
    "linkedin":    LinkedInScraper,
    "corporate":   CorporateScraper,
    "dynamic":     DynamicBrowserScraper,
}

async def run_scraper(scraper_name: str, scraper_class, job_id: str, dry_run: bool = False) -> dict:
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

async def run_pipeline(sources: list[str] = None, dry_run: bool = False) -> dict:
    job_id = f"job-{uuid4().hex[:12]}"
    start_time = datetime.now()

    logger.info(f"\n{'='*60}")
    logger.info(f"🚀 SCRAPER PIPELINE STARTED — Job: {job_id}")
    logger.info(f"📅 {start_time.strftime('%Y-%m-%d %H:%M:%S IST')}")
    logger.info(f"{'='*60}")

    scrapers_to_run = {
        name: cls for name, cls in ALL_SCRAPERS.items()
        if sources is None or name in sources or "all" in (sources or [])
    }
    logger.info(f"📦 Running {len(scrapers_to_run)} scrapers: {list(scrapers_to_run.keys())}")

    api = APIClient()
    if not dry_run:
        api_healthy = await api.health_check()
        if not api_healthy:
            logger.warning("⚠️  Backend API unreachable. Running in dry-run mode.")
            dry_run = True

    tasks = [run_scraper(name, cls, job_id, dry_run) for name, cls in scrapers_to_run.items()]
    scraper_results = await asyncio.gather(*tasks, return_exceptions=True)

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

    # Normalize/Deduplicate
    normalizer = EventNormalizer()
    normalized = normalizer.normalize_batch(all_events)
    dedup = Deduplicator()
    unique = dedup.deduplicate(normalized)
    
    pipeline_summary["total_normalized"] = len(normalized)
    pipeline_summary["total_unique"] = len(unique)
    pipeline_summary["duplicates_removed"] = len(normalized) - len(unique)

    if not dry_run and unique:
        send_result = await api.send_events(unique, job_id)
        pipeline_summary["total_sent"] = send_result["sent"]
    elif dry_run:
        pipeline_summary["total_sent"] = 0

    elapsed_total = int((datetime.now() - start_time).total_seconds() * 1000)
    pipeline_summary["completed_at"] = datetime.now().isoformat()
    pipeline_summary["total_duration_ms"] = elapsed_total

    logger.info(f"\n{'='*60}")
    logger.info(f"✅ PIPELINE COMPLETE — Job: {job_id}")
    logger.info(f"   Found: {pipeline_summary['total_found']} | Sent: {pipeline_summary['total_sent']}")
    logger.info(f"{'='*60}\n")

    return pipeline_summary

async def main():
    parser = argparse.ArgumentParser(description="Delhi-Noida Events Scraper")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--source", type=str, help="Run a single source")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but don't send to API")
    args = parser.parse_args()

    sources = [args.source] if args.source else None
    await run_pipeline(sources=sources, dry_run=args.dry_run)

if __name__ == "__main__":
    asyncio.run(main())
