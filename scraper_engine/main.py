import sys
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from scrapers.mercadolibre_scraper import MercadoLibreScraper
from scrapers.mesajil_scraper import MesajilScraper
from scrapers.alphatec_scraper import AlphaTecScraper
from scrapers.pegasus5000_scraper import Pegasus5000Scraper
from scrapers.cycComputer_scraper import CycComputerScraper
from scrapers.repuestoslaptopperu_scraper import RepuestosLaptopScraper
from scrapers.memoryKings_scraper import MemoryKingsScraper


app = FastAPI(
    title="Hardware & Electronics Multi-Store Scraper Engine",
    description="Motor de scraping concurrente para Mercado Libre, Mesajil, Alpha Technology, Pegasus 5000 y CompuVision.",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de instancias de scrapers
scrapers = [
    MercadoLibreScraper(),
    MesajilScraper(),
    AlphaTecScraper(),
    Pegasus5000Scraper(),
    CycComputerScraper(),
    RepuestosLaptopScraper(),
    MemoryKingsScraper()
]

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "Multi-Store Hardware Scraper Engine",
        "stores": ["Mercado Libre", "Mesajil", "Alpha Technology", "Pegasus 5000", "Grupo Compu & Vision",],
        "endpoints": ["/scrape?q={producto}"]
    }

@app.get("/scrape")
def scrape_products(q: str = Query(..., min_length=2, description="Término de búsqueda")):
    results = []

    # Ejecución concurrente en hilos independientes
    with ThreadPoolExecutor(max_workers=6) as executor:
        future_to_scraper = {executor.submit(scraper.search, q): scraper for scraper in scrapers}
        for future in future_to_scraper:
            try:
                scraper_results = future.result()
                if isinstance(scraper_results, list) and scraper_results:
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