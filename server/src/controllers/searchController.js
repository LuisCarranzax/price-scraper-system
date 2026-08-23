import { fetchScrapedProducts } from '../services/scraperService.js';

const HARDWARE_TERMS = [
  'Kingston',
  'Kingston Fury Beast 16GB DDR4 3200MHz',
  'Kingston Fury Renegade 32GB DDR5',
  'Kingston NV2 1TB SSD NVMe PCIe 4.0',
  'Kingston NV3 2TB M.2 NVMe SSD',
  'Kingston A400 480GB SSD SATA',
  'Kingston XS1000 1TB SSD Externo',
  'Kingston Canvas Select Plus MicroSD 128GB',
  'Laptop Gamer Victus HP Ryzen 7 RTX 4050',
  'Laptop Gamer ASUS TUF Gaming F15 i7 RTX 4060',
  'Laptop Lenovo IdeaPad 3 AMD Ryzen 5 16GB',
  'Laptop Acer Nitro 5 Intel i5 RTX 3050',
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

function detectCategory(title = '') {
  const t = title.toLowerCase();
  if (/laptop|notebook|victus|macbook|thinkpad|pavilion|zenbook|tuf|rog|ideapad|nitro|katana|legion|vivobook/.test(t)) {
    return 'Laptops';
  }
  if (/ssd|nvme|disco|hdd|micro sd|sdce|pendrive|memoria usb|sata|m\.2|xs1000|a400|snv2|snv3/.test(t)) {
    return 'Almacenamiento';
  }
  if (/rtx|gtx|rx \d|geforce|radeon|gpu|tarjeta (de )?video|tarjeta grafica/.test(t)) {
    return 'Tarjetas de Video';
  }
  if (/ryzen|intel core|i3|i5|i7|i9|procesador|cpu|threadripper/.test(t)) {
    return 'Procesadores';
  }
  if (/ram|ddr4|ddr5|ddr3|sodimm|fury beast|vengeance|trident/.test(t)) {
    return 'Memorias RAM';
  }
  if (/placa|motherboard|mainboard|b550|b650|b450|z790|x670|a520|h610/.test(t)) {
    return 'Placas Madre';
  }
  if (/fuente|power supply|80 plus|bronze|gold|650w|750w|850w|500w|600w/.test(t)) {
    return 'Fuentes de Poder';
  }
  if (/monitor|pantalla|144hz|165hz|240hz|ips|oled|display/.test(t)) {
    return 'Pantallas y Monitores';
  }
  if (/teclado|mouse|cooler|audifono|auricular|pasta termica|cable|repuesto|bateria|modulo/.test(t)) {
    return 'Accesorios y Repuestos';
  }
  return 'Hardware General';
}

function extractSpecs(title = '') {
  const specs = {};
  const t = title;

  // CPU
  const cpuMatch = t.match(/(Ryzen\s+[3579]\s+\w+|Intel\s+Core\s+i[3579]-?\w+|Core\s+i[3579]-?\w+|AMD\s+Ryzen\s+[3579])/i);
  if (cpuMatch) specs['Procesador'] = cpuMatch[0];

  // RAM
  const ramMatch = t.match(/(\d+\s*GB)\s*(DDR[345]|RAM)?/i);
  if (ramMatch) specs['Memoria RAM'] = ramMatch[0];

  // Almacenamiento
  const diskMatch = t.match(/(\d+\s*(?:TB|GB))\s*(SSD|NVMe|PCIe|M\.2|HDD|SATA)?/i);
  if (diskMatch) specs['Almacenamiento'] = diskMatch[0];

  // GPU
  const gpuMatch = t.match(/(RTX\s*\d{4}(?:\s*Ti|\s*Super)?|GTX\s*\d{4}|RX\s*\d{4}(?:\s*XT)?|Radeon\s*\w+|GeForce\s*RTX\s*\d{4})/i);
  if (gpuMatch) specs['Gráficos'] = gpuMatch[0];

  return specs;
}

export async function getSuggestions(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ suggestion: '', suggestions: [] });
  }

  const queryClean = q.trim().toLowerCase();

  const prefixMatches = HARDWARE_TERMS.filter(term =>
    term.toLowerCase().startsWith(queryClean)
  );

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
  const { q, store, category, minPrice, maxPrice, condition, sortBy } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Parámetro de búsqueda "q" requerido' });
  }

  try {
    let rawProducts = await fetchScrapedProducts(q.trim());

    // Enriquecer cada producto con categoría detectada y especificaciones extraídas
    let products = rawProducts.map(p => ({
      ...p,
      category: p.category || detectCategory(p.title),
      specs: extractSpecs(p.title)
    }));

    // Filtrado por tienda
    if (store && store !== 'Todas' && store.trim() !== '') {
      products = products.filter(p => p.store && p.store.toLowerCase() === store.trim().toLowerCase());
    }

    // Filtrado por categoría
    if (category && category !== 'Todas' && category.trim() !== '') {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.trim().toLowerCase());
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
    const uniqueStores = [...new Set(rawProducts.map(p => p.store).filter(Boolean))];
    const uniqueCategories = [...new Set(rawProducts.map(p => detectCategory(p.title)).filter(Boolean))];

    res.json({
      query: q,
      totalResults: products.length,
      lowestPrice,
      highestPrice,
      storesFound: uniqueStores,
      categoriesFound: uniqueCategories,
      results: products
    });
  } catch (error) {
    console.error('Error en executeSearch:', error);
    res.status(500).json({ error: 'Error procesando la búsqueda', details: error.message });
  }
}