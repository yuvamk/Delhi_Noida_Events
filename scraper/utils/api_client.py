"""
API Client — Posts scraped events to the backend API.
Handles authentication, batching, and retry logic.
"""
import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import aiohttp

from scrapers.base_scraper import EventModel


class APIClient:
    """
    Sends scraped events to the Node.js backend via REST API.
    
    Features:
    - API key authentication
    - Batch sending (50 events per request)
    - Retry with exponential backoff
    - Scraper run result reporting
    """

    def __init__(self):
        self.base_url = os.getenv("BACKEND_API_URL", "http://localhost:5005/api/v1")
        self.api_key = os.getenv("SCRAPER_API_KEY", "")
        self.batch_size = 50  # events per batch POST

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key,
            "X-Scraper": "python-scraper-v1",
        }

    def _serialize_event(self, event: EventModel) -> Dict[str, Any]:
        """Convert EventModel to backend API format."""
        return {
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "city": event.city,
            "date": event.date.isoformat(),
            "endDate": event.end_date.isoformat() if event.end_date else None,
            "time": event.time,
            "venue": event.venue,
            "address": event.address,
            "price": {
                "amount": event.price_amount,
                "currency": event.price_currency,
                "type": event.price_type,
            },
            "registrationUrl": event.registration_url,
            "images": event.images,
            "tags": event.tags,
            "organizer": {
                "name": event.organizer_name,
                "email": event.organizer_email,
                "website": event.organizer_website,
            },
            "capacity": event.capacity,
            "attendees": event.attendees,
            "source": event.source,
            "sourceUrl": event.source_url,
            "sourceId": event.source_id,
            "featured": event.featured,
            "verified": event.verified,
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30))
    async def _post_batch(self, events: List[Dict], job_id: str) -> Dict:
        """POST a batch of events to the backend."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/admin/scraper/callback/events",
                json={"events": events, "jobId": job_id},
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=60),
            ) as resp:
                data = await resp.json()
                if resp.status not in [200, 201]:
                    raise Exception(f"API error {resp.status}: {data}")
                return data

    async def send_events(self, events: List[EventModel], job_id: str) -> Dict[str, int]:
        """Send all events to backend in batches."""
        if not events:
            return {"sent": 0, "inserted": 0, "updated": 0, "batches": 0}

        serialized = [self._serialize_event(e) for e in events]
        batches = [serialized[i:i + self.batch_size] for i in range(0, len(serialized), self.batch_size)]

        total_inserted = 0
        total_updated = 0
        for i, batch in enumerate(batches, 1):
            try:
                result = await self._post_batch(batch, job_id)
                res_data = result.get("results", {})
                inserted = res_data.get("inserted", 0)
                updated = res_data.get("updated", 0)
                
                total_inserted += inserted
                total_updated += updated
                
                logger.info(f"Batch {i}/{len(batches)}: {inserted} new, {updated} updated")
                await asyncio.sleep(0.5)  # Brief pause between batches
            except Exception as e:
                logger.error(f"Failed to send batch {i}: {e}")

        return {
            "sent": total_inserted + total_updated, 
            "inserted": total_inserted, 
            "updated": total_updated,
            "batches": len(batches)
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30))
    async def report_scraper_result(
        self,
        job_id: str,
        source: str,
        status: str,
        events_found: int,
        events_inserted: int,
        events_updated: int,
        duplicates_removed: int,
        duration_ms: int,
        error_message: Optional[str] = None,
    ):
        """Report scraper run result to backend for logging."""
        payload = {
            "jobId": job_id,
            "source": source,
            "status": status,
            "eventsFound": events_found,
            "eventsInserted": events_inserted,
            "eventsUpdated": events_updated,
            "duplicatesRemoved": duplicates_removed,
            "durationMs": duration_ms,
        }
        if error_message:
            payload["errorMessage"] = error_message

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/admin/scraper/callback/result",
                    json=payload,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status in [200, 201]:
                        logger.debug(f"Scraper result reported for job {job_id}")
                    else:
                        logger.warning(f"Failed to report result: {resp.status}")
        except Exception as e:
            logger.warning(f"Could not report scraper result: {e}")

    async def health_check(self) -> bool:
        """Check if backend API is reachable."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/health",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    return resp.status == 200
        except Exception:
            return False
