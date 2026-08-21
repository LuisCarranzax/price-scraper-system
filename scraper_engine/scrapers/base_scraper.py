from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseScraper(ABC):
    def __init__(self, headers: Dict[str, str] = None):
        self.headers = headers or {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
        }

    @abstractmethod
    def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Ejecuta la búsqueda y retorna una lista estandarizada de productos:
        [
            {
                "id": str,
                "title": str,
                "price": float,
                "currency": str,
                "image": str,
                "store": str,
                "condition": str,
                "link": str
            }
        ]
        """
        pass