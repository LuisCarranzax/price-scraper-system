import { fetchScrapedProducts } from '../services/scraperService.js';

// Diccionario enriquecido para autocompletado y sugerencias de hardware y electrónica
const HARDWARE_TERMS = [
  'Kingston',
  'Kingston Fury Beast 16GB DDR4 3200MHz',
  'Kingston Fury Renegade 32GB DDR5',
  'Kingston NV2 1TB SSD NVMe PCIe 4.0',
  'Kingston NV3 2TB M.2 NVMe SSD',
  'Kingston A400 480GB SSD SATA',
  'Kingston XS1000 1TB SSD Externo',
  'Kingston Canvas Select Plus MicroSD 128GB',
  'RTX 4060 8GB GDDR6',
  'RTX 4060 Ti 8GB',
  'RTX 4070 Super 12GB',
  'RTX 3060 12GB GDDR6',
  'RX 7600 XT 16GB Radeon',
  'RX 6600 8GB AMD Radeon',
  'Ryzen 5 5600X 6-Core',
  'Ryzen 7 5700X3D 8-Core',
  'Ryzen 7 7800X3D Gaming',
  'Ryzen 5 7600 AMD Socket AM5',
  'Intel Core i5-12400F 12va Gen',
  'Intel Core i5-13400F 13va Gen',
  'Intel Core i7-14700K 14va Gen',
  'Placa ASUS Prime B550M-A WiFi',
  'Placa Gigabyte B550M DS3H AC',
  'Placa MSI PRO B650M-A WiFi',
  'Fuente de Poder EVGA 600W 80 Plus',
  'Fuente Corsair RM750e 750W 80 Plus Gold',
  'Memoria Corsair Vengeance RGB 16GB DDR4',
  'Cooler CPU DeepCool AK400 Digital',
  'Case Gamer Corsair 4000D Airflow',
  'Monitor Gamer LG 24" 144Hz 1ms IPS',
  'Monitor Samsung Odyssey G3 27" 165Hz',
  'Teclado Mecanico Redragon Kumara K552',
  'Mouse Gamer Logitech G502 HERO',
  'Auriculares HyperX Cloud II Red',
  'Pantalla iPhone 11 Calidad Original Repuesto',
  'Pantalla iPhone 12 Pro OLED Repuesto',
  'Bateria Samsung Galaxy S21 Ultra Original',
  'Modulo Pantalla Samsung A52 Con Marco',
  'Pasta Termica Arctic MX-4 4g'
];

export async function getSuggestions(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ suggestion: '', suggestions: [] });
  }

  const queryClean = q.trim().toLowerCase();

  // Búsqueda prioritaria por prefijo
  const prefixMatches = HARDWARE_TERMS.filter(term =>
    term.toLowerCase().startsWith(queryClean)
  );

  // Búsqueda secundaria por inclusión si no hay suficientes por prefijo
  const containsMatches = HARDWARE_TERMS.filter(
    term => term.toLowerCase().includes(queryClean) && !term.toLowerCase().startsWith(queryClean)
  );

  const allMatches = [...prefixMatches, ...containsMatches];
  const topSuggestion = allMatches.length > 0 ? allMatches[0] : '';

  res.json({
    suggestion: topSuggestion,
    suggestions: allMatches.slice(0, 6)
  });
}

export async function executeSearch(req, res) {
  const { q, store, minPrice, maxPrice, condition, sortBy } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Parámetro de búsqueda "q" requerido' });
  }

  try {
    let products = await fetchScrapedProducts(q.trim());

    // Filtrado por tienda
    if (store && store !== 'Todas' && store.trim() !== '') {
      products = products.filter(p => p.store && p.store.toLowerCase() === store.trim().toLowerCase());
    }

    // Filtrado por condición
    if (condition && condition !== 'Cualquiera' && condition.trim() !== '') {
      products = products.filter(p => {
        if (!p.condition) return false;
        if (condition.toLowerCase() === 'nuevo') {
          return p.condition.toLowerCase().includes('nuevo');
        }
        if (condition.toLowerCase().includes('usado') || condition.toLowerCase().includes('seminuevo')) {
          return p.condition.toLowerCase().includes('usado') || p.condition.toLowerCase().includes('seminuevo') || p.condition.toLowerCase().includes('repuesto');
        }
        return p.condition.toLowerCase() === condition.trim().toLowerCase();
      });
    }

    // Filtrado por precio mínimo
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      const min = parseFloat(minPrice);
      products = products.filter(p => p.price >= min);
    }

    // Filtrado por precio máximo
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      const max = parseFloat(maxPrice);
      products = products.filter(p => p.price <= max);
    }

    // Ordenamiento
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      products.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Métricas rápidas de comparación
    const validPrices = products.filter(p => p.price > 0).map(p => p.price);
    const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
    const uniqueStores = [...new Set(products.map(p => p.store).filter(Boolean))];

    res.json({
      query: q,
      totalResults: products.length,
      lowestPrice,
      highestPrice,
      storesFound: uniqueStores,
      results: products
    });
  } catch (error) {
    console.error('Error en executeSearch:', error);
    res.status(500).json({ error: 'Error procesando la búsqueda', details: error.message });
  }
}