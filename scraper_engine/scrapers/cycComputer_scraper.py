import re
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class CycComputerScraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        url = f"https://cyccomputer.pe/busqueda?controller=search&s={quote(query.strip())}"
        items = []

        self.smart_delay(0.2, 0.8)
        headers = self.get_random_headers(custom_referer="https://cyccomputer.pe/")

        try:
            response = self.scraper.get(url, headers=headers, timeout=12)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            product_cards = soup.select("article.product-miniature, div.item article, .product-item")

            for card in product_cards[:limit]:
                try:
                    product_id = card.get("data-id-product", "")
                    title_elem = card.select_one(".productName a, h2.productName a, .product-title a, h3 a")
                    if not title_elem:
                        continue
                    
                    title = title_elem.text.strip()
                    link = title_elem.get("href", "")
                    if link and not link.startswith("http"):
                        link = f"https://cyccomputer.pe{link}"

                    img_elem = card.select_one(".cover_image img, .thumbnail img, img")
                    img_src = ""
                    if img_elem:
                        img_src = img_elem.get("src") or img_elem.get("data-src", "")
                        if img_src and not img_src.startswith("http"):
                            img_src = f"https://cyccomputer.pe{img_src}"

                    price_elem = card.select_one(".laber-product-price-and-shipping .price, .price, .product-price")
                    price_text = price_elem.text.strip() if price_elem else ""
                    
                    # Extraer precio en soles
                    match = re.search(r'S/[\s]*([\d.,]+)', price_text)
                    if match:
                        price_val = self.parse_smart_price(match.group(1))
                    else:
                        price_val = self.parse_smart_price(price_text)

                    if title:
                        item_id = f"cyc_{len(items)}_{product_id or abs(hash(title)) % 100000}"
                        items.append({
                            "id": item_id,
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "CYC Computer",
                            "condition": "Nuevo",
                            "link": link
                        })
                except Exception as e:
                    print(f"[CycComputerScraper item error]: {e}")
                    continue

        except Exception as e:
            print(f"[CycComputerScraper Error]: {e}")

        return items