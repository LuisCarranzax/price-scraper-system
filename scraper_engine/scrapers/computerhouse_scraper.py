from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class ComputerHouseScraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        url = f"https://computerhouse.pe/?s={quote(query.strip())}&post_type=product"
        items = []

        self.smart_delay(0.2, 0.8)
        headers = self.get_random_headers(custom_referer="https://computerhouse.pe/")

        try:
            response = self.scraper.get(url, headers=headers, timeout=6)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                cards = soup.select(".product, .product-small, .product-type-simple, article")

                for p in cards[:limit]:
                    title_elem = p.select_one(".product-title, .woocommerce-loop-product__title, h2, h3")
                    price_elem = p.select_one(".woocommerce-Price-amount, .price")
                    img_elem = p.select_one("img")
                    link_elem = p.select_one("a")

                    if title_elem and link_elem:
                        title = title_elem.text.strip()
                        price_val = self.parse_smart_price(price_elem.text if price_elem else "")
                        img_src = img_elem.get("src") or img_elem.get("data-src") if img_elem else ""

                        items.append({
                            "id": f"ch_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Computer House",
                            "condition": "Nuevo",
                            "link": link_elem.get("href", url)
                        })
        except Exception:
            pass

        return items
