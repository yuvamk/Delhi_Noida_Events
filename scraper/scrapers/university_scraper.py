"""
IIT Delhi / University Events Scraper.
Scrapes events from IIT Delhi, IIT Roorkee, Delhi University, Amity, IIIT Delhi, etc.
Uses HTML parsing via BeautifulSoup + Playwright for JS-rendered pages.
"""
import asyncio
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper, EventModel

UNIVERSITY_SOURCES = [
    {
        "name": "IIT Delhi",
        "url": "https://home.iitd.ac.in/events.php",
        "city": "Delhi",
        "selectors": {"list": ".event-item, .event_list li, article.event", "title": "h2, h3, .event-title", "date": "time, .date, .event-date"},
        "organizer": "IIT Delhi",
    },
    {
        "name": "IIIT Delhi",
        "url": "https://iiitd.ac.in/events",
        "city": "Delhi",
        "selectors": {"list": ".views-row, .event-item, li.event", "title": "h3, h2, .title", "date": ".date-display-single, .field-name-body"},
        "organizer": "IIIT Delhi",
    },
    {
        "name": "Delhi University",
        "url": "http://www.du.ac.in/du/index.php?page=events",
        "city": "Delhi",
        "selectors": {"list": "li, .event, tr", "title": "a, .title", "date": ".date, td"},
        "organizer": "Delhi University",
    },
    {
        "name": "Amity University Noida",
        "url": "https://www.amity.edu/events",
        "city": "Noida",
        "selectors": {"list": ".event-item, .box, article", "title": "h3, h4, .title", "date": ".date, .event-date"},
        "organizer": "Amity University",
    },
    {
        "name": "Jaypee Institute",
        "url": "https://www.jiit.ac.in/events",
        "city": "Noida",
        "selectors": {"list": ".event, li.event-item, .card", "title": "h2, h3, .title", "date": ".date"},
        "organizer": "JIIT Noida",
    },
]


class IITDelhiScraper(BaseScraper):
    """
    Scrapes multiple Delhi/Noida university event pages.
    Named IITDelhiScraper but handles all university sources.
    """

    def __init__(self):
        super().__init__()
        self.source_name = "iit_delhi"
        self.rate_limit_seconds = 4.0

    async def scrape(self) -> List[EventModel]:
        all_events = []
        for source in UNIVERSITY_SOURCES:
            try:
                logger.info(f"Scraping {source['name']}...")
                html = await self.fetch_page(source["url"])
                if html:
                    events = await self._parse_university(html, source)
                    all_events.extend(events)
                    logger.info(f"  → {len(events)} events from {source['name']}")
                await self.sleep()
            except Exception as e:
                logger.warning(f"Failed to scrape {source['name']}: {e}")
        return all_events

    async def _parse_university(self, html: str, source: Dict) -> List[EventModel]:
        soup = BeautifulSoup(html, "lxml")
        selectors = source["selectors"]

        # Try each list selector
        cards = []
        for sel in selectors["list"].split(","):
            cards = soup.select(sel.strip())
            if cards:
                break

        events = []
        for card in cards[:15]:
            try:
                event = await self.parse_event({"card": card, "source": source})
                if event:
                    events.append(event)
            except Exception as e:
                logger.debug(f"University card parse error: {e}")
        return events

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        card = raw_data.get("card")
        source = raw_data.get("source", {})
        if not card:
            return None

        try:
            selectors = source.get("selectors", {})
            city = source.get("city", "Delhi")
            organizer = source.get("organizer", "University")

            # Title
            title_el = None
            for sel in selectors.get("title", "h2").split(","):
                title_el = card.select_one(sel.strip())
                if title_el:
                    break
            title = title_el.get_text(strip=True) if title_el else card.get_text(strip=True)[:100]
            if not title or len(title) < 5:
                return None

            # Link
            link_el = card.find("a", href=True)
            source_url = ""
            if link_el:
                href = link_el["href"]
                base = source.get("url", "")
                from urllib.parse import urljoin
                source_url = urljoin(base, href)

            # Date
            date_el = None
            for sel in selectors.get("date", ".date").split(","):
                date_el = card.select_one(sel.strip())
                if date_el:
                    break

            date_text = ""
            if date_el:
                date_text = date_el.get("datetime", "") or date_el.get_text(strip=True)
            event_date = self._parse_any_date(date_text) or datetime(2025, 8, 15, 10, 0)

            # Description from card text
            desc_el = card.find(class_=lambda c: c and "desc" in str(c).lower())
            desc = desc_el.get_text(strip=True) if desc_el else f"Event by {organizer}: {title}"

            return EventModel(
                title=title,
                description=desc[:2000] or f"{organizer} event: {title}",
                category=self._guess_category(title, organizer),
                city=city,
                date=event_date,
                time="10:00 AM",
                venue=organizer,
                address=f"{organizer}, {city}",
                price_amount=0.0,
                price_currency="INR",
                price_type="Free",
                registration_url=source_url or source.get("url", ""),
                images=[],
                tags=[organizer.lower(), city.lower(), self._guess_category(title, organizer).lower()],
                organizer_name=organizer,
                source=self.source_name,
                source_url=source_url or source.get("url", ""),
                verified=True,  # University events are pre-verified
            )
        except Exception as e:
            logger.debug(f"University parse error: {e}")
            return None

    def _parse_any_date(self, text: str) -> Optional[datetime]:
        if not text:
            return None
        month_map = {
            "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
            "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
        }
        # ISO format
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00"))
        except Exception:
            pass
        # Try regex patterns
        patterns = [
            r"(\d{1,2})[\s/-](\w{3,9})[\s/-](\d{4})",
            r"(\d{4})-(\d{2})-(\d{2})",
            r"(\d{1,2})/(\d{1,2})/(\d{4})",
        ]
        for pattern in patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                try:
                    g = m.groups()
                    if len(g) == 3:
                        day, month, year = g
                        if month.lower()[:3] in month_map:
                            return datetime(int(year), month_map[month.lower()[:3]], int(day))
                        elif month.isdigit():
                            return datetime(int(year), int(month), int(day))
                except Exception:
                    continue
        return None

    def _guess_category(self, title: str, organizer: str) -> str:
        t = (title + " " + organizer).lower()
        if any(k in t for k in ["tech", "coding", "programming", "hackathon", "robot", "ai", "ml"]):
            return "Tech" if "hack" not in t else "Hackathon"
        if any(k in t for k in ["cultural", "fest", "music", "dance", "art"]):
            return "Cultural"
        if any(k in t for k in ["sport", "game", "tournament"]):
            return "Sports"
        if any(k in t for k in ["talk", "lecture", "seminar", "workshop", "session"]):
            return "Education"
        return "Education"
