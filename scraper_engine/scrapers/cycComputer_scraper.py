import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re

try:
    from .base_scraper import BaseScraper
except ImportError:
    from base_scraper import BaseScraper


class CycComputerScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        })

    def search(self, query: str):
        # URL de búsqueda de CYC Computer (PrestaShop)
        url = f"https://cyccomputer.pe/busqueda?controller=search&s={quote(query.strip())}"
        items = []

        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Selector del contenedor de cada producto
            product_cards = soup.select("article.product-miniature, div.item article")

            for card in product_cards[:15]:
                try:
                    # --- ID del producto ---
                    product_id = card.get("data-id-product", "")

                    # --- Título ---
                    title_elem = card.select_one(".productName a, h2.productName a")
                    if not title_elem:
                        continue
                    title = title_elem.text.strip()

                    # --- Enlace ---
                    link = title_elem.get("href", "")
                    if link and not link.startswith("http"):
                        link = f"https://cyccomputer.pe{link}"

                    # --- Imagen ---
                    img_elem = card.select_one(".cover_image img, .thumbnail img")
                    img_src = ""
                    if img_elem:
                        img_src = img_elem.get("src") or img_elem.get("data-src", "")
                        if img_src and not img_src.startswith("http"):
                            img_src = f"https://cyccomputer.pe{img_src}"

                    # --- Precio ---
                    # El precio está en formato "$ 145,00 (S/ 500,25)"
                    price_elem = card.select_one(".laber-product-price-and-shipping .price")
                    price_text = price_elem.text.strip() if price_elem else ""
                    
                    # Extraer el precio en soles (S/ 500,25)
                    price_val = self.extract_soles_price(price_text)

                    # --- Stock ---
                    stock_elem = card.select_one(".quantity")
                    stock_text = stock_elem.text.strip() if stock_elem else ""
                    # Extraer el número de stock del texto "Stock: 0 Artículo"
                    stock_match = re.search(r'Stock:\s*([\d]+)', stock_text)
                    stock = stock_match.group(1) if stock_match else ""

                    # --- Marca ---
                    brand_elem = card.select_one(".manufacturer_name")
                    brand_text = brand_elem.text.strip() if brand_elem else ""
                    brand_match = re.search(r'Marca:\s*(.+)', brand_text)
                    brand = brand_match.group(1).strip() if brand_match else ""

                    # --- Descripción corta ---
                    desc_elem = card.select_one(".description_short")
                    description = desc_elem.text.strip() if desc_elem else ""

                    if title and price_val > 0:
                        items.append({
                            "id": f"cyc_{len(items)}_{product_id or abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "CYC Computer",
                            "condition": "Nuevo",
                            "link": link,
                            "additional_info": {
                                "product_id": product_id,
                                "stock": stock,
                                "brand": brand,
                                "description": description[:200]  # Limitar descripción
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
        """Extrae el precio en soles del formato '$ 145,00 (S/ 500,25)'"""
        if not price_text:
            return 0.0
        
        # Buscar el patrón S/ 500,25 o S/500.25
        match = re.search(r'S/[\s]*([\d.,]+)', price_text)
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
        match_usd = re.search(r'\$[\s]*([\d.,]+)', price_text)
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