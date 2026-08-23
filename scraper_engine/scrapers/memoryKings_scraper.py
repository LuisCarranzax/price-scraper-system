import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re
import time
import random

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class MemoryKingsScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        })

    def search(self, query: str):
        # URL de búsqueda de Memory Kings
        url = f"https://www.memorykings.pe/resultados/{quote(query.strip())}"
        items = []

        try:
            time.sleep(random.uniform(1.0, 2.5))
            
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Selector: cada producto está en un <li> dentro de <ul class="products">
            product_items = soup.select("ul.products li")

            for item in product_items[:25]:
                try:
                    # --- Enlace y contenedor principal ---
                    link_elem = item.select_one("a")
                    if not link_elem:
                        continue
                    
                    link = link_elem.get("href", "")
                    if link and not link.startswith("http"):
                        link = f"https://www.memorykings.pe{link}"

                    # --- Título ---
                    title_elem = item.select_one(".title h4")
                    if not title_elem:
                        continue
                    title = title_elem.text.strip()

                    # --- Imagen ---
                    img_elem = item.select_one(".image img")
                    img_src = img_elem.get("src") if img_elem else ""
                    if img_src and not img_src.startswith("http"):
                        img_src = f"https://www.memorykings.pe{img_src}"

                    # --- Precio ---
                    # El precio puede estar en .price o .price-before + .price (oferta)
                    price_elem = item.select_one(".price")
                    price_text = price_elem.text.strip() if price_elem else ""
                    
                    # Extraer precio en soles (S/ xxx.xx)
                    price_val = self.extract_soles_price(price_text)
                    
                    # Si no hay precio en .price, buscar en .price-before (precio original)
                    if price_val == 0:
                        price_before_elem = item.select_one(".price-before")
                        if price_before_elem:
                            price_text = price_before_elem.text.strip()
                            price_val = self.extract_soles_price(price_text)

                    # --- Stock ---
                    stock_elem = item.select_one(".stock b")
                    stock = stock_elem.text.strip() if stock_elem else ""

                    # --- Código interno ---
                    code_elem = item.select_one(".code b")
                    code = code_elem.text.strip() if code_elem else ""

                    # --- Promoción (si tiene) ---
                    promo_elem = item.select_one(".promo")
                    promo = promo_elem.text.strip() if promo_elem else ""

                    if title:
                        items.append({
                            "id": f"memorykings_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Memory Kings",
                            "condition": "Nuevo",
                            "link": link,
                            "additional_info": {
                                "stock": stock,
                                "code": code,
                                "promo": promo
                            }
                        })

                except Exception as e:
                    print(f"Error procesando producto: {e}")
                    continue

        except requests.exceptions.Timeout:
            print(f"Error: Tiempo de espera agotado para {url}")
        except requests.exceptions.RequestException as e:
            print(f"Error de red al acceder a {url}: {e}")
        except Exception as e:
            print(f"Error inesperado al procesar {url}: {e}")

        return items

    def extract_soles_price(self, price_text):
        """Extrae el precio en soles del formato '$ 11.00 ó S/ 37.50'"""
        if not price_text:
            return 0.0
        
        # Buscar el patrón S/ 37.50 o S/37.50
        # Nota: Memory Kings usa formato "S/ 37.50" (con espacio después de S/)
        match = re.search(r'S/\s*([\d.,]+)', price_text)
        if match:
            price_str = match.group(1)
            # Reemplazar coma por punto para convertir a float
            price_str = price_str.replace(',', '.')
            # Eliminar puntos de miles (si existen)
            price_str = re.sub(r'\.(?=\d{3})', '', price_str)
            try:
                return float(price_str)
            except ValueError:
                return 0.0
        
        # Si no encuentra S/, intentar con el precio en dólares como fallback
        match_usd = re.search(r'\$\s*([\d.,]+)', price_text)
        if match_usd:
            price_str = match_usd.group(1)
            price_str = price_str.replace(',', '.')
            price_str = re.sub(r'\.(?=\d{3})', '', price_str)
            try:
                # Si solo hay dólares, asumimos que es el precio principal
                return float(price_str)
            except ValueError:
                return 0.0
        
        return 0.0