import re
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseScraper(ABC):
    def __init__(self, headers: Dict[str, str] = None):
        self.headers = headers or {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
        }

    @staticmethod
    def parse_smart_price(raw_text: Any) -> float:
        """
        Limpia y convierte cadenas de precios complejas a float.
        Maneja formatos: 'S/ 4,890.00', 'S/ 1.099', 'S/932.96', 'S/. 361.00', '4890'
        """
        if raw_text is None:
            return 0.0
        text = str(raw_text).strip()
        # Elimina símbolos y palabras excepto números, puntos y comas
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
                pass # Decimales estándar: 932.96
            elif len(parts) == 2 and len(parts[1]) == 3:
                text = text.replace(".", "") # Separador de miles: 1.099 -> 1099
            elif len(parts) > 2:
                text = text.replace(".", "")

        try:
            return float(text)
        except (ValueError, TypeError):
            return 0.0

    @abstractmethod
    def search(self, query: str) -> List[Dict[str, Any]]:
        pass