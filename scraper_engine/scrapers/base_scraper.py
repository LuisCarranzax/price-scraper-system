import re
import random
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import cloudscraper

USER_AGENTS_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
]

class BaseScraper(ABC):
    def __init__(self, headers: Dict[str, str] = None):
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True
            }
        )
        self.default_headers = headers or {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
        }

    def get_random_headers(self, custom_referer: str = None) -> Dict[str, str]:
        headers = dict(self.default_headers)
        headers["User-Agent"] = random.choice(USER_AGENTS_POOL)
        if custom_referer:
            headers["Referer"] = custom_referer
        return headers

    @staticmethod
    def smart_delay(min_s: float = 0.5, max_s: float = 1.8):
        """Pausa aleatoria para no saturar las tiendas ni disparar WAFs."""
        time.sleep(random.uniform(min_s, max_s))

    @staticmethod
    def parse_smart_price(raw_text: Any) -> float:
        if raw_text is None:
            return 0.0
        text = str(raw_text).strip()
        text = re.sub(r"[^\d.,]", "", text).strip()
        text = text.lstrip(".").rstrip(".").lstrip(",").rstrip(",")
        
        if not text:
            return 0.0

        if "." in text and "," in text:
            if text.rfind(".") > text.rfind(","):
                text = text.replace(",", "")
            else:
                text = text.replace(".", "").replace(",", ".")
        elif "," in text:
            parts = text.split(",")
            if len(parts) == 2 and len(parts[1]) <= 2:
                text = text.replace(",", ".")
            else:
                text = text.replace(",", "")
        elif "." in text:
            parts = text.split(".")
            if len(parts) == 2 and len(parts[1]) == 2:
                pass
            elif len(parts) == 2 and len(parts[1]) == 3:
                text = text.replace(".", "")
            elif len(parts) > 2:
                text = text.replace(".", "")

        try:
            return float(text)
        except (ValueError, TypeError):
            return 0.0

    @abstractmethod
    def search(self, query: str, limit: int = 25) -> List[Dict[str, Any]]:
        pass