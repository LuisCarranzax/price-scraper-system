from bs4 import BeautifulSoup
from urllib.parse import quote
import requests

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class Pegasus5000Scraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        url = f"https://pegasus5000.com.pe/busqueda?controller=search&s={quote(query.strip())}"
        items = []

        self.smart_delay(0.2, 0.8)
        headers = self.get_random_headers(custom_referer="https://pegasus5000.com.pe/")

        try:
            response = requests.get(url, headers=headers, timeout=12, verify=False)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            cards = soup.select("article.product-miniature, .product, .product-small, .product-type-simple")

            for p in cards[:limit]:
                try:
                    title_elem = p.select_one(".product-title a, .product-title, h2.product-title a, h3 a, h2 a")
                    price_elem = p.select_one(".price, .product-price, .woocommerce-Price-amount")
                    img_elem = p.select_one("img")
                    link_elem = p.select_one("a.thumbnail, a")

                    if not title_elem:
                        continue

                    title = title_elem.text.strip()
                    price_val = self.parse_smart_price(price_elem.text if price_elem else "")
                    img_src = img_elem.get("src") or img_elem.get("data-src") if img_elem else ""
                    link = link_elem.get("href", url) if link_elem else url

                    if title:
                        items.append({
                            "id": f"pegasus5000_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Pegasus 5000",
                            "condition": "Nuevo",
                            "link": link
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f"[Pegasus5000Scraper Error]: {e}")

        return items
