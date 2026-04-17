"""
Meetup.com Scraper — Scrapes Delhi/Noida tech and community events from Meetup.
Uses their GraphQL API (no auth required for public events).
"""
import asyncio
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
import aiohttp

from scrapers.base_scraper import BaseScraper, EventModel

MEETUP_GRAPHQL_URL = "https://www.meetup.com/gql"

CITY_CONFIGS = [
    {"city": "Delhi",  "lat": 28.6139, "lon": 77.2090, "radius": 50},
    {"city": "Noida",  "lat": 28.5355, "lon": 77.3910, "radius": 30},
]

GQL_QUERY = """
query SearchEvents($lat: Float!, $lon: Float!, $radius: Int!, $after: String) {
  result: searchEvents(
    filter: {lat: $lat, lon: $lon, radius: $radius, startDateRange: "now"}
    input: {first: 50, after: $after}
  ) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        title
        description
        dateTime
        endTime
        duration
        eventUrl
        isOnline
        onlineVenue { url }
        venue {
          name
          address
          city
          state
          lat
          lon
        }
        group {
          name
          urlname
          city
        }
        maxTickets
        going
        images { baseUrl }
        fee { amount currency }
        topics { name }
        isAttending
      }
    }
  }
}
"""


class MeetupScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "meetup"
        self.base_url = "https://www.meetup.com"
        self.rate_limit_seconds = 2.0

    async def scrape(self) -> List[EventModel]:
        all_events = []
        for config in CITY_CONFIGS:
            logger.info(f"Scraping Meetup for {config['city']}...")
            events = await self._scrape_city(config)
            all_events.extend(events)
            await self.sleep()
        return all_events

    async def _scrape_city(self, config: Dict) -> List[EventModel]:
        events = []
        cursor = None

        for page in range(3):  # max 3 pages = 150 events
            try:
                payload = {
                    "query": GQL_QUERY,
                    "variables": {
                        "lat": config["lat"],
                        "lon": config["lon"],
                        "radius": config["radius"],
                        "after": cursor,
                    }
                }

                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        MEETUP_GRAPHQL_URL,
                        json=payload,
                        headers={**self.default_headers, "Content-Type": "application/json"},
                        timeout=aiohttp.ClientTimeout(total=30),
                    ) as resp:
                        if resp.status != 200:
                            logger.warning(f"Meetup API returned {resp.status}")
                            break
                        data = await resp.json()

                result = data.get("data", {}).get("result", {})
                edges = result.get("edges", [])

                for edge in edges:
                    event = await self.parse_event({"node": edge["node"], "city": config["city"]})
                    if event:
                        events.append(event)

                page_info = result.get("pageInfo", {})
                if not page_info.get("hasNextPage"):
                    break
                cursor = page_info.get("endCursor")
                await self.sleep(1.5)

            except Exception as e:
                logger.error(f"Meetup GQL error for {config['city']}: {e}")
                break

        return events

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        node = raw_data.get("node", {})
        default_city = raw_data.get("city", "Delhi")
        if not node:
            return None

        try:
            title = node.get("title", "").strip()
            if not title or len(title) < 5:
                return None

            # Date
            date_str = node.get("dateTime", "")
            try:
                event_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            except Exception:
                return None

            # End date
            end_date = None
            if node.get("endTime"):
                try:
                    end_date = datetime.fromisoformat(node["endTime"].replace("Z", "+00:00"))
                except Exception:
                    pass

            # Venue & city
            venue_data = node.get("venue") or {}
            venue_name = venue_data.get("name", "Online" if node.get("isOnline") else "TBD")
            venue_city = venue_data.get("city", "")
            city = self.normalize_city(venue_city) or default_city

            address_parts = filter(None, [
                venue_data.get("address", ""),
                venue_city,
            ])
            address = ", ".join(address_parts) or f"{venue_name}, {city}"

            # Price
            fee = node.get("fee") or {}
            fee_amount = float(fee.get("amount", 0) or 0)
            price_type = "Paid" if fee_amount > 0 else "RSVP" if not node.get("isOnline") else "Free"

            # Images
            images = []
            for img in node.get("images", []):
                base = img.get("baseUrl", "")
                if base:
                    images.append(f"{base}600x338.webp")

            # Tags from topics
            tags = [t["name"] for t in node.get("topics", []) if t.get("name")]

            # Description cleanup
            desc = node.get("description", "").strip()
            # strip HTML tags
            import re
            desc = re.sub(r"<[^>]+>", " ", desc).strip()
            desc = re.sub(r"\s+", " ", desc)[:2000]

            return EventModel(
                title=title,
                description=desc or f"Meetup event: {title}",
                category=self._classify_category(title, tags),
                city=city,
                date=event_date,
                end_date=end_date,
                time=event_date.strftime("%I:%M %p"),
                venue=venue_name,
                address=address,
                price_amount=fee_amount,
                price_currency=fee.get("currency", "USD"),
                price_type=price_type,
                registration_url=node.get("eventUrl", ""),
                images=images[:3],
                tags=tags[:10],
                organizer_name=node.get("group", {}).get("name", ""),
                capacity=node.get("maxTickets") or None,
                attendees=node.get("going") or 0,
                source=self.source_name,
                source_url=node.get("eventUrl", ""),
                source_id=node.get("id"),
                online_event=node.get("isOnline", False),
            )
        except Exception as e:
            logger.error(f"Failed to parse Meetup event: {e}")
            return None

    def _classify_category(self, title: str, tags: List[str]) -> str:
        text = (title + " " + " ".join(tags)).lower()
        if any(kw in text for kw in ["hackathon", "hack", "build", "code jam"]):
            return "Hackathon"
        if any(kw in text for kw in ["startup", "founder", "venture", "pitch", "vc"]):
            return "Startup"
        if any(kw in text for kw in ["ai", "ml", "machine learning", "data science", "python", "javascript", "cloud", "devops", "kubernetes"]):
            return "Tech"
        if any(kw in text for kw in ["business", "entrepreneurship", "leadership", "marketing"]):
            return "Business"
        if any(kw in text for kw in ["art", "music", "dance", "culture", "theatre"]):
            return "Cultural"
        if any(kw in text for kw in ["workshop", "training", "bootcamp", "course", "learn"]):
            return "Education"
        if any(kw in text for kw in ["conference", "summit", "congress", "symposium"]):
            return "Conference"
        return "Meetup"
