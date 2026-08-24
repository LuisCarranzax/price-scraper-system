import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class MercadoLibreScraper(BaseScraper):
    def search(self, query: str, limit: int = 25):
        formatted_query = query.strip().lower().replace(" ", "-")
        url = f"https://listado.mercadolibre.com.pe/{formatted_query}"
        
        self.smart_delay(0.3, 1.2)
        headers = self.get_random_headers(custom_referer="https://www.mercadolibre.com.pe/")
        
        items = []
        try:
            # Intento con cloudscraper y rotación de headers
            response = self.scraper.get(url, headers=headers, timeout=12)
            
            # Si responde con pantalla de validación o no es 200, intentar con búsqueda directa
            if response.status_code != 200 or len(response.text) < 15000:
                alt_url = f"https://listado.mercadolibre.com.pe/{quote(query.strip())}"
                alt_headers = {
                    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }
                response = requests.get(alt_url, headers=alt_headers, timeout=10)

            if response.status_code != 200:
                print(f"[MercadoLibreScraper Warning]: Estado HTTP {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, "html.parser")

            card_elements = (
                soup.select("li.ui-search-layout__item")
                or soup.select(".poly-card")
                or soup.select(".ui-search-result__wrapper")
            )

            for container in card_elements[:limit]:
                title_elem = container.select_one(
                    ".ui-search-item__title, .poly-component__title, h2, h3, a.poly-component__title"
                )
                price_elem = container.select_one(
                    ".andes-money-amount__fraction, .poly-price__current .andes-money-amount__fraction"
                )
                img_elem = container.select_one(
                    "img.ui-search-result-image__element, img.poly-component__picture, img"
                )
                link_elem = container.select_one(
                    "a.ui-search-link, a.poly-component__title, a.ui-search-item__group__element, a"
                )

                if not title_elem or not link_elem:
                    continue

                title = title_elem.text.strip()
                link = link_elem.get("href", "#")
                
                img_src = ""
                if img_elem:
                    img_src = (
                        img_elem.get("data-src")
                        or img_elem.get("data-lazy")
                        or img_elem.get("src")
                        or ""
                    )

                price_val = self.parse_smart_price(price_elem.text if price_elem else "0")

                condition_elem = container.select_one(
                    ".ui-search-item__group__element--attributes, .poly-attributes_list"
                )
                condition_text = condition_elem.text.lower() if condition_elem else ""
                condition = "Seminuevo / Usado" if "usado" in condition_text or "reacondicionado" in condition_text else "Nuevo"

                id_match = re.search(r"MPE[-_]?\d+", link)
                item_id = f"ml_{id_match.group(0)}" if id_match else f"ml_{len(items)}_{abs(hash(title)) % 100000}"

                items.append({
                    "id": item_id,
                    "title": title,
                    "price": price_val,
                    "currency": "PEN",
                    "image": img_src,
                    "store": "Mercado Libre",
                    "condition": condition,
                    "link": link
                })

            return items
        except Exception as e:
            print(f"[MercadoLibreScraper Error]: {e}")
            return []
