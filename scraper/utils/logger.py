"""Loguru logger configuration."""
import sys
from loguru import logger


def setup_logger():
    """Configure loguru for the scraper."""
    logger.remove()
    
    # Console output
    logger.add(
        sys.stdout,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> — {message}",
        level="INFO",
        colorize=True,
    )
    
    # File logging with rotation
    logger.add(
        "logs/scraper_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name} — {message}",
        level="DEBUG",
        rotation="1 day",
        retention="7 days",
        compression="gz",
    )
    
    logger.info("Logger initialized for Delhi-Noida Events Scraper")
