import re
from playwright.async_api import BrowserContext

class AliExpressScraper:
    def __init__(self):
        self.store_name = "AliExpress"

    async def search(self, context: BrowserContext, query: str):
        page = await context.new_page()
        products = []

        # Bloqueo de multimedia
        await page.route(
            "**/*",
            lambda route: route.abort()
            if route.request.resource_type in ["media", "font"]
            else route.continue_()
        )

        try:
            url = f"https://es.aliexpress.com/w/wholesale-{query.replace(' ', '-')}.html"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)

            # Esperar elementos de lista de AliExpress
            card_selector = "div.search-item-card-wrapper-gallery, div[class*='search-card-item']"
            await page.wait_for_selector(card_selector, timeout=8000)

            items = await page.eval_on_selector_all(
                "div[class*='search-item-card-wrapper-gallery']",
                """elements => elements.slice(0, 10).map(el => {
                    const titleEl = el.querySelector("h3, h1, div[class*='title']");
                    const priceEl = el.querySelector("div[class*='price']");
                    const imgEl = el.querySelector("img");
                    const linkEl = el.querySelector("a");

                    return {
                        title: titleEl ? titleEl.innerText.trim() : null,
                        priceRaw: priceEl ? priceEl.innerText.trim() : null,
                        image: imgEl ? (imgEl.src || imgEl.getAttribute("data-src")) : null,
                        link: linkEl ? linkEl.href : null
                    };
                })"""
            )

            for item in items:
                if not item.get("title") or not item.get("priceRaw"):
                    continue

                # Extraer primer valor numérico del precio
                match = re.search(r"(\d+[\.,]?\d*)", item["priceRaw"].replace(",", "."))
                price = float(match.group(1)) if match else 0.0

                products.append({
                    "id": f"ali_{abs(hash(item['title'])) % 1000000}",
                    "title": item["title"],
                    "price": price,
                    "currency": "USD",
                    "image": item["image"] or "https://via.placeholder.com/150",
                    "store": self.store_name,
                    "condition": "Nuevo",
                    "link": item["link"] or url
                })

        except Exception as e:
            print(f"[AliExpressScraper Error]: {e}")
        finally:
            await page.close()

        return products