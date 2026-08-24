import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class MemoryKingsScraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        formatted_q = query.strip().lower().replace(" ", "-")
        url = f"https://www.memorykings.pe/resultados/{quote(formatted_q)}"
        items = []

        self.smart_delay(0.3, 1.0)
        headers = self.get_random_headers(custom_referer="https://www.memorykings.pe/")

        try:
            session = requests.Session()
            session.headers.update(headers)
            
            # Intento de petición
            response = session.get(url, timeout=12, verify=False)
            if response.status_code != 200:
                alt_url = f"https://www.memorykings.pe/resultados/{quote(query.strip())}"
                response = session.get(alt_url, timeout=12, verify=False)

            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            product_items = soup.select("ul.products li, .product-item, .item")

            for item in product_items[:limit]:
                try:
                    link_elem = item.select_one("a")
                    if not link_elem:
                        continue
                    
                    link = link_elem.get("href", "")
                    if link and not link.startswith("http"):
                        link = f"https://www.memorykings.pe{link}"

                    title_elem = item.select_one(".title h4, h4, .title, .product-title")
                    if not title_elem:
                        continue
                    title = title_elem.text.strip()

                    img_elem = item.select_one(".image img, img")
                    img_src = ""
                    if img_elem:
                        img_src = img_elem.get("src") or img_elem.get("data-src") or ""
                        if img_src and not img_src.startswith("http"):
                            img_src = f"https://www.memorykings.pe{img_src}"

                    price_elem = item.select_one(".price, .price-before, .precio")
                    price_text = price_elem.text.strip() if price_elem else ""

                    match = re.search(r'S/\s*([\d.,]+)', price_text)
                    if match:
                        price_val = self.parse_smart_price(match.group(1))
                    else:
                        price_val = self.parse_smart_price(price_text)

                    if title:
                        item_id = f"mk_{len(items)}_{abs(hash(title)) % 100000}"
                        items.append({
                            "id": item_id,
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Memory Kings",
                            "condition": "Nuevo",
                            "link": link
                        })
                except Exception as e:
                    print(f"[MemoryKingsScraper item error]: {e}")
                    continue

        except Exception as e:
            print(f"[MemoryKingsScraper Error]: {e}")

        return items