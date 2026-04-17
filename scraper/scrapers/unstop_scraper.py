"""
Unstop (formerly Dare2Compete) Scraper.
Scrapes hackathons, quizzes, case study competitions targeting Delhi/Noida colleges.
"""
import asyncio
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
import aiohttp
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper, EventModel


class UnstopScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "unstop"
        self.base_url = "https://unstop.com"
        self.api_url = "https://unstop.com/api/public/opportunity/search-result"
        self.rate_limit_seconds = 3.0

    def _build_payloads(self) -> List[Dict]:
        """Build API payloads for different competition types."""
        base_payload = {
            "page": 1,
            "size": 30,
            "filters": {
                "deadline": "upcoming",
                "eligible_colleges": [],
                "location": ["Delhi", "Noida", "New Delhi"],
            }
        }
        payloads = []
        for oppType in ["hackathon", "competition", "workshop", "case-study", "quiz"]:
            p = {**base_payload, "opportunityType": oppType}
            payloads.append(p)
        return payloads

    async def scrape(self) -> List[EventModel]:
        all_events = []

        for payload in self._build_payloads():
            try:
                logger.info(f"Scraping Unstop: {payload['opportunityType']}")
                events = await self._fetch_opportunities(payload)
                all_events.extend(events)
                await self.sleep(2)
            except Exception as e:
                logger.error(f"Unstop error for type {payload.get('opportunityType')}: {e}")

        return all_events

    async def _fetch_opportunities(self, payload: Dict) -> List[EventModel]:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers={
                        **self.default_headers,
                        "Content-Type": "application/json",
                        "Referer": "https://unstop.com/hackathons",
                    },
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as resp:
                    if resp.status != 200:
                        logger.warning(f"Unstop API status: {resp.status}")
                        return []
                    data = await resp.json()

            events_data = data.get("data", {}).get("data", []) or []
            results = []
            for raw in events_data:
                event = await self.parse_event(raw)
                if event:
                    results.append(event)
            return results
        except Exception as e:
            logger.error(f"Unstop fetch error: {e}")
            return []

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        try:
            title = raw_data.get("title", "").strip()
            if not title:
                return None

            # Date
            deadline = raw_data.get("deadline") or raw_data.get("start_date")
            if not deadline:
                return None
            try:
                event_date = datetime.fromisoformat(str(deadline).replace("Z", "+00:00"))
            except Exception:
                return None

            # City detection
            location = raw_data.get("location", "") or raw_data.get("city", "")
            city = self.normalize_city(str(location)) or "Delhi"

            # URL
            slug = raw_data.get("slug", "")
            opp_type = raw_data.get("opp_type", "hackathon")
            source_url = f"{self.base_url}/{opp_type}s/{slug}" if slug else self.base_url

            # Registration
            reg_url = raw_data.get("registration_url") or source_url

            # Prize/amount
            prizes = raw_data.get("prizes", []) or []
            prize_amount = 0
            for p in prizes:
                val = p.get("amount") or p.get("value") or 0
                try:
                    prize_amount = max(prize_amount, float(str(val).replace(",", "").replace("₹", "").strip() or 0))
                except Exception:
                    pass

            price_type = "Free"
            entry_fee = raw_data.get("fees") or raw_data.get("registration_fee") or 0
            if entry_fee and float(str(entry_fee or 0)) > 0:
                price_type = "Paid"

            # Images
            image = raw_data.get("banner_url") or raw_data.get("thumbnail") or ""
            images = [image] if image else []

            # Tags
            tags = []
            for tag in raw_data.get("tags", []) or []:
                if isinstance(tag, dict):
                    tags.append(tag.get("name", ""))
                elif isinstance(tag, str):
                    tags.append(tag)

            # Category
            opp_type_lower = opp_type.lower()
            if "hack" in opp_type_lower:
                category = "Hackathon"
            elif "workshop" in opp_type_lower:
                category = "Education"
            else:
                category = "Tech"

            desc = raw_data.get("description", "") or f"{category} competition: {title}"
            import re
            desc = re.sub(r"<[^>]+>", " ", str(desc)).strip()[:2000]

            return EventModel(
                title=title,
                description=desc,
                category=category,
                city=city,
                date=event_date,
                time="09:00 AM",
                venue=str(location) or f"{city}",
                address=str(location) or city,
                price_amount=0.0,
                price_currency="INR",
                price_type=price_type,
                registration_url=reg_url,
                images=images,
                tags=[t for t in tags if t][:10],
                organizer_name=raw_data.get("organization", {}).get("name", "Unstop") if isinstance(raw_data.get("organization"), dict) else "Unstop",
                source=self.source_name,
                source_url=source_url,
                source_id=str(raw_data.get("id", "")),
                featured="prize" in (raw_data.get("highlights", "").lower()) if raw_data.get("highlights") else False,
            )
        except Exception as e:
            logger.error(f"Failed to parse Unstop event: {e}")
            return None
