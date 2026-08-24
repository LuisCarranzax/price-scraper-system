import { fetchScrapedProducts } from '../services/scraperService.js';

function detectCategory(title = '') {
  const t = title.toLowerCase();

  // 1. Laptops y Portátiles
  if (/laptop|notebook|victus|macbook|thinkpad|pavilion|zenbook|tuf gaming|rog strix|ideapad|nitro 5|katana|legion|vivobook|dell g15|predator|swift/.test(t)) {
    return 'Laptops';
  }

  // 2. Tarjetas de Video
  if (/rtx\s*\d{4}|gtx\s*\d{4}|rx\s*\d{4}|geforce|radeon rx|gpu|tarjeta (de )?video|tarjeta grafica|placa de video/.test(t)) {
    return 'Tarjetas de Video';
  }

  // 3. Procesadores
  if (/ryzen\s+[3579]|intel\s+core\s+i[3579]|core\s+i[3579]|procesador\s+(intel|amd)|cpu\s+(intel|amd)|threadripper/.test(t)) {
    return 'Procesadores';
  }

  // 4. Memorias RAM
  if (/\b(?:ddr4|ddr5|ddr3|sodimm|so-dimm)\b|memoria\s+ram|\bram\s+\d+\s*gb|\bfury beast\b|\bvengeance\s+rgb\b/.test(t)) {
    return 'Memorias RAM';
  }

  // 5. Almacenamiento
  if (/\bssd\b|\bnvme\b|\bm\.2\b|\bsata\b|\bdisco\s+duro\b|\bhdd\b|\bmicro\s*sd\b|\bsdce\b|\bpendrive\b|\bmemoria\s+usb\b|\bxs1000\b|\ba400\b|\bsnv[23]\b/.test(t)) {
    return 'Almacenamiento';
  }

  // 6. Placas Madre
  if (/placa\s+madre|motherboard|mainboard|\bb550\b|\bb650\b|\bb450\b|\bz790\b|\bx670\b|\ba520\b|\bh610\b|\bb760\b/.test(t)) {
    return 'Placas Madre';
  }

  // 7. Fuentes de Poder
  if (/fuente\s+de\s+poder|power\s+supply|\b80\s*plus\b|\bbronze\b|\bgold\b|\b650w\b|\b750w\b|\b850w\b|\b500w\b|\b600w\b|\b1000w\b/.test(t)) {
    return 'Fuentes de Poder';
  }

  // 8. Pantallas y Monitores
  if (/monitor|pantalla\s+(gamer|led|ips|oled|144hz|165hz|240hz|24"|27"|32")|modulo\s+pantalla/.test(t)) {
    return 'Pantallas y Monitores';
  }

  // 9. Accesorios y Repuestos
  if (/teclado|mouse|cooler|disipador|audifono|headset|auricular|pasta\s+termica|cable|repuesto|bateria|ventilador/.test(t)) {
    return 'Accesorios y Repuestos';
  }

  return 'Hardware General';
}

function extractDynamicSpecs(title = '') {
  const specs = {};
  const t = title;

  // 1. Detección Inteligente de Procesador (CPU)
  const cpuRegex = /\b(?:AMD\s+)?(?:Ryzen\s+[3579](?:\s+\w+)?|Intel\s+Core\s+i[3579](?:-\w+)?|Core\s+i[3579](?:-\w+)?|Intel\s+Core\s+Ultra\s+\d+|Athlon|Threadripper)\b/i;
  const cpuMatch = t.match(cpuRegex);
  if (cpuMatch) {
    specs['Procesador'] = cpuMatch[0].trim();
  }

  // 2. Detección Inteligente de Memoria RAM
  const ramRegex = /\b(\d+\s*GB)\s*(?:DDR[345]|RAM|SO-DIMM|3200MHz|3600MHz|4800MHz|5200MHz|5600MHz|6000MHz)?(?=\s*(?:RAM|\b|DDR|SO-DIMM|\+|,|-))/i;
  const ramExplicit = t.match(/(\d+\s*GB\s*(?:RAM|DDR[345]|SO-DIMM))/i);
  if (ramExplicit) {
    specs['Memoria RAM'] = ramExplicit[0].trim();
  } else if (/RAM|DDR[345]/i.test(t)) {
    const genericRam = t.match(/(\d+\s*GB)\s*(?:DDR[345]|RAM)?/i);
    if (genericRam) {
      specs['Memoria RAM'] = genericRam[0].trim();
    }
  }

  // 3. Detección Inteligente de Almacenamiento (SSD / HDD / NVMe)
  const storageExplicit = t.match(/(\d+\s*(?:TB|GB))\s*(SSD|NVMe|PCIe(?:\s*4\.0|\s*5\.0)?|M\.2|HDD|SATA|Disco(?:\s+Sólido)?)/i);
  const storageTypeOnly = t.match(/(SSD\s*(?:Kingston|NVMe|M\.2|SATA)?\s*\d+\s*(?:TB|GB)|Disco\s+Sólido\s*\d+\s*(?:TB|GB))/i);
  
  if (storageExplicit) {
    specs['Almacenamiento'] = storageExplicit[0].trim();
  } else if (storageTypeOnly) {
    specs['Almacenamiento'] = storageTypeOnly[0].trim();
  } else if (/\bSSD\b|\bNVMe\b|\bHDD\b|\bM\.2\b/i.test(t)) {
    const diskCap = t.match(/(\d+\s*(?:TB|GB))/i);
    if (diskCap && (!specs['Memoria RAM'] || diskCap[0] !== specs['Memoria RAM'])) {
      specs['Almacenamiento'] = diskCap[0].trim() + " SSD/Disco";
    }
  }

  // 4. Detección Inteligente de Tarjeta Gráfica (GPU)
  const gpuRegex = /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(RTX\s*\d{4}(?:\s*Ti|\s*Super)?|GTX\s*\d{4}|Radeon\s+RX\s*\d{4}(?:\s*XT)?|Radeon\s+Graphics|Intel\s+Iris\s+Xe|Intel\s+UHD)\b/i;
  const gpuMatch = t.match(gpuRegex);
  if (gpuMatch) {
    specs['Gráficos'] = gpuMatch[0].trim();
  }

  return specs;
}

export async function executeSearch(req, res) {
  const { q, stores, store, categories, category, conditions, condition, minPrice, maxPrice, sortBy } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Parámetro de búsqueda "q" requerido' });
  }

  try {
    // Normalizar tiendas solicitadas
    const rawStores = stores || store || '';
    const storeList = rawStores ? rawStores.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Cantidad Dinámica de productos por tienda
    // 1 tienda: 50 | 2 tiendas: 35 | Todas / 3+: 25
    let limitPerStore = 25;
    if (storeList.length === 1 && !storeList.includes('Todas')) {
      limitPerStore = 50;
    } else if (storeList.length === 2) {
      limitPerStore = 35;
    } else {
      limitPerStore = 25;
    }

    const storesParam = storeList.filter(s => s !== 'Todas').join(',');
    let rawProducts = await fetchScrapedProducts(q.trim(), storesParam, limitPerStore);

    // Enriquecer cada producto con categoría detectada y especificaciones dinámicas
    let products = rawProducts.map(p => ({
      ...p,
      category: p.category || detectCategory(p.title),
      specs: extractDynamicSpecs(p.title)
    }));

    // Filtrado Multi-Checkbox por Tiendas
    if (storeList.length > 0 && !storeList.includes('Todas') && !storeList.includes('')) {
      const lowerStores = storeList.map(s => s.toLowerCase());
      products = products.filter(p => p.store && lowerStores.some(ls => p.store.toLowerCase().includes(ls)));
    }

    // Filtrado Multi-Checkbox por Categorías
    const rawCategories = categories || category || '';
    const categoryList = rawCategories ? rawCategories.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];
    if (categoryList.length > 0 && !categoryList.includes('todas') && !categoryList.includes('')) {
      products = products.filter(p => p.category && categoryList.includes(p.category.toLowerCase()));
    }

    // Filtrado Multi-Checkbox por Condición
    const rawConditions = conditions || condition || '';
    const conditionList = rawConditions ? rawConditions.split(',').map(c => c.trim().toLowerCase()).filter(Boolean) : [];
    if (conditionList.length > 0 && !conditionList.includes('cualquiera') && !conditionList.includes('')) {
      products = products.filter(p => {
        if (!p.condition) return false;
        const condLower = p.condition.toLowerCase();
        return conditionList.some(reqCond => {
          if (reqCond === 'nuevo') return condLower.includes('nuevo');
          if (reqCond.includes('usado') || reqCond.includes('seminuevo')) {
            return condLower.includes('usado') || condLower.includes('seminuevo') || condLower.includes('repuesto');
          }
          return condLower === reqCond;
        });
      });
    }

    // Filtrado por precio mínimo y máximo
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      const min = parseFloat(minPrice);
      products = products.filter(p => p.price >= min);
    }
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

    // Métricas
    const validPrices = products.filter(p => p.price > 0).map(p => p.price);
    const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
    const uniqueStores = [...new Set(rawProducts.map(p => p.store).filter(Boolean))];
    const uniqueCategories = [...new Set(rawProducts.map(p => detectCategory(p.title)).filter(Boolean))];

    res.json({
      query: q,
      totalResults: products.length,
      limitPerStore,
      lowestPrice,
      highestPrice,
      storesFound: uniqueStores,
      categoriesFound: uniqueCategories,
      results: products
    });
  } catch (error) {
    console.error('[ExecuteSearch Error]:', error);
    res.status(500).json({ error: 'Error procesando la búsqueda', details: error.message });
  }
}