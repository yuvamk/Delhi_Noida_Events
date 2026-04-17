"""
Event Normalizer — Standardizes scraped event data:
- Category classification using keyword matching
- City normalization
- Date/time normalization to IST
- Image URL validation & cleanup
- Tag normalization and deduplication
- Slug generation
"""
import re
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from loguru import logger

from scrapers.base_scraper import EventModel

IST = timezone(timedelta(hours=5, minutes=30))

CATEGORY_KEYWORDS = {
    "Hackathon": ["hackathon", "hack", "code jam", "coding challenge", "buildathon", "thon"],
    "Tech": ["tech", "technology", "ai", "ml", "machine learning", "data science", "python",
             "javascript", "typescript", "cloud", "aws", "azure", "gcp", "kubernetes",
             "docker", "devops", "cybersecurity", "blockchain", "web3", "iot", "robotics",
             "open source", "developer", "engineering", "software", "coding", "programming"],
    "Startup": ["startup", "founder", "entrepreneur", "venture", "vc funding", "angel investor",
                "pitch", "incubator", "accelerator", "mvp", "product hunt"],
    "Conference": ["conference", "summit", "expo", "conclave", "congress", "symposium", "convention"],
    "Business": ["business", "finance", "investment", "marketing", "sales", "leadership",
                 "management", "strategy", "b2b", "networking", "professional", "corporate"],
    "Cultural": ["cultural", "culture", "art", "music", "dance", "theatre", "drama", "film",
                 "festival", "literature", "poetry", "photography", "exhibition"],
    "Sports": ["sport", "fitness", "yoga", "marathon", "cricket", "football", "basketball",
               "badminton", "tennis", "cycling", "running", "gym", "wellness"],
    "Education": ["workshop", "bootcamp", "training", "learn", "course", "seminar", "lecture",
                  "tutorial", "certification", "skill", "education", "webinar", "masterclass"],
    "Entertainment": ["entertainment", "comedy", "stand-up", "gaming", "esports", "concert",
                      "show", "performance", "party", "nightlife", "fun"],
    "Meetup": ["meetup", "networking", "community", "social", "gathering", "drinks", "informal"],
}


class EventNormalizer:
    """Normalizes and enriches scraped event data."""

    def normalize(self, event: EventModel) -> EventModel:
        """Apply all normalizations to an event."""
        event.title = self._clean_text(event.title, max_len=200)
        event.description = self._clean_html(event.description, max_len=5000)
        event.category = self._classify_category(event.title, event.description, event.tags, event.category)
        event.city = self._normalize_city(event.city, event.venue, event.address)
        event.date = self._normalize_date(event.date)
        event.tags = self._normalize_tags(event.tags, event.category, event.city)
        event.images = self._validate_images(event.images)
        event.venue = self._clean_text(event.venue, max_len=150)
        event.address = self._clean_text(event.address, max_len=300)
        event.organizer_name = self._clean_text(event.organizer_name, max_len=100)
        if not event.source_url:
            event.source_url = event.registration_url
        return event

    def normalize_batch(self, events: List[EventModel]) -> List[EventModel]:
        normalized = []
        for event in events:
            try:
                normalized.append(self.normalize(event))
            except Exception as e:
                logger.warning(f"Failed to normalize event '{event.title}': {e}")
        return normalized

    def _clean_text(self, text: str, max_len: int = 500) -> str:
        if not text:
            return ""
        text = re.sub(r"\s+", " ", str(text)).strip()
        text = re.sub(r"[^\x20-\x7E\u0900-\u097F\u2000-\u206F]", "", text)  # allow ASCII + Devanagari + punctuation
        return text[:max_len]

    def _clean_html(self, text: str, max_len: int = 5000) -> str:
        if not text:
            return ""
        text = re.sub(r"<br\s*/?>|<p>|</p>", "\n", text, flags=re.IGNORECASE)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"&amp;", "&", text)
        text = re.sub(r"&lt;", "<", text)
        text = re.sub(r"&gt;", ">", text)
        text = re.sub(r"&nbsp;", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()[:max_len]

    def _classify_category(self, title: str, desc: str, tags: List[str], existing: str) -> str:
        """Multi-signal category classification."""
        if existing in CATEGORY_KEYWORDS:
            return existing  # trust existing if already valid

        combined = f"{title} {desc[:200]} {' '.join(tags)}".lower()

        scores: dict = {cat: 0 for cat in CATEGORY_KEYWORDS}
        for cat, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw in combined:
                    scores[cat] += (3 if kw in title.lower() else 1)

        best = max(scores, key=scores.get)  # type: ignore
        return best if scores[best] > 0 else "Meetup"

    def _normalize_city(self, city: str, venue: str, address: str) -> str:
        """Normalize city to Delhi or Noida."""
        combined = f"{city} {venue} {address}".lower()
        if any(kw in combined for kw in ["noida", "greater noida", "sector 62", "sector 18", "sector 16"]):
            return "Noida"
        if any(kw in combined for kw in ["delhi", "new delhi", "gurugram", "gurgaon", "faridabad", "dwarka", "rohini", "connaught"]):
            return "Delhi"
        return city if city in ["Delhi", "Noida"] else "Delhi"

    def _normalize_date(self, date: datetime) -> datetime:
        """Ensure date is timezone-aware in IST."""
        if date.tzinfo is None:
            return date.replace(tzinfo=IST)
        return date.astimezone(IST)

    def _normalize_tags(self, tags: List[str], category: str, city: str) -> List[str]:
        """Normalize tags: lowercase, deduplicate, add city/category, limit to 15."""
        normalized = set()
        for tag in tags:
            tag = re.sub(r"[^a-z0-9\s-]", "", tag.lower().strip())
            tag = re.sub(r"\s+", "-", tag)
            if tag and 2 <= len(tag) <= 40:
                normalized.add(tag)
        normalized.add(city.lower())
        normalized.add(category.lower().replace(" ", "-"))
        return list(normalized)[:15]

    def _validate_images(self, images: List[str]) -> List[str]:
        """Keep only valid-looking image URLs."""
        valid = []
        for url in images:
            if not url:
                continue
            if not url.startswith("http"):
                continue
            extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
            has_ext = any(ext in url.lower() for ext in extensions)
            has_unsplash = "unsplash.com" in url
            has_cloudinary = "cloudinary.com" in url or "res.cloudinary" in url
            if has_ext or has_unsplash or has_cloudinary or "image" in url.lower():
                valid.append(url)
        return valid[:5]  # max 5 images
