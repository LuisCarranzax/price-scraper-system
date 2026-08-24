import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class RepuestosLaptopScraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        url = f"https://repuestoslaptopperu.com/?s={quote(query.strip())}&post_type=product"
        items = []

        self.smart_delay(0.2, 0.8)
        headers = self.get_random_headers(custom_referer="https://repuestoslaptopperu.com/")

        try:
            response = requests.get(url, headers=headers, timeout=12, verify=False)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            product_cards = soup.select(".search-entry-inner, .search-entry, .product, article")

            for card in product_cards[:limit]:
                try:
                    title_elem = card.select_one(".search-entry-title a, .entry-title a, h2 a, h3 a, a[rel='bookmark']")
                    if not title_elem:
                        continue
                    
                    title = title_elem.text.strip()
                    link = title_elem.get("href", "")

                    # Imagen
                    img_elem = card.select_one("img.wp-post-image, .thumbnail img, img")
                    img_src = ""
                    if img_elem:
                        img_src = img_elem.get("src") or img_elem.get("data-src") or ""
                        if img_src and "i0.wp.com" in img_src:
                            match_url = re.search(r'i0\.wp\.com/(https?://[^?]+)', img_src)
                            if match_url:
                                img_src = match_url.group(1)

                    # Descripción y Precio
                    desc_elem = card.select_one(".search-entry-summary p, .entry-summary p, .price")
                    full_text = (title + " " + (desc_elem.text if desc_elem else "")).strip()

                    match_price = re.search(r'S/[\s.]*([\d.,]+)', full_text, re.IGNORECASE)
                    if match_price:
                        price_val = self.parse_smart_price(match_price.group(1))
                    else:
                        price_val = 0.0

                    if title:
                        items.append({
                            "id": f"repuestoslaptop_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Repuestos Laptop Perú",
                            "condition": "Nuevo",
                            "link": link
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f"[RepuestosLaptopScraper Error]: {e}")

        return items