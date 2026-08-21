const PYTHON_SCRAPER_URL = 'http://127.0.0.1:8000';

export async function fetchScrapedProducts(query) {
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/scrape?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error al conectar con Python Scraper');
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Scraper Service Exception:', error);
    return [];
  }
}