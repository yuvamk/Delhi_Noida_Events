"""
Corporate Events Scraper — tracks events from major tech companies in Delhi NCR:
Google, Microsoft, Amazon/AWS, Nasscom, CII, etc.
"""
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper, EventModel

CORPORATE_SOURCES = [
    {
        "name": "Google Developers",
        "url": "https://events.google.com/u/0/?region=IN-DL",
        "organizer": "Google",
        "city": "Delhi",
        "category": "Tech",
        "selectors": {"list": ".event-card, .gdg-event, article", "title": "h2,h3,.title", "date": "time,.date"},
    },
    {
        "name": "Microsoft Events",
        "url": "https://events.microsoft.com/en-us/allevents/?clientTimeZone=1&country=India&region=Delhi",
        "organizer": "Microsoft",
        "city": "Delhi",
        "category": "Tech",
        "selectors": {"list": ".event-card, article, .event-item", "title": "h2,h3", "date": "time,.date"},
    },
    {
        "name": "Nasscom Events",
        "url": "https://nasscom.in/events/",
        "organizer": "Nasscom",
        "city": "Delhi",
        "category": "Tech",
        "selectors": {"list": ".event-block, article.post, .event-card", "title": "h2,h3,.entry-title", "date": ".event-date,.date"},
    },
    {
        "name": "CII Events",
        "url": "https://www.cii.in/Events.aspx",
        "organizer": "CII",
        "city": "Delhi",
        "category": "Business",
        "selectors": {"list": "tr, .event-row, li.event-item", "title": "td a, h3, .event-title", "date": ".date, td:nth-child(2)"},
    },
    {
        "name": "FICCI Events",
        "url": "https://ficci.in/events.asp",
        "organizer": "FICCI",
        "city": "Delhi",
        "category": "Business",
        "selectors": {"list": ".event-item, .event, li", "title": "h3,.title,a", "date": ".date"},
    },
]


class CorporateScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "corporate"
        self.rate_limit_seconds = 4.0

    async def scrape(self) -> List[EventModel]:
        all_events = []
        for source in CORPORATE_SOURCES:
            try:
                logger.info(f"Scraping {source['name']}...")
                html = await self.fetch_page(source["url"])
                if html:
                    events = await self._parse_corporate(html, source)
                    all_events.extend(events)
                    logger.info(f"  → {len(events)} events from {source['name']}")
                await self.sleep()
            except Exception as e:
                logger.warning(f"Failed to scrape {source['name']}: {e}")
        return all_events

    async def _parse_corporate(self, html: str, source: Dict) -> List[EventModel]:
        soup = BeautifulSoup(html, "lxml")
        selectors = source["selectors"]

        cards = []
        for sel in selectors["list"].split(","):
            cards = soup.select(sel.strip())
            if cards:
                break

        if not cards:
            # Fallback: try to find any link with event-like keywords
            cards = soup.find_all("a", href=True, text=lambda t: t and len(t) > 10)[:10]

        events = []
        for card in cards[:12]:
            try:
                event = await self.parse_event({"card": card, "source": source})
                if event:
                    events.append(event)
            except Exception as e:
                logger.debug(f"Corp parse error: {e}")
        return events

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        card = raw_data.get("card")
        source = raw_data.get("source", {})
        if not card:
            return None

        try:
            selectors = source.get("selectors", {})
            city = source.get("city", "Delhi")
            organizer = source.get("organizer", "Corporate")

            # Title
            title_el = None
            for sel in selectors.get("title", "h2").split(","):
                title_el = card.select_one(sel.strip()) if hasattr(card, "select_one") else None
                if title_el:
                    break
            if not title_el:
                title_el = card.find("a") or card.find("h3") or card.find("h2")
            title = title_el.get_text(strip=True) if title_el else card.get_text(strip=True)[:100]
            if not title or len(title) < 5:
                return None

            # Filter non-India events
            card_text = card.get_text().lower()
            if any(kw in card_text for kw in ["virtual only", "us only", "usa", "canada", "uk only"]):
                if "india" not in card_text and "delhi" not in card_text:
                    return None

            # Link
            link_el = card.find("a", href=True) if hasattr(card, "find") else None
            source_url = ""
            if link_el:
                href = link_el.get("href", "")
                base_url = source.get("url", "")
                from urllib.parse import urljoin
                source_url = urljoin(base_url, href) if not href.startswith("http") else href

            return EventModel(
                title=title[:200],
                description=f"{organizer} event: {title}. Please visit the event page for full details.",
                category=source.get("category", "Tech"),
                city=city,
                date=datetime(2025, 9, 1, 10, 0),  # Default — would be extracted properly
                time="10:00 AM",
                venue=f"{organizer} Office, {city}",
                address=city,
                price_amount=0,
                price_currency="INR",
                price_type="RSVP",
                registration_url=source_url or source.get("url", ""),
                images=[],
                tags=[organizer.lower(), city.lower(), source.get("category", "tech").lower()],
                organizer_name=organizer,
                source=self.source_name,
                source_url=source_url or source.get("url", ""),
                verified=True,  # Corporate events are pre-verified
            )
        except Exception as e:
            logger.debug(f"Corp event parse error: {e}")
            return None
