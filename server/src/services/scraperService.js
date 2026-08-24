const PYTHON_SCRAPER_URL = 'http://127.0.0.1:8000';

// Caché en memoria con TTL de 5 minutos (300,000 ms)
const CACHE_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map();

function getCacheKey(query, stores = '', limit = 25) {
  return `${query.toLowerCase().trim()}_${stores}_${limit}`;
}

export async function fetchScrapedProducts(query, stores = '', limit = 25) {
  const cacheKey = getCacheKey(query, stores, limit);
  const cached = memoryCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Cache Hit]: Sirviendo resultados cacheados para "${query}" (${stores || 'Todas'})`);
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit)
    });

    if (stores && stores.trim()) {
      params.append('stores', stores.trim());
    }

    const response = await fetch(`${PYTHON_SCRAPER_URL}/scrape?${params.toString()}`);
    if (!response.ok) throw new Error(`Error en Python Scraper (HTTP ${response.status})`);
    
    const data = await response.json();
    const products = data.products || [];

    // Guardar en caché si se obtuvieron resultados
    if (products.length > 0) {
      memoryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: products
      });
    }

    return products;
  } catch (error) {
    console.error('[Scraper Service Exception]:', error.message);
    // Si falla pero hay caché expirada, devolverla como salvaguarda
    if (cached) {
      console.log(`[Cache Fallback]: Retornando caché previa para "${query}"`);
      return cached.data;
    }
    return [];
  }
}