import sys
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# Asegurar que el directorio scraper_engine y scrapers estén en sys.path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from scrapers.mercadolibre_scraper import MercadoLibreScraper
from scrapers.falabella_scraper import FalabellaScraper

app = FastAPI(
    title="Hardware & Electronics Scraper Engine",
    description="Motor de scraping concurrente para múltiples tiendas de cómputo y electrónica.",
    version="1.1.0"
)

# Permitir CORS para comunicación directa o vía Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_scraper = MercadoLibreScraper()
falabella_scraper = FalabellaScraper()

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "Hardware Scraper Engine",
        "endpoints": ["/scrape?q={producto}"]
    }

@app.get("/scrape")
def scrape_products(q: str = Query(..., min_length=2, description="Término de búsqueda")):
    scrapers = [ml_scraper, falabella_scraper]
    results = []

    # Ejecución concurrente de scrapers
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_scraper = {executor.submit(scraper.search, q): scraper for scraper in scrapers}
        for future in future_to_scraper:
            try:
                scraper_results = future.result()
                if isinstance(scraper_results, list):
                    results.extend(scraper_results)
            except Exception as e:
                scraper_name = type(future_to_scraper[future]).__name__
                print(f"[Error in {scraper_name}]: {e}")

    return {
        "query": q,
        "count": len(results),
        "products": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)