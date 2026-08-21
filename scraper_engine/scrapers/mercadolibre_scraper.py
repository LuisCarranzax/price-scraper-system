import re
import requests
from bs4 import BeautifulSoup

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class MercadoLibreScraper(BaseScraper):
    def search(self, query: str):
        formatted_query = query.strip().replace(" ", "-")
        url = f"https://listado.mercadolibre.com.pe/{formatted_query}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=12)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            items = []

            # Soporta tanto el diseño moderno (poly-card) como el clásico (ui-search-layout__item)
            card_elements = (
                soup.select("li.ui-search-layout__item")
                or soup.select(".poly-card")
                or soup.select(".ui-search-result__wrapper")
            )

            for container in card_elements[:20]:
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
                
                # Extracción de imagen con data-src, src o data-lazy
                img_src = ""
                if img_elem:
                    img_src = (
                        img_elem.get("data-src")
                        or img_elem.get("data-lazy")
                        or img_elem.get("src")
                        or ""
                    )

                # Parseo robusto del precio
                price_val = 0.0
                if price_elem:
                    raw_price = price_elem.text.strip()
                    # Elimina puntos de miles y comas
                    clean_price = re.sub(r"[^\d.]", "", raw_price.replace(".", ""))
                    try:
                        price_val = float(clean_price)
                    except ValueError:
                        price_val = 0.0

                # Detección de condición
                condition_elem = container.select_one(
                    ".ui-search-item__group__element--attributes, .poly-attributes_list"
                )
                condition_text = condition_elem.text.lower() if condition_elem else ""
                condition = "Seminuevo / Usado" if "usado" in condition_text or "reacondicionado" in condition_text else "Nuevo"

                # Extracción de ID único
                id_match = re.search(r"MPE[-_]?\d+", link)
                item_id = f"ml_{id_match.group(0)}" if id_match else f"ml_{len(items)}_{hash(title) % 100000}"

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
