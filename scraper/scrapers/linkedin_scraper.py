"""
LinkedIn Events Scraper using Playwright (headless browser).
LinkedIn requires login and renders content via JavaScript.
"""
import asyncio
import os
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger

from scrapers.base_scraper import BaseScraper, EventModel

try:
    from playwright.async_api import async_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("Playwright not installed. LinkedIn scraper disabled.")

LINKEDIN_SEARCH_URLS = [
    "https://www.linkedin.com/search/results/events/?keywords=tech%20event%20delhi",
    "https://www.linkedin.com/search/results/events/?keywords=startup%20meetup%20noida",
    "https://www.linkedin.com/search/results/events/?keywords=hackathon%20delhi%20ncr",
    "https://www.linkedin.com/search/results/events/?keywords=business%20conference%20delhi",
]


class LinkedInScraper(BaseScraper):
    """
    LinkedIn Events scraper using Playwright with saved session cookies.
    
    Setup:
    1. Run: python -c "from scrapers.linkedin_scraper import LinkedInScraper; import asyncio; asyncio.run(LinkedInScraper().save_session())"
    2. Login when browser opens, then close it
    3. Session will be saved to linkedin_session.json
    """

    def __init__(self):
        super().__init__()
        self.source_name = "linkedin"
        self.base_url = "https://www.linkedin.com"
        self.session_file = os.path.join(os.path.dirname(__file__), "../drivers/linkedin_session.json")
        self.rate_limit_seconds = 5.0  # LinkedIn is aggressive about rate limiting

    async def save_session(self):
        """Interactive: open browser, login manually, save cookies."""
        if not PLAYWRIGHT_AVAILABLE:
            logger.error("Playwright not available")
            return

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context()
            page = await context.new_page()
            await page.goto("https://www.linkedin.com/login")
            logger.info("Please login to LinkedIn. Close the browser when done.")
            await page.wait_for_url("**/feed/**", timeout=120000)
            cookies = await context.cookies()
            os.makedirs(os.path.dirname(self.session_file), exist_ok=True)
            with open(self.session_file, "w") as f:
                json.dump(cookies, f)
            logger.success("LinkedIn session saved!")
            await browser.close()

    async def scrape(self) -> List[EventModel]:
        if not PLAYWRIGHT_AVAILABLE:
            logger.warning("Playwright unavailable — skipping LinkedIn scraper")
            return []

        if not os.path.exists(self.session_file):
            logger.warning("No LinkedIn session found. Run save_session() first. Skipping.")
            return []

        all_events = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent=self.current_user_agent,
                viewport={"width": 1280, "height": 720},
            )

            # Load saved cookies
            try:
                with open(self.session_file) as f:
                    cookies = json.load(f)
                await context.add_cookies(cookies)
            except Exception as e:
                logger.error(f"Failed to load LinkedIn session: {e}")
                await browser.close()
                return []

            for url in LINKEDIN_SEARCH_URLS[:2]:  # Limit to 2 searches
                try:
                    page = await context.new_page()
                    events = await self._scrape_search_page(page, url)
                    all_events.extend(events)
                    await page.close()
                    await self.sleep(5)
                except Exception as e:
                    logger.error(f"LinkedIn scrape error for {url}: {e}")

            await browser.close()
        return all_events

    async def _scrape_search_page(self, page: "Page", url: str) -> List[EventModel]:
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            # Wait for results
            await page.wait_for_selector(".search-results__list, .events-search__results", timeout=10000)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)

            html = await page.content()
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "lxml")

            cards = soup.select(".entity-result__item, .event-card, .search-result")
            events = []
            for card in cards[:10]:
                event = await self.parse_event({"card": card})
                if event:
                    events.append(event)
            return events
        except Exception as e:
            logger.error(f"LinkedIn page scrape error: {e}")
            return []

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        card = raw_data.get("card")
        if not card:
            return None
        try:
            title_el = card.find(class_=lambda c: c and "title" in str(c).lower()) or card.find("a")
            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                return None

            link_el = card.find("a", href=True)
            source_url = link_el["href"] if link_el else ""
            if source_url and not source_url.startswith("http"):
                source_url = self.base_url + source_url

            date_el = card.find(class_=lambda c: c and "date" in str(c).lower())
            date_text = date_el.get_text(strip=True) if date_el else ""
            event_date = datetime(2025, 9, 1, 10, 0)

            location_el = card.find(class_=lambda c: c and "location" in str(c).lower())
            location_text = location_el.get_text(strip=True) if location_el else ""
            city = self.normalize_city(location_text) or "Delhi"

            return EventModel(
                title=title,
                description=f"LinkedIn event in {city}: {title}",
                category="Meetup",
                city=city,
                date=event_date,
                time="06:00 PM",
                venue=location_text or city,
                address=location_text or city,
                price_amount=0,
                price_currency="INR",
                price_type="RSVP",
                registration_url=source_url,
                images=[],
                tags=["linkedin", city.lower(), "networking"],
                organizer_name="LinkedIn",
                source=self.source_name,
                source_url=source_url,
            )
        except Exception as e:
            logger.debug(f"LinkedIn event parse error: {e}")
            return None
