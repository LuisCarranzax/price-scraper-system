import sys
import os
import time
import urllib3
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from scrapers.mercadolibre_scraper import MercadoLibreScraper
from scrapers.mesajil_scraper import MesajilScraper
from scrapers.alphatec_scraper import AlphaTecScraper
from scrapers.computerhouse_scraper import ComputerHouseScraper
from scrapers.cycComputer_scraper import CycComputerScraper
from scrapers.memoryKings_scraper import MemoryKingsScraper
from scrapers.pegasus5000_scraper import Pegasus5000Scraper
from scrapers.repuestoslaptopperu_scraper import RepuestosLaptopScraper

app = FastAPI(
    title="Hardware & Electronics Multi-Store Scraper Engine",
    description="Motor de scraping optimizado y concurrente para 8 tiendas peruanas.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCRAPERS_MAP = {
    "Mercado Libre": MercadoLibreScraper(),
    "Mesajil": MesajilScraper(),
    "Alpha Technology": AlphaTecScraper(),
    "Computer House": ComputerHouseScraper(),
    "CYC Computer": CycComputerScraper(),
    "Memory Kings": MemoryKingsScraper(),
    "Pegasus 5000": Pegasus5000Scraper(),
    "Repuestos Laptop Perú": RepuestosLaptopScraper()
}

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "Optimized Multi-Store Scraper",
        "active_stores": list(SCRAPERS_MAP.keys()),
        "endpoints": ["/scrape?q={producto}&limit={25}&stores={opcional}"]
    }

@app.get("/scrape")
def scrape_products(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    limit: int = Query(25, ge=5, le=100, description="Límite dinámico de productos por tienda"),
    stores: str = Query(None, description="Tiendas separadas por coma")
):
    selected_scrapers = {}
    if stores and isinstance(stores, str):
        req_stores = [s.strip().lower() for s in stores.split(",") if s.strip()]
        for name, inst in SCRAPERS_MAP.items():
            if any(req in name.lower() for req in req_stores):
                selected_scrapers[name] = inst
    
    if not selected_scrapers:
        selected_scrapers = SCRAPERS_MAP

    results = []
    store_logs = {}

    start_all = time.time()

    with ThreadPoolExecutor(max_workers=min(len(selected_scrapers), 8)) as executor:
        future_to_store = {
            executor.submit(scraper.search, q, limit): store_name 
            for store_name, scraper in selected_scrapers.items()
        }

        for future in future_to_store:
            store_name = future_to_store[future]
            start_store = time.time()
            try:
                store_results = future.result()
                duration = round(time.time() - start_store, 2)
                if isinstance(store_results, list) and store_results:
                    results.extend(store_results)
                    store_logs[store_name] = {"status": "ok", "count": len(store_results), "time_sec": duration}
                else:
                    store_logs[store_name] = {"status": "empty", "count": 0, "time_sec": duration}
            except Exception as e:
                duration = round(time.time() - start_store, 2)
                store_logs[store_name] = {"status": "error", "error": str(e), "time_sec": duration}
                print(f"[Store Error {store_name}]: {e}")

    total_time = round(time.time() - start_all, 2)

    return {
        "query": q,
        "count": len(results),
        "limit_per_store": limit,
        "total_time_sec": total_time,
        "store_logs": store_logs,
        "products": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)