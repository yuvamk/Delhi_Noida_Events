import sys
import os
from loguru import logger

# ─── Loguru Consistency ──────────────────────────────────────────
# Loguru defaults to stderr, which causes ScraperManager to label
# everything as ERROR. Switching to stdout for clean streaming.
logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

# ─── Path Fix ───────────────────────────────────────────────────
# Adds the 'scraper' directory to sys.path so 'from scrapers...' works
# even if run directly as 'python scrapers/dynamic_browser_scraper.py'
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import asyncio
import signal
from typing import List, Dict, Optional, Any
from datetime import datetime
from playwright.async_api import async_playwright, BrowserContext, Page
from loguru import logger
from scrapers.base_scraper import BaseScraper, EventModel
from utils.ai_extractor import AIExtractor
from utils.api_client import APIClient
import uuid

# ─── Direct Event Listing Sites (No Google needed) ──────────────
DIRECT_SOURCES = [
    {
        "name": "Insider.in Delhi",
        "url": "https://insider.in/delhi",
        "event_card_selector": "[class*='event-card'], [class*='eventCard'], article",
        "title_selector": "h2, h3, [class*='title']",
        "link_selector": "a",
    },
    {
        "name": "BookMyShow Delhi Events",
        "url": "https://in.bookmyshow.com/explore/events-delhi",
        "event_card_selector": "[class*='event'], [class*='card'], li",
        "title_selector": "h3, h4, p, [class*='name']",
        "link_selector": "a",
    },
    {
        "name": "Insider.in Noida",
        "url": "https://insider.in/noida",
        "event_card_selector": "[class*='event-card'], [class*='eventCard'], article",
        "title_selector": "h2, h3, [class*='title']",
        "link_selector": "a",
    },
    {
        "name": "Meetup Delhi Tech",
        "url": "https://www.meetup.com/find/?keywords=tech&location=Delhi%2C+India",
        "event_card_selector": "[class*='eventCard'], article, [data-testid*='event']",
        "title_selector": "h3, h2",
        "link_selector": "a",
    },
    {
        "name": "Nasscom Events",
        "url": "https://nasscom.in/events/",
        "event_card_selector": "article, [class*='event']",
        "title_selector": "h2, h3",
        "link_selector": "a",
    },
    {
        "name": "Eventbrite Delhi",
        "url": "https://www.eventbrite.com/d/india--delhi/events/",
        "event_card_selector": "[class*='event-card'], article, [data-testid*='event']",
        "title_selector": "h2, h3",
        "link_selector": "a",
    },
]

GOOGLE_QUERIES = [
    "site:insider.in events in Delhi 2026",
    "site:in.bookmyshow.com events delhi 2026",
    "events in Delhi NCR this weekend",
    "upcoming tech meetups Delhi 2026",
    "concerts Delhi Noida 2026",
    "hackathon delhi 2026",
    "comedy show delhi this month",
    "food festival noida 2026",
]


