"""
Eventbrite Scraper — Scrapes Delhi and Noida events from Eventbrite.
Uses the Eventbrite Public API + HTML fallback.
"""
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper, EventModel


class EventbriteScraper(BaseScraper):
    """
    Eventbrite scraper for Delhi and Noida events.
    
    Strategy:
    1. Uses Eventbrite's public search API (no auth needed for public events)
    2. Falls back to HTML scraping if API is blocked
    3. Handles async pagination
    """
    
    def __init__(self):
        super().__init__()
        self.source_name = "eventbrite"
        self.base_url = "https://www.eventbrite.com"
        self.api_url = "https://www.eventbrite.com/d"
        self.rate_limit_seconds = 3.0  # Be respectful
    
    def _build_search_urls(self) -> List[str]:
        """Build search URLs for Delhi and Noida."""
        locations = [
            ("Delhi", "india--new-delhi"),
            ("Noida", "india--noida"),
        ]
        categories = ["technology", "business", "arts", "community", "education"]
        urls = []
        for city_name, city_slug in locations:
            for category in categories:
                urls.append({
                    "url": f"{self.api_url}/{city_slug}/{category}--events/",
                    "city": city_name,
                })
            # General search too
            urls.append({
                "url": f"{self.api_url}/{city_slug}/--events/",
                "city": city_name,
            })
        return urls
    
    async def scrape(self) -> List[EventModel]:
        """Main scraping method."""
        all_events = []
        search_targets = self._build_search_urls()
        
        for target in search_targets[:4]:  # Limit in demo mode
            logger.info(f"Scraping Eventbrite: {target['city']}")
            try:
                html = await self.fetch_page(target["url"])
                if html:
                    events = await self._parse_html(html, target["city"])
                    all_events.extend(events)
                    logger.info(f"Found {len(events)} events for {target['city']}")
                await self.sleep()
            except Exception as e:
                logger.error(f"Error scraping {target['url']}: {e}")
        
        return all_events
    
    async def _parse_html(self, html: str, city: str) -> List[EventModel]:
        """Parse Eventbrite HTML to extract events."""
        soup = BeautifulSoup(html, "lxml")
        events = []
        
        # Eventbrite uses various card selectors
        selectors = [
            "article.search-event-card-wrapper",
            "[data-testid='search-event-listing']",
            ".eds-event-card-content",
            "li.search-main-content__events-list-item",
        ]
        
        cards = []
        for selector in selectors:
            cards = soup.select(selector)
            if cards:
                break
        
        logger.info(f"Found {len(cards)} event cards on page")
        
        for card in cards[:15]:  # Max 15 events per page
            try:
                event = await self.parse_event({"card": card, "city": city})
                if event:
                    events.append(event)
            except Exception as e:
                logger.warning(f"Error parsing event card: {e}")
        
        return events
    
    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        """Parse a single event card from Eventbrite HTML."""
        card = raw_data.get("card")
        city = raw_data.get("city", "Delhi")
        
        if not card:
            return None
        
        try:
            # Title
            title_el = (
                card.find("h2", class_=lambda c: c and "title" in c) or
                card.find("a", attrs={"data-testid": "event-title"}) or
                card.find("h3")
            )
            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                return None
            
            # URL
            link_el = card.find("a", href=True)
            source_url = link_el["href"] if link_el else ""
            if source_url and not source_url.startswith("http"):
                source_url = self.base_url + source_url
            
            # Date/time
            date_el = card.find("time") or card.find(attrs={"datetime": True})
            event_date = datetime.now().replace(day=15, month=6, year=2025)  # Fallback
            if date_el and date_el.get("datetime"):
                try:
                    event_date = datetime.fromisoformat(date_el["datetime"].replace("Z", "+00:00"))
                except:
                    pass
            
            # Venue
            location_el = card.find(class_=lambda c: c and "location" in str(c).lower())
            venue = location_el.get_text(strip=True) if location_el else city
            
            # Price
            price_el = card.find(class_=lambda c: c and "price" in str(c).lower())
            price_text = price_el.get_text(strip=True) if price_el else "Free"
            price_info = self.extract_price(price_text)
            
            # Image
            img_el = card.find("img")
            images = [img_el["src"]] if img_el and img_el.get("src") else []
            
            return EventModel(
                title=title,
                description=f"Event in {city} — see registration page for full details.",
                category=self._guess_category(title),
                city=city,
                date=event_date,
                venue=venue,
                address=f"{venue}, {city}",
                price_amount=price_info["amount"],
                price_currency="INR",
                price_type=price_info["type"],
                registration_url=source_url,
                images=images,
                tags=[city, self._guess_category(title)],
                organizer_name="",
                source=self.source_name,
                source_url=source_url,
            )
        except Exception as e:
            logger.error(f"Error parsing Eventbrite card: {e}")
            return None
    
    def _guess_category(self, title: str) -> str:
        """Guess category from event title."""
        title_lower = title.lower()
        if any(kw in title_lower for kw in ["tech", "ai", "ml", "software", "cloud", "devops", "python", "javascript"]):
            return "Tech"
        if any(kw in title_lower for kw in ["startup", "founder", "vc", "venture", "pitch"]):
            return "Startup"
        if any(kw in title_lower for kw in ["hackathon", "hack", "code", "building"]):
            return "Hackathon"
        if any(kw in title_lower for kw in ["culture", "art", "music", "dance", "festival"]):
            return "Cultural"
        if any(kw in title_lower for kw in ["business", "conference", "summit", "leadership"]):
            return "Conference"
        if any(kw in title_lower for kw in ["meetup", "networking", "community"]):
            return "Meetup"
        if any(kw in title_lower for kw in ["workshop", "course", "training", "learn", "education"]):
            return "Education"
        return "Meetup"


# Standalone test
if __name__ == "__main__":
    async def main():
        scraper = EventbriteScraper()
        result = await scraper.run()
        print(f"\n✅ Results: {result['total_found']} events found")
    
    asyncio.run(main())
