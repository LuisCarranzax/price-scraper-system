import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class Pegasus5000Scraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        })

    def search(self, query: str):
        url = f"https://pegasus5000.com.pe/busqueda?controller=search&s={quote(query.strip())}"
        items = []

        try:
            response = requests.get(url, headers=self.headers, timeout=6)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                cards = soup.select(".product, .product-small, .product-type-simple, article")

                for p in cards[:15]:
                    title_elem = p.select_one(".product-title, .woocommerce-loop-product__title, h2, h3")
                    price_elem = p.select_one(".woocommerce-Price-amount, .price")
                    img_elem = p.select_one("img")
                    link_elem = p.select_one("a")

                    if title_elem and link_elem:
                        title = title_elem.text.strip()
                        price_val = self.parse_smart_price(price_elem.text if price_elem else "")
                        img_src = img_elem.get("src") or img_elem.get("data-src") if img_elem else ""

                        items.append({
                            "id": f"pegasus5000_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Pegasus 5000",
                            "condition": "Nuevo",
                            "link": link_elem.get("href", url)
                        })
        except Exception:
            pass

        return items
