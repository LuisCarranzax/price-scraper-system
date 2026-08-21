import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class FalabellaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://www.falabella.com.pe/",
        })

    def search(self, query: str):
        encoded_query = quote(query.strip())
        url = f"https://www.falabella.com.pe/falabella-pe/search?Ntt={encoded_query}"
        
        items = []
        try:
            response = requests.get(url, headers=self.headers, timeout=8)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                card_elements = soup.select(".search-results-4-grid .pod, .pod-4_GRID, div[data-pod]")
                for pod in card_elements[:15]:
                    title_elem = pod.select_one(".pod-subTitle, .copy1, b")
                    price_elem = pod.select_one(".copy10, .price-0, li[data-variant-price]")
                    img_elem = pod.select_one("img")
                    link_elem = pod.select_one("a")

                    if title_elem and link_elem:
                        raw_price = price_elem.text.strip() if price_elem else "0"
                        clean_price = re.sub(r"[^\d.]", "", raw_price.replace(".", "").replace(",", "."))
                        try:
                            price_val = float(clean_price)
                        except ValueError:
                            price_val = 0.0

                        items.append({
                            "id": f"fal_{len(items)}_{hash(title_elem.text) % 100000}",
                            "title": title_elem.text.strip(),
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_elem.get("src", "") if img_elem else "",
                            "store": "Falabella",
                            "condition": "Nuevo",
                            "link": link_elem.get("href", url)
                        })
        except Exception as e:
            print(f"[FalabellaScraper Live Error]: {e}")

        return items