class DynamicBrowserScraper(BaseScraper):
    """
    Visible browser scraper — aap dekh sakte hain kya ho raha hai.
    Insider.in, BookMyShow, Meetup, Eventbrite se continuously scrape karta hai.
    """

    def __init__(self, headed: bool = True, continuous: bool = False):
        super().__init__()
        self.source_name = "ai_discovery"
        self.ai = AIExtractor()
        self.api = APIClient()
        self.headed = headed          # True = browser visible; False = headless
        self.continuous = continuous  # True = jab tak Ctrl+C nahi
        self.scraped_urls: set = set()
        self.stop_flag = False
        self.job_id = f"job-{uuid.uuid4().hex[:8]}"
        self.total_inserted = 0

    def _handle_stop(self, signum, frame):
        logger.warning("⏹️  Stop signal received. Finishing current page...")
        self.stop_flag = True

    async def _launch_browser(self, playwright):
        """Try browsers in order: System Chrome → Firefox → WebKit.
        Prioritizes System Chrome for maximum stability."""
        
        # Option 1: System Chrome (Stable, fast, least likely to crash)
        import os
        system_chrome_paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/usr/bin/google-chrome"
        ]
        
        for path in system_chrome_paths:
            if os.path.exists(path):
                try:
                    logger.info(f"🌐 Found System Chrome at {path}...")
                    browser = await playwright.chromium.launch(
                        executable_path=path,
                        headless=not self.headed,
                        slow_mo=500 if self.headed else 0,
                        args=["--no-sandbox", "--disable-dev-shm-usage"],
                    )
                    logger.success("✅ System Chrome launched!")
                    return browser, "chrome"
                except Exception as e:
                    logger.warning(f"System Chrome failed: {e}")

        # Option 2: Firefox (native ARM build, very stable)
        try:
            logger.info("🦊 Trying Firefox...")
            browser = await playwright.firefox.launch(
                headless=not self.headed,
                slow_mo=500 if self.headed else 0,
            )
            logger.success("✅ Firefox launched successfully!")
            return browser, "firefox"
        except Exception as e:
            logger.warning(f"Firefox failed: {e}")

        # Option 3: WebKit (macOS native)
        try:
            logger.info("🍎 Trying WebKit (macOS native)...")
            browser = await playwright.webkit.launch(
                headless=not self.headed,
                slow_mo=500 if self.headed else 0,
            )
            logger.success("✅ WebKit launched successfully!")
            return browser, "webkit"
        except Exception as e:
            logger.warning(f"WebKit failed: {e}")

        raise RuntimeError("No working browser found. Please install Google Chrome.")

    async def _ensure_page(self, p: Any) -> Optional[Page]:
        """Ensures a browser, context, and page are alive. Re-launches if needed."""
        try:
            # 1. Check if browser is alive
            if not getattr(self, "browser", None) or not self.browser.is_connected():
                logger.info("🔄 Launching fresh browser instance...")
                self.browser, b_type = await self._launch_browser(p)
                self.context = await self.browser.new_context(
                    viewport={"width": 1280, "height": 800},
                    user_agent=(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    locale="en-IN",
                    timezone_id="Asia/Kolkata",
                )
                # Hide automation fingerprints
                await self.context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                    window.chrome = { runtime: {} };
                """)
                self.page = await self.context.new_page()
            
            # 2. Check if page is alive, if not create new one
            if self.page.is_closed():
                logger.debug("📄 Page was closed. Creating new page in existing context...")
                self.page = await self.context.new_page()
            
            return self.page
        except Exception as e:
            logger.error(f"Failed to ensure browser page: {e}")
            # Try to force cleanup and next call will retry
            try:
                if getattr(self, "browser", None):
                    await self.browser.close()
            except: pass
            self.browser = None
            return None

    async def scrape(self) -> List[EventModel]:
        all_found = []
        signal.signal(signal.SIGINT, self._handle_stop)
        signal.signal(signal.SIGTERM, self._handle_stop)

        try:
            async with async_playwright() as p:
                round_num = 0

                # Check backend health
                is_backend_up = await self.api.health_check()
                if not is_backend_up:
                    logger.warning(f"⚠️  Backend API unreachable at {self.api.base_url}. Running in dry-run mode.")
                else:
                    logger.info(f"🔗 Connected to backend: {self.api.base_url}")

                while not self.stop_flag:
                    round_num += 1
                    logger.info(f"\n{'='*50}")
                    logger.info(f"🔄  ROUND {round_num} — Scraping all sources...")
                    logger.info(f"{'='*50}")

                    # Ensure browser is ready for this round
                    page = await self._ensure_page(p)
                    if not page:
                        logger.error("❌ Could not establish browser. Waiting 10s and retrying...")
                        await asyncio.sleep(10)
                        continue

                    # ─── Phase 1: Scrape Direct Listing Sites ─────────
                    for source in DIRECT_SOURCES:
                        if self.stop_flag:
                            break
                        
                        # Re-ensure before each source in case of intermediate crash
                        page = await self._ensure_page(p)
                        if not page: break
                        
                        try:
                            await self._scrape_direct_source(page, source, all_found)
                        except Exception as e:
                            logger.error(f"Source scrape error ({source['name']}): {e}")
                        await asyncio.sleep(2)

                    # ─── Phase 2: Google Search Discovery ─────────────
                    for query in GOOGLE_QUERIES:
                        if self.stop_flag:
                            break
                        
                        page = await self._ensure_page(p)
                        if not page: break

                        try:
                            await self._google_search(page, query, all_found)
                        except Exception as e:
                            logger.error(f"Search query error ('{query}'): {e}")
                        await asyncio.sleep(3)

                    logger.success(
                        f"✅ Round {round_num} done. "
                        f"Total events found so far: {len(all_found)}"
                    )

                    if not self.continuous:
                        logger.info("Single-run mode. Done.")
                        break

                    logger.info("⏳ Waiting 60s before next round... (Ctrl+C to stop)")
                    for _ in range(60):
                        if self.stop_flag:
                            break
                        await asyncio.sleep(1)

                if getattr(self, "browser", None):
                    await self.browser.close()
                logger.success(f"🏁 Browser closed. Total events scraped: {len(all_found)}")

        except Exception as e:
            logger.error(f"Browser scraper fatal error: {e}")

        return all_found

    async def _scrape_direct_source(
        self, page: Page, source: Dict, results: List[EventModel]
    ):
        url = source["url"]
        name = source["name"]
        logger.info(f"📍 Opening: {name} → {url}")

        try:
            await page.goto(url, timeout=45000, wait_until="domcontentloaded")
            # Wait for content
            await asyncio.sleep(3)
            await page.mouse.move(400, 400)  # simulate human behavior
            await asyncio.sleep(1)

            # Take full text for AI extraction
            text_content = await page.evaluate("() => document.body.innerText")
            page_title = await page.title()

            logger.info(
                f"  📄 Page loaded: '{page_title}' "
                f"({len(text_content)} chars)"
            )

            if len(text_content.strip()) < 100:
                logger.warning(f"  ⚠️  {name}: Page seems empty (bot blocked?)")
                return

            # Extract ALL event links and potential images
            links = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => ({ href: a.href, text: a.innerText.trim() }))
                    .filter(l => l.text.length > 10 && l.href.startsWith('http'))
                    .slice(0, 50);
            }""")

            # Get image candidates for the summary page
            image_candidates = await self._extract_page_metadata(page)

            logger.info(f"  🔗 Found {len(links)} potential event links")

            # Use AI to extract events from the summary page first
            # Passing image candidates to the extractor
            events = await self.ai.extract_multiple_events(text_content, url, image_candidates)
            for e in events:
                if e and e.source_url not in self.scraped_urls:
                    self.scraped_urls.add(e.source_url)
                    results.append(e)
                    logger.success(f"  🌟 Event found: {e.title}")
                    
                    # Real-time save to DB
                    save_res = await self.api.send_events([e], self.job_id)
                    self.total_inserted += save_res.get("sent", 0)

            # Then crawl individual event links
            event_links = [
                l["href"] for l in links
                if any(k in l["href"] for k in [
                    "/event", "/show", "events/", "meetup.com/events",
                    "insider.in/", "bookmyshow", "/e/"
                ])
                and l["href"] not in self.scraped_urls
            ]

            logger.info(
                f"  🕷️  Crawling {min(len(event_links), 8)} individual event pages..."
            )

            for event_url in event_links[:8]:
                if self.stop_flag:
                    break
                await self._crawl_event_page(page, event_url, results)
                await asyncio.sleep(1.5)

        except Exception as e:
            logger.error(f"  ❌ Failed {name}: {e}")

    async def _google_search(self, page: Page, query: str, results: List[EventModel]):
        logger.info(f"🔍 Google: '{query}'")
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}&hl=en&gl=IN"

        try:
            await page.goto(search_url, timeout=30000, wait_until="domcontentloaded")
            await asyncio.sleep(2)

            # Extract result links (avoid Google's own pages)
            links = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(href =>
                        href.startsWith('http') &&
                        !href.includes('google.com') &&
                        !href.includes('accounts.google') &&
                        !href.includes('support.google')
                    )
                    .slice(0, 20);
            }""")

            logger.info(f"  🔗 {len(links)} Google results found")

            for link in links[:6]:  # Check top 6 results
                if self.stop_flag:
                    break
                if link not in self.scraped_urls:
                    await self._crawl_event_page(page, link, results)
                    await asyncio.sleep(2)

        except Exception as e:
            logger.debug(f"  Google search failed: {e}")

    async def _crawl_event_page(
        self, page: Page, url: str, results: List[EventModel]
    ):
        if url in self.scraped_urls:
            return
        self.scraped_urls.add(url)

        try:
            logger.info(f"    🌐 Crawling: {url[:80]}...")
            await page.goto(url, timeout=25000, wait_until="domcontentloaded")
            await asyncio.sleep(1.5)

            text_content = await page.evaluate("() => document.body.innerText")
            page_title = await page.title()

            if len(text_content.strip()) < 150:
                return

            # Extract image candidates
            image_candidates = await self._extract_page_metadata(page)
            logger.info(f"    🖼️  Found {len(image_candidates)} image candidates")

            event = await self.ai.extract_event_from_text(text_content, url, image_candidates)
            if event:
                results.append(event)
                logger.success(f"    ✅ Event: '{event.title}' in {event.city} ({len(event.images)} images)")
                
                # Real-time save to DB
                save_res = await self.api.send_events([event], self.job_id)
                self.total_inserted += save_res.get("sent", 0)

        except Exception as e:
            logger.debug(f"    Crawl error for {url[:60]}: {e}")

    async def _extract_page_metadata(self, page: Page) -> List[str]:
        """Extract high-quality image URLs from the page."""
        try:
            images = await page.evaluate("""() => {
                const urls = new Set();
                
                // 1. Check OpenGraph and Twitter images
                const og = document.querySelector('meta[property="og:image"]');
                if (og && og.content) urls.add(og.content);
                
                const tw = document.querySelector('meta[name="twitter:image"]');
                if (tw && tw.content) urls.add(tw.content);

                // 2. Check main event images (common patterns)
                const selectors = [
                    'img[src*="event"]', 'img[src*="poster"]', 'img[src*="banner"]',
                    'img[class*="event"]', 'img[class*="poster"]', 'img[class*="banner"]',
                    'article img', 'main img', '.event-detail img'
                ];
                
                selectors.forEach(s => {
                    document.querySelectorAll(s).forEach(img => {
                        if (img.src && img.src.startsWith('http')) {
                            // Filter out small icons/avatars
                            if (img.naturalWidth > 200 || img.width > 200 || !img.width) {
                                urls.add(img.src);
                            }
                        }
                    });
                });

                return Array.from(urls).filter(u => !u.includes('logo') && !u.includes('icon')).slice(0, 10);
            }""")
            return images
        except Exception:
            return []

    async def parse_event(self, raw_data: Dict[str, Any]) -> Optional[EventModel]:
        return None


# ─── Standalone Runner ──────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    from dotenv import load_dotenv
    load_dotenv()

    parser = argparse.ArgumentParser(description="Dynamic Browser Scraper")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode (no visible browser)")
    parser.add_argument("--continuous", action="store_true", help="Keep scraping until Ctrl+C")
    args = parser.parse_args()

    headed = not args.headless
    continuous = args.continuous

    logger.info(f"Starting scraper: headed={headed}, continuous={continuous}")
    logger.info("Press Ctrl+C to stop at any time.\n")

    async def run():
        scraper = DynamicBrowserScraper(headed=headed, continuous=continuous)
        events = await scraper.scrape()
        print(f"\n{'='*50}")
        print(f"FINAL: {len(events)} events scraped")
        for e in events[:10]:
            print(f"  • {e.title} | {e.city} | {e.date.strftime('%Y-%m-%d')}")

    asyncio.run(run())
