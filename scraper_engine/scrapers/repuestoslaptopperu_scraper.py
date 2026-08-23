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


class RepuestosLaptopScraper(BaseScraper):
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
        url = f"https://repuestoslaptopperu.com/?s={quote(query.strip())}&post_type=product"
        items = []

        try:
            time.sleep(random.uniform(1.0, 2.5))
            
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Selector del contenedor de cada producto (resultado de búsqueda)
            product_cards = soup.select(".search-entry-inner, .search-entry, .product")

            if not product_cards:
                product_cards = soup.select("article, .hentry, .post")

            for card in product_cards[:20]:
                try:
                    # --- Título ---
                    title_elem = card.select_one(".search-entry-title a, .entry-title a, h2 a, h3 a")
                    if not title_elem:
                        title_elem = card.select_one("a[rel='bookmark']")
                    if not title_elem:
                        continue
                    
                    title = title_elem.text.strip()
                    link = title_elem.get("href", "")

                    # --- IMAGEN CORREGIDA ---
                    img_src = self.extract_image_from_card(card)

                    # --- Descripción ---
                    desc_elem = card.select_one(".search-entry-summary p, .entry-summary p")
                    description = desc_elem.text.strip() if desc_elem else ""

                    # --- Precio ---
                    price_val = self.extract_price_from_text(title + " " + description)
                    if price_val == 0 and link:
                        price_val = self.get_product_price_from_page(link)

                    # --- Construir item ---
                    if title:
                        items.append({
                            "id": f"repuestoslaptop_{len(items)}_{abs(hash(title)) % 100000}",
                            "title": title,
                            "price": price_val,
                            "currency": "PEN",
                            "image": img_src,
                            "store": "Repuestos Laptop Perú",
                            "condition": "Nuevo",
                            "link": link,
                            "additional_info": {
                                "description": description[:200]
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

    def extract_image_from_card(self, card):
        """Extrae la imagen del producto desde el contenedor .thumbnail"""
        
        # 1. Buscar la imagen dentro del enlace .thumbnail-link (estructura específica)
        img = card.select_one(".thumbnail-link img, .thumbnail img")
        
        if img:
            src = img.get("src") or img.get("data-src") or ""
            
            if src:
                # Limpiar la URL de la imagen
                return self.clean_image_url(src)
        
        # 2. Fallback: buscar cualquier imagen con clase wp-post-image
        img = card.select_one("img.wp-post-image, img.attachment-thumbnail")
        
        if img:
            src = img.get("src") or img.get("data-src") or ""
            if src:
                return self.clean_image_url(src)
        
        # 3. Fallback final: cualquier imagen dentro del card
        img = card.select_one("img")
        
        if img:
            src = img.get("src") or img.get("data-src") or ""
            if src:
                return self.clean_image_url(src)
        
        return ""

    def clean_image_url(self, url):
        """Limpia la URL de la imagen para obtener la versión original"""
        if not url:
            return ""
        
        # Caso 1: URL de i0.wp.com (servicio de imágenes de WordPress)
        if "i0.wp.com" in url:
        # Extraer la URL original
        # https://i0.wp.com/repuestoslaptopperu.com/wp-content/uploads/2025/01/teclado-dell-3501-2-webp.webp?resize=150%2C150&ssl=1
        # -> https://repuestoslaptopperu.com/wp-content/uploads/2025/01/teclado-dell-3501-2-webp.webp
            match = re.search(r'i0\.wp\.com/(https?://[^?]+)', url)
            if match:
                return match.group(1)
            
            # Fallback: quitar todo después del ?
            return url.split('?')[0]
    
        # Caso 2: URL relativa
        if url.startswith('/'):
            return f"https://repuestoslaptopperu.com{url}"
        
        # Caso 3: URL con parámetros de resize
        if '?resize=' in url or '?w=' in url or '?ssl=' in url:
            return url.split('?')[0]
        
        # Caso 4: URL con -150x150 en el nombre
        if re.search(r'-\d+x\d+\.', url):
            url = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', url)
        
        return url

    def extract_price_from_text(self, text):
        """Extrae precio de un texto (título o descripción)"""
        if not text:
            return 0.0
        
        # Buscar patrones de precio: S/ 150.00, S/150.00, S/.150.00
        patterns = [
            r'S/[\s.]*([\d.,]+)',
            r'S\./[\s]*([\d.,]+)',
            r'precio[\s:]*S/[\s]*([\d.,]+)',
            r'(\d+\.\d{2})\s*soles',
            r'(\d+)\s*soles',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                price_str = match.group(1)
                price_str = price_str.replace(',', '.')
                price_str = re.sub(r'\.(?=\d{3})', '', price_str)
                try:
                    return float(price_str)
                except ValueError:
                    continue
        
        # Si no encuentra precio en soles, buscar números sueltos
        numbers = re.findall(r'(\d+\.\d{2})', text)
        if numbers:
            try:
                return float(numbers[0])
            except:
                pass
        
        return 0.0

    def get_product_price_from_page(self, product_url):
        """Obtiene el precio desde la página del producto"""
        try:
            time.sleep(random.uniform(0.5, 1.5))
            response = requests.get(product_url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Buscar precio en la página del producto
                price_selectors = [
                    ".price .woocommerce-Price-amount",
                    ".product-price .price",
                    ".summary .price",
                    ".single-product-price",
                    ".product .price",
                    "span.amount",
                    ".woocommerce-Price-amount",
                    "[itemprop='price']",
                    ".price",
                ]
                
                for selector in price_selectors:
                    price_elem = soup.select_one(selector)
                    if price_elem:
                        price_text = price_elem.text.strip()
                        # Extraer el precio en soles
                        match = re.search(r'S/[\s]*([\d.,]+)', price_text)
                        if match:
                            price_str = match.group(1)
                            price_str = price_str.replace(',', '.')
                            price_str = re.sub(r'\.(?=\d{3})', '', price_str)
                            try:
                                return float(price_str)
                            except ValueError:
                                continue
                        
                        # Si no tiene S/, intentar extraer cualquier número
                        numbers = re.findall(r'([\d.,]+)', price_text)
                        for num in numbers:
                            try:
                                num_clean = num.replace(',', '.')
                                num_clean = re.sub(r'\.(?=\d{3})', '', num_clean)
                                value = float(num_clean)
                                if value > 10:  # Asumimos que es un precio válido
                                    return value
                            except:
                                continue
        except Exception as e:
            print(f"Error obteniendo precio de {product_url}: {e}")
        
        return 0.0