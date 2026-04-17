"""
Data Deduplicator — Removes duplicate events based on source URL + title similarity.
Uses multiple strategies:
1. Exact source URL match
2. Title + date fuzzy matching
3. Hash-based deduplication
"""
import hashlib
from typing import List, Set
from difflib import SequenceMatcher
from loguru import logger
from scrapers.base_scraper import EventModel


class Deduplicator:
    """
    Deduplicates events using multiple strategies.
    
    Priority:
    1. Source URL uniqueness (strongest)
    2. Title similarity > 95% on same date
    3. Hash of normalized title + date + city
    """
    
    def __init__(self, similarity_threshold: float = 0.95):
        self.similarity_threshold = similarity_threshold
    
    def _generate_hash(self, event: EventModel) -> str:
        """Generate a unique hash for an event."""
        normalized = f"{event.source_url.lower().strip()}::{event.date.date()}"
        return hashlib.sha256(normalized.encode()).hexdigest()
    
    def _title_hash(self, event: EventModel) -> str:
        """Hash based on normalized title + date + city."""
        title_normalized = " ".join(event.title.lower().split())
        key = f"{title_normalized}::{event.date.date()}::{event.city}"
        return hashlib.sha256(key.encode()).hexdigest()
    
    def _similarity(self, a: str, b: str) -> float:
        """Calculate string similarity ratio."""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    def deduplicate(self, events: List[EventModel]) -> List[EventModel]:
        """
        Remove duplicates from a list of events.
        
        Returns unique events sorted by date.
        """
        if not events:
            return []
        
        seen_urls: Set[str] = set()
        seen_title_hashes: Set[str] = set()
        unique_events: List[EventModel] = []
        
        for event in events:
            # Strategy 1: URL deduplication
            if event.source_url:
                url_key = event.source_url.lower().strip().rstrip("/")
                if url_key in seen_urls:
                    logger.debug(f"Duplicate URL: {event.title}")
                    continue
                seen_urls.add(url_key)
            
            # Strategy 2: Title + date + city hash
            title_hash = self._title_hash(event)
            if title_hash in seen_title_hashes:
                logger.debug(f"Duplicate title hash: {event.title}")
                continue
            seen_title_hashes.add(title_hash)
            
            # Strategy 3: Fuzzy title similarity
            is_duplicate = False
            for existing in unique_events[-20:]:  # Check last 20 events for efficiency
                if (
                    existing.date.date() == event.date.date()
                    and existing.city == event.city
                    and self._similarity(existing.title, event.title) > self.similarity_threshold
                ):
                    logger.debug(f"Fuzzy duplicate: '{event.title}' ≈ '{existing.title}'")
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_events.append(event)
        
        # Sort by date ascending
        unique_events.sort(key=lambda e: e.date)
        
        removed = len(events) - len(unique_events)
        if removed > 0:
            logger.info(f"Deduplication: {removed} duplicates removed from {len(events)} events → {len(unique_events)} unique")
        
        return unique_events
