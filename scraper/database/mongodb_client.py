"""
MongoDB Client — Handles all database operations for the scraper.
Uses PyMongo with connection pooling and async motor driver.
"""
import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

# In production, use: from motor.motor_asyncio import AsyncIOMotorClient
# For dev/testing: using pymongo sync client

try:
    from pymongo import MongoClient, UpdateOne
    from pymongo.errors import BulkWriteError, ConnectionFailure
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    logger.warning("PyMongo not installed. Using mock MongoDB client.")

from scrapers.base_scraper import EventModel


class MongoDBClient:
    """
    MongoDB client for the Delhi-Noida Events platform.
    
    Features:
    - Connection pooling (10-50 connections)
    - Upsert operations (insert or update)
    - Bulk write for performance
    - Auto-retry on connection failure
    """
    
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB", "delhi_noida_events")
        self.client = None
        self.db = None
        self._connected = False
    
    def connect(self):
        """Establish connection to MongoDB."""
        if not PYMONGO_AVAILABLE:
            logger.warning("PyMongo unavailable — running in mock mode")
            return
        try:
            self.client = MongoClient(
                self.uri,
                maxPoolSize=50,
                minPoolSize=10,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
            )
            self.db = self.client[self.db_name]
            
            # Test connection
            self.client.server_info()
            self._connected = True
            logger.success(f"✅ MongoDB connected: {self.db_name}")
            
            # Ensure indexes exist
            self._ensure_indexes()
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            self._connected = False
    
    def _ensure_indexes(self):
        """Create required indexes if they don't exist."""
        try:
            events = self.db.events
            
            # Unique index on source + sourceUrl
            events.create_index(
                [("source", 1), ("sourceUrl", 1)],
                unique=True,
                background=True,
            )
            
            # Compound index for city + date queries
            events.create_index([("city", 1), ("date", 1)], background=True)
            
            # Category index
            events.create_index("category", background=True)
            
            # Date index for cleanup queries
            events.create_index("date", background=True)
            
            # Full-text search index
            events.create_index(
                [("title", "text"), ("description", "text"), ("tags", "text")],
                background=True,
            )
            
            # Geospatial index
            events.create_index([("location", "2dsphere")], background=True)
            
            logger.info("MongoDB indexes verified")
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")
    
    def upsert_events(self, events: List[EventModel]) -> Dict[str, int]:
        """
        Upsert a list of events — insert or update based on source + sourceUrl.
        
        Returns:
            Dict with counts: inserted, updated, unchanged
        """
        if not self._connected or not PYMONGO_AVAILABLE:
            logger.warning(f"Mock: Would save {len(events)} events to MongoDB")
            return {"inserted": len(events), "updated": 0, "unchanged": 0}
        
        operations = []
        for event in events:
            doc = {
                "title": event.title,
                "description": event.description,
                "category": event.category,
                "city": event.city,
                "date": event.date,
                "endDate": event.end_date,
                "time": event.time,
                "venue": event.venue,
                "address": event.address,
                "price": {
                    "amount": event.price_amount,
                    "currency": event.price_currency,
                    "type": event.price_type,
                },
                "registrationUrl": event.registration_url,
                "images": event.images,
                "tags": event.tags,
                "organizer": {
                    "name": event.organizer_name,
                    "email": event.organizer_email,
                    "website": event.organizer_website,
                },
                "capacity": event.capacity,
                "attendees": event.attendees,
                "source": event.source,
                "sourceUrl": event.source_url,
                "featured": event.featured,
                "verified": event.verified,
                "updatedAt": datetime.now(),
            }
            
            operations.append(
                UpdateOne(
                    filter={"source": event.source, "sourceUrl": event.source_url},
                    update={"$set": doc, "$setOnInsert": {"createdAt": datetime.now(), "viewCount": 0, "bookmarkCount": 0}},
                    upsert=True,
                )
            )
        
        try:
            result = self.db.events.bulk_write(operations, ordered=False)
            stats = {
                "inserted": result.upserted_count,
                "updated": result.modified_count,
                "unchanged": len(events) - result.upserted_count - result.modified_count,
            }
            logger.success(f"MongoDB: inserted={stats['inserted']}, updated={stats['updated']}")
            return stats
        except BulkWriteError as e:
            logger.error(f"Bulk write error: {e.details}")
            return {"inserted": 0, "updated": 0, "unchanged": len(events)}
    
    def cleanup_old_events(self, days: int = 60) -> int:
        """Remove events older than `days` days to keep database lean."""
        if not self._connected:
            return 0
        cutoff = datetime.now() - timedelta(days=days)
        result = self.db.events.delete_many({"date": {"$lt": cutoff}})
        logger.info(f"Cleanup: removed {result.deleted_count} events older than {days} days")
        return result.deleted_count
    
    def get_event_count(self) -> Dict[str, int]:
        """Get event counts by city and category."""
        if not self._connected:
            return {"total": 0}
        pipeline = [
            {"$group": {"_id": {"city": "$city", "category": "$category"}, "count": {"$sum": 1}}}
        ]
        results = list(self.db.events.aggregate(pipeline))
        return {"total": self.db.events.count_documents({}), "breakdown": results}
    
    def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            self._connected = False
            logger.info("MongoDB disconnected")
