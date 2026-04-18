"""
Base Scraper - Abstract base class for all Delhi-Noida Event scrapers.
All scrapers inherit from this class.
"""
import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger
from pydantic import BaseModel, HttpUrl
from tenacity import retry, stop_after_attempt, wait_exponential


class EventModel(BaseModel):
    """Pydantic model for event data validation."""
    title: str
    description: str = ""
    category: str = "Meetup"
    city: str  # "Delhi" or "Noida"
    date: datetime
    end_date: Optional[datetime] = None
    time: str = "TBD"
    venue: str = ""
    address: str = ""
    price_amount: float = 0.0
    price_currency: str = "INR"
    price_type: str = "Free"  # Free | Paid | RSVP
    registration_url: str = ""
    images: List[str] = []
    tags: List[str] = []
    organizer_name: str = ""
    organizer_email: str = ""
    organizer_website: str = ""
    capacity: Optional[int] = None
    attendees: Optional[int] = None
    source: str
    source_url: str
    source_id: Optional[str] = None
    online_event: bool = False
    featured: bool = False
    verified: bool = False


class BaseScraper(ABC):
    """
    Abstract base class for all event scrapers.
    
    Features:
    - Automatic retry with exponential backoff
    - User agent rotation
    - Rate limiting per source
    - Unified logging
    - Data validation via Pydantic
    """
    
    def __init__(self):
        self.source_name: str = "unknown"
        self.base_url: str = ""
        self.city_targets: List[str] = ["Delhi", "Noida"]
        self.rate_limit_seconds: float = 2.0  # seconds between requests
        self.max_retries: int = 3
        self._session = None
        
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        ]
        self._ua_index = 0
    
    @property
    def current_user_agent(self) -> str:
        """Rotate user agent every 10 requests."""
        ua = self.user_agents[self._ua_index % len(self.user_agents)]
        self._ua_index += 1
        return ua
    
    @property
    def default_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self.current_user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8,hi;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
        }
    
    @abstractmethod
    async def scrape(self) -> List[EventModel]:
        """Main scraping method. Must be implemented by each scraper."""
        pass
    
    @abstractmethod
    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        """Parse a single event from raw scraped data."""
        pass
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def fetch_page(self, url: str, params: Optional[Dict] = None) -> Optional[str]:
        """Fetch a page with retry logic."""
        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    headers=self.default_headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=30),
                    ssl=False,
                ) as response:
                    if response.status == 200:
                        return await response.text()
                    elif response.status == 429:
                        logger.warning(f"Rate limited by {self.source_name}. Waiting...")
                        await asyncio.sleep(60)
                        raise Exception("Rate limited")
                    else:
                        logger.error(f"HTTP {response.status} from {url}")
                        return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            raise
    
    async def sleep(self, seconds: Optional[float] = None):
        """Respectful rate limiting."""
        await asyncio.sleep(seconds or self.rate_limit_seconds)
    
    def validate_event(self, event: EventModel) -> bool:
        """Validate a parsed event before saving."""
        if not event.title or len(event.title) < 5:
            logger.warning(f"Event rejected: title too short '{event.title}'")
            return False
        # Accept Delhi, Noida, Gurgaon, and NCR variants
        valid_cities = ["Delhi", "Noida", "Gurgaon", "Gurugram", "Faridabad", "NCR"]
        if event.city not in valid_cities:
            logger.warning(f"Event rejected: invalid city '{event.city}'")
            return False
        if not event.date:
            logger.warning(f"Event rejected: no date for '{event.title}'")
            return False
        # Reject events more than 7 days in the past
        from datetime import timedelta
        if event.date < datetime.now() - timedelta(days=7):
            return False
        return True
    
    def normalize_city(self, location_text: str) -> Optional[str]:
        """Normalize location text to city name."""
        text = location_text.lower()
        if any(kw in text for kw in ["delhi", "new delhi", "dwarka", "rohini", "saket", "gurugram", "gurgaon", "faridabad"]):
            return "Delhi"
        if any(kw in text for kw in ["noida", "greater noida", "sector 62", "sector 18"]):
            return "Noida"
        return None
    
    def extract_price(self, price_text: str) -> Dict[str, Any]:
        """Extract price information from text."""
        text = price_text.lower().strip()
        if any(kw in text for kw in ["free", "no cost", "complimentary", "0"]):
            return {"amount": 0, "currency": "INR", "type": "Free"}
        if any(kw in text for kw in ["rsvp", "register"]):
            return {"amount": 0, "currency": "INR", "type": "RSVP"}
        
        import re
        numbers = re.findall(r'[\d,]+', text)
        if numbers:
            amount = float(numbers[0].replace(",", ""))
            return {"amount": amount, "currency": "INR", "type": "Paid"}
        
        return {"amount": 0, "currency": "INR", "type": "Free"}
    
    async def run(self) -> Dict[str, Any]:
        """Run the scraper and return results."""
        logger.info(f"🚀 Starting {self.source_name} scraper...")
        start_time = datetime.now()
        
        try:
            events = await self.scrape()
            valid_events = [e for e in events if self.validate_event(e)]
            
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.success(
                f"✅ {self.source_name}: {len(valid_events)}/{len(events)} events scraped in {elapsed:.1f}s"
            )
            
            return {
                "source": self.source_name,
                "total_found": len(events),
                "valid_events": valid_events,
                "duration_seconds": elapsed,
                "status": "success",
            }
        except Exception as e:
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.error(f"❌ {self.source_name} scraper failed: {e}")
            return {
                "source": self.source_name,
                "total_found": 0,
                "valid_events": [],
                "duration_seconds": elapsed,
                "status": "failed",
                "error": str(e),
            }
