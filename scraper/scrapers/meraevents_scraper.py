"""
MeraEvents Scraper — India's largest event listing platform.
Scrapes Delhi/Noida events via HTML parsing.
"""
import asyncio
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper, EventModel

SEARCH_URLS = [
    {"url": "https://www.meraevents.com/events/delhi", "city": "Delhi"},
    {"url": "https://www.meraevents.com/events/noida", "city": "Noida"},
    {"url": "https://www.meraevents.com/tech-events/delhi", "city": "Delhi"},
    {"url": "https://www.meraevents.com/tech-events/noida", "city": "Noida"},
    {"url": "https://www.meraevents.com/business-events/delhi", "city": "Delhi"},
    {"url": "https://www.meraevents.com/cultural-events/delhi", "city": "Delhi"},
]


class MeraEventsScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "meraevents"
        self.base_url = "https://www.meraevents.com"
        self.rate_limit_seconds = 3.0

    async def scrape(self) -> List[EventModel]:
        all_events = []
        for target in SEARCH_URLS:
            try:
                logger.info(f"Scraping MeraEvents: {target['url']}")
                html = await self.fetch_page(target["url"])
                if html:
                    events = await self._parse_listing(html, target["city"])
                    all_events.extend(events)
                    logger.info(f"  → {len(events)} events from {target['city']}")
                await self.sleep()
            except Exception as e:
                logger.error(f"MeraEvents error for {target['url']}: {e}")
        return all_events

    async def _parse_listing(self, html: str, city: str) -> List[EventModel]:
        soup = BeautifulSoup(html, "lxml")
        events = []

        # Try multiple card selectors
        cards = (
            soup.select(".event-thumb")
            or soup.select(".event-card")
            or soup.select("[data-event-id]")
            or soup.select(".eventCard")
            or soup.select("article.event")
        )

        logger.debug(f"MeraEvents: found {len(cards)} cards")
        for card in cards[:20]:
            try:
                event = await self.parse_event({"card": card, "city": city})
                if event:
                    events.append(event)
            except Exception as e:
                logger.debug(f"MeraEvents card parse error: {e}")
        return events

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        card = raw_data.get("card")
        city = raw_data.get("city", "Delhi")
        if not card:
            return None

        try:
            # Title
            title_el = (
                card.find("h2") or card.find("h3")
                or card.find(class_=lambda c: c and "title" in c.lower())
                or card.find("a", class_=lambda c: c and "name" in str(c).lower())
            )
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 5:
                return None

            # Link
            link_el = card.find("a", href=True)
            source_url = ""
            if link_el:
                href = link_el["href"]
                source_url = href if href.startswith("http") else self.base_url + href

            # Date
            date_el = (
                card.find("time")
                or card.find(class_=lambda c: c and "date" in str(c).lower())
            )
            date_text = date_el.get_text(strip=True) if date_el else ""
            event_date = self._parse_date(date_text)
            if not event_date:
                event_date = datetime(2025, 7, 1, 9, 0)  # fallback

            # Venue
            venue_el = card.find(class_=lambda c: c and ("venue" in str(c).lower() or "location" in str(c).lower()))
            venue = venue_el.get_text(strip=True) if venue_el else city

            # Price
            price_el = card.find(class_=lambda c: c and "price" in str(c).lower())
            price_text = price_el.get_text(strip=True) if price_el else "Free"
            price_info = self.extract_price(price_text)

            # Image
            img_el = card.find("img")
            images = []
            if img_el:
                src = img_el.get("src") or img_el.get("data-src") or img_el.get("data-lazy-src")
                if src and src.startswith("http"):
                    images.append(src)

            return EventModel(
                title=title,
                description=f"Event in {city}: {title}. See the event page for full details.",
                category=self._guess_category(title),
                city=city,
                date=event_date,
                time="10:00 AM",
                venue=venue,
                address=f"{venue}, {city}",
                price_amount=price_info["amount"],
                price_currency="INR",
                price_type=price_info["type"],
                registration_url=source_url or self.base_url,
                images=images,
                tags=[city.lower(), self._guess_category(title).lower()],
                organizer_name="MeraEvents",
                source=self.source_name,
                source_url=source_url or self.base_url,
            )
        except Exception as e:
            logger.debug(f"MeraEvents parse error: {e}")
            return None

    def _parse_date(self, text: str) -> Optional[datetime]:
        """Try multiple date formats."""
        if not text:
            return None
        formats = [
            "%d %b %Y", "%B %d, %Y", "%d-%m-%Y", "%Y-%m-%d",
            "%d/%m/%Y", "%b %d, %Y", "%d %B %Y",
        ]
        text_clean = re.sub(r"\s+", " ", text).strip()
        # Extract date-like portion
        match = re.search(r"\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{4}", text_clean)
        date_str = match.group(0) if match else text_clean

        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except Exception:
                continue
        return None

    def _guess_category(self, title: str) -> str:
        t = title.lower()
        if any(k in t for k in ["tech", "ai", "ml", "cloud", "python", "java", "coding"]):
            return "Tech"
        if any(k in t for k in ["startup", "entrepreneur", "pitch", "venture"]):
            return "Startup"
        if any(k in t for k in ["music", "art", "dance", "culture", "film", "theatre"]):
            return "Cultural"
        if any(k in t for k in ["business", "finance", "marketing", "summit", "b2b"]):
            return "Business"
        if any(k in t for k in ["sport", "fitness", "yoga", "marathon", "tournament"]):
            return "Sports"
        if any(k in t for k in ["workshop", "course", "training", "boot", "learn"]):
            return "Education"
        if any(k in t for k in ["hackathon", "hack"]):
            return "Hackathon"
        if any(k in t for k in ["conference", "expo", "summit", "conclave"]):
            return "Conference"
        return "Meetup"
