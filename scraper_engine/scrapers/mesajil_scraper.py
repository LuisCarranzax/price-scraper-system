import requests
from bs4 import BeautifulSoup

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class MesajilScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://mesajil.com/",
        })

    def search(self, query: str):
        url = f"https://mesajil.com/?s={query.strip().replace(' ', '+')}&post_type=product"
        items = []

        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            cards = soup.select(".wd-product, .product-grid-item, li.product")

            for p in cards[:20]:
                title_elem = p.select_one("h2.limited-lines, .mpd-product-title h2, .woocommerce-loop-product__title, .product-title")
                price_elem = p.select_one(".price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount, .woocommerce-Price-amount")
                img_elem = p.select_one("img")
                link_elem = p.select_one("a.product-image-link, a")

                if not title_elem or not link_elem:
                    continue

                title = title_elem.text.strip()
                raw_price = price_elem.text.strip() if price_elem else ""
                price_val = self.parse_smart_price(raw_price)

                img_src = ""
                if img_elem:
                    img_src = img_elem.get("data-src") or img_elem.get("src") or ""

                link = link_elem.get("href", "#")
                item_id = f"mes_{len(items)}_{abs(hash(title)) % 100000}"

                items.append({
                    "id": item_id,
                    "title": title,
                    "price": price_val,
                    "currency": "PEN",
                    "image": img_src,
                    "store": "Mesajil",
                    "condition": "Nuevo",
                    "link": link
                })
        except Exception as e:
            print(f"[MesajilScraper Error]: {e}")

        return items
