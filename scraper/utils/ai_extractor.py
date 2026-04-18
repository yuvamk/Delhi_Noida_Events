"""
AI Event Extractor — Uses Google Gemini to parse raw webpage text into structured EventModel data.
"""
import os
import json
import asyncio
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import google.generativeai as genai
from loguru import logger
from pydantic import ValidationError

# Import EventModel — using TYPE_CHECKING to avoid circular imports at runtime
if TYPE_CHECKING:
    from scrapers.base_scraper import EventModel as EventModelType

# Runtime import (needed for actual object construction)
from scrapers.base_scraper import EventModel


class AIExtractor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment")
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
            logger.info("✅ Gemini AI Extractor initialized")

    def _build_event_schema(self) -> str:
        return """{
  "title": "Event name",
  "description": "Brief description",
  "category": "one of: Nightlife | Comedy | Gaming | Festivals | Tech | Music | Food | Workshop | Startup | Sports",
  "city": "Delhi or Noida or Gurgaon",
  "date": "YYYY-MM-DD",
  "time": "HH:MM AM/PM",
  "venue": "Venue name",
  "address": "Full address",
  "price_amount": 0,
  "price_currency": "INR",
  "price_type": "Free or Paid or RSVP",
  "registration_url": "https://...",
  "organizer_name": "Organizer name",
  "tags": ["tag1", "tag2"],
  "images": ["url1", "url2"]
}"""

    async def extract_event_from_text(
        self, text: str, source_url: str, image_candidates: Optional[List[str]] = None
    ) -> Optional[EventModel]:
        """Extract a single event from a webpage's text content."""
        if not self.api_key:
            return None

        candidates_str = "\n".join([f"- {url}" for url in (image_candidates or [])])
        
        prompt = f"""You are an expert event data extractor for Delhi NCR (India).

Given the following webpage text, determine if it describes a specific event.
If yes, extract the event details as JSON matching this schema:
{self._build_event_schema()}

Important rules:
- Only extract events in Delhi, Noida, or Gurgaon (NCR region)
- If no specific date found, use a reasonable upcoming date in 2026
- If not an event page, return {{"error": "not_an_event"}}
- Respond ONLY with valid JSON, no markdown
- For "images", select the most relevant image URLs from the candidates list below or found in text. Prefer event posters, banners, or artist photos.

Image Candidates found on page:
{candidates_str if image_candidates else "None found"}

Webpage text (first 4000 chars):
{text[:4000]}

Source URL: {source_url}"""

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, lambda: self.model.generate_content(prompt)
            )
            return self._parse_single_event(response.text, source_url)
        except Exception as e:
            logger.error(f"AI extraction failed for {source_url}: {e}")
            return None

    async def extract_multiple_events(
        self, text: str, source_url: str, image_candidates: Optional[List[str]] = None
    ) -> List[EventModel]:
        """Extract multiple events from a listing page (like Insider.in)."""
        if not self.api_key:
            return []

        candidates_str = "\n".join([f"- {url}" for url in (image_candidates or [])])

        prompt = f"""You are an expert event data extractor for Delhi NCR (India).

Given this event listing webpage text, extract ALL events found.
Return a JSON array of events matching this schema for each:
{self._build_event_schema()}

Important rules:
- Only include events in Delhi, Noida, or Gurgaon (NCR region)
- Include only future events (today or later, assuming year 2026 if unclear)
- If no events found, return []
- Respond ONLY with a valid JSON array, no markdown
- For "images", select the most relevant image URLs from the candidates list below. Try to match images to their respective events.

Image Candidates found on page:
{candidates_str if image_candidates else "None found"}

Listing page text (first 6000 chars):
{text[:6000]}

Source URL: {source_url}"""

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, lambda: self.model.generate_content(prompt)
            )
            return self._parse_event_list(response.text, source_url)
        except Exception as e:
            logger.error(f"AI multi-extraction failed for {source_url}: {e}")
            return []

    def _parse_single_event(self, raw_text: str, source_url: str) -> Optional[EventModel]:
        """Parse a single JSON event from AI response.
        
        Gemini 2.5 Flash sometimes returns a list even when a single event
        is asked for. We handle both shapes gracefully.
        """
        try:
            content = self._clean_json(raw_text)
            data = json.loads(content)

            # AI returned a list — take the first valid dict inside it
            if isinstance(data, list):
                if not data:
                    return None
                data = data[0]

            if not isinstance(data, dict):
                logger.debug(f"Unexpected AI response type: {type(data)}")
                return None

            if "error" in data:
                return None

            return self._build_event_model(data, source_url)
        except Exception as e:
            logger.debug(f"Single event parse error: {e}")
            return None

    def _parse_event_list(self, raw_text: str, source_url: str) -> List[EventModel]:
        """Parse a list of events from AI response.
        
        Handles both JSON arrays and single-object responses.
        """
        results = []
        try:
            content = self._clean_json(raw_text)
            data = json.loads(content)

            # Normalise to list
            if isinstance(data, dict):
                data_list = [data]
            elif isinstance(data, list):
                data_list = data
            else:
                return []

            for item in data_list:
                if not isinstance(item, dict):
                    continue
                if "error" in item:
                    continue
                event = self._build_event_model(item, source_url)
                if event:
                    results.append(event)

        except Exception as e:
            logger.debug(f"Event list parse error: {e}")

        return results

    def _clean_json(self, text: str) -> str:
        """Surgically extract the FIRST valid JSON object or array from text.
        
        Uses brace/bracket counting to ignore 'Extra data' that Gemini 
        might append after the main JSON block.
        """
        text = text.replace("```json", "").replace("```", "").strip()
        
        # Find first potential start
        start_idx = -1
        start_char = ""
        for i, char in enumerate(text):
            if char in ["{", "["]:
                start_idx = i
                start_char = char
                break
        
        if start_idx == -1:
            return text

        end_char = "}" if start_char == "{" else "]"
        stack = 0
        
        for i in range(start_idx, len(text)):
            if text[i] == start_char:
                stack += 1
            elif text[i] == end_char:
                stack -= 1
                if stack == 0:
                    # Found the matching closing brace/bracket
                    return text[start_idx : i + 1]
                    
        return text[start_idx:]

    def _build_event_model(self, data: object, source_url: str) -> Optional[EventModel]:
        """Build EventModel from a parsed dict. Rejects non-dict inputs."""
        if not isinstance(data, dict):
            logger.debug(f"_build_event_model received non-dict type: {type(data)} — skipping")
            return None
        try:

            # Parse date
            date_str = data.get("date", "")
            try:
                event_date = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime(2026, 9, 1)
            except ValueError:
                event_date = datetime(2026, 9, 1)

            # Validate city
            city = str(data.get("city", "Delhi")).strip()
            if city not in ["Delhi", "Noida", "Gurgaon", "Gurugram"]:
                city = "Delhi"

            title = str(data.get("title", "")).strip()
            if not title or len(title) < 5:
                return None

            # Build tags list
            tags_raw = data.get("tags", [])
            tags = [str(t) for t in tags_raw] if isinstance(tags_raw, list) else []

            # Price
            price_raw = data.get("price_amount", 0)
            try:
                price_amount = float(str(price_raw).replace(",", ""))
            except (ValueError, TypeError):
                price_amount = 0.0

            return EventModel(
                title=title[:200],
                description=str(data.get("description", f"Event: {title}"))[:1000],
                category=str(data.get("category", "Festivals")),
                city=city,
                date=event_date,
                time=str(data.get("time", "TBA")),
                venue=str(data.get("venue", "TBA")),
                address=str(data.get("address", city)),
                price_amount=price_amount,
                price_currency=str(data.get("price_currency", "INR")),
                price_type=str(data.get("price_type", "Paid")),
                registration_url=str(data.get("registration_url") or source_url),
                images=data.get("images", []) if isinstance(data.get("images"), list) else [],
                tags=tags[:10],
                organizer_name=str(data.get("organizer_name", "Unknown")),
                source="ai_discovery",
                source_url=source_url,
                source_id=source_url.split("/")[-1][:30] or "ai-found",
                verified=False,
            )
        except (ValidationError, Exception) as e:
            logger.debug(f"EventModel build error: {e}")
            return None
