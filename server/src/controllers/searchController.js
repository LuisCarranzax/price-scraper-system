import { fetchScrapedProducts } from '../services/scraperService.js';

export function detectCategory(title = '') {
  const t = title.toLowerCase();

  // 1. Placas Madre (Máxima prioridad para evitar que placas con DDR4/DDR5 o LGA se confundan con RAM)
  if (/\b(placa\s+madre|motherboard|mainboard|placa\s+asus|placa\s+gigabyte|placa\s+msi|placa\s+asrock|placa\s+biostar|h610|b550|b650|b760|z790|z690|a520|a620|x670|x570|h510|h410|b450)\b/i.test(t)) {
    return 'Placas Madre';
  }

  // 2. PCs Ensambladas / Computadoras
  if (/\b(computadora|pc\s+gamer|pc\s+armada|geekom|mini\s*pc|desktop|workstation|all\s+in\s+one|aio)\b/i.test(t)) {
    return 'PCs y Computadoras';
  }

  // 3. Laptops y Portátiles
  if (/\b(laptop|notebook|victus|macbook|thinkpad|pavilion|zenbook|tuf\s+gaming|rog\s+strix|ideapad|nitro\s+5|katana|legion|vivobook|dell\s+g15|predator|swift)\b/i.test(t)) {
    return 'Laptops';
  }

  // 4. Fuentes de Poder
  if (/\b(fuente\s+de\s+poder|fuente\s+asrock|fuente\s+corsair|fuente\s+evga|fuente\s+seasonic|fuente\s+gamemax|fuente\s+antryx|power\s+supply|psu|80\s*plus)\b/i.test(t)) {
    return 'Fuentes de Poder';
  }

  // 5. Tarjetas de Video
  if (/\b(rtx\s*\d{4}|gtx\s*\d{4}|radeon\s+rx\s*\d{4}|gpu|tarjeta\s+(de\s+)?video|tarjeta\s+grafica|placa\s+de\s+video)\b/i.test(t)) {
    return 'Tarjetas de Video';
  }

  // 6. Procesadores
  if (/\b(ryzen\s+[3579]|intel\s+core\s+i[3579]|core\s+i[3579]|procesador\s+(intel|amd)|cpu\s+(intel|amd)|threadripper)\b/i.test(t)) {
    return 'Procesadores';
  }

  // 7. Memorias RAM
  if (/\b(memoria\s+ram|ram\s+\d+\s*gb|fury\s+beast|vengeance\s+rgb|ddr4|ddr5|ddr3|sodimm|so-dimm)\b/i.test(t)) {
    return 'Memorias RAM';
  }

  // 8. Almacenamiento
  if (/\b(ssd|nvme|m\.2|sata|disco\s+duro|hdd|micro\s*sd|sdce|pendrive|memoria\s+usb|xs1000|a400|snv[23])\b/i.test(t)) {
    return 'Almacenamiento';
  }

  // 9. Pantallas y Monitores
  if (/\b(monitor|pantalla\s+(gamer|led|ips|oled|144hz|165hz|240hz|24"|27"|32"))\b/i.test(t)) {
    return 'Pantallas y Monitores';
  }

  // 10. Accesorios y Repuestos
  if (/\b(teclado|mouse|cooler|disipador|audifono|headset|auricular|pasta\s+termica|cable|repuesto|bateria|ventilador)\b/i.test(t)) {
    return 'Accesorios y Repuestos';
  }

  return 'Hardware General';
}

export function extractDynamicSpecs(title = '', category = '') {
  const specs = {};
  const t = title;

  if (!category) {
    category = detectCategory(title);
  }

  // A) Placas Madre
  if (category === 'Placas Madre') {
    const socketM = t.match(/\b(LGA\s*1700|LGA\s*1200|LGA\s*1151|AM5|AM4|sTR5|sTRX4)\b/i);
    if (socketM) specs['Socket'] = socketM[0].toUpperCase().replace(/\s+/g, '');

    if (/\bIntel\b/i.test(t)) specs['Plataforma'] = 'Intel';
    else if (/\bAMD\b/i.test(t)) specs['Plataforma'] = 'AMD';

    const chipsetM = t.match(/\b(H610M?-[A-Z0-9]+|H610|B550M?|B550|B650M?|B650|B760M?|B760|Z790|Z690|A520M?|A520|A620M?|A620|X670E?|X670|B450M?|B450|H510M?|H510)\b/i);
    if (chipsetM) specs['Chipset'] = chipsetM[0].toUpperCase();

    const ramSup = t.match(/\b(DDR5|DDR4|DDR3)\b/i);
    if (ramSup) specs['RAM Soportada'] = ramSup[0].toUpperCase();

    const formM = t.match(/\b(Micro-?ATX|mATX|Mini-?ITX|ATX|E-ATX)\b/i);
    if (formM) specs['Formato'] = formM[0].toUpperCase();
  }

  // B) Fuentes de Poder
  else if (category === 'Fuentes de Poder') {
    const wattsM = t.match(/\b(\d{3,4}\s*W(?:atts)?)\b/i);
    if (wattsM) specs['Potencia'] = wattsM[0].toUpperCase().replace('ATTS', '');

    const certM = t.match(/\b(80\s*Plus\s*(?:Titanium|Platinum|Gold|Bronze|Silver|White|Standard)?)\b/i);
    if (certM) specs['Certificación'] = certM[0].replace(/\b\w/g, l => l.toUpperCase());

    if (/\b(full\s*modular|totalmente\s*modular)\b/i.test(t)) specs['Tipo'] = 'Full Modular';
    else if (/\b(semi\s*modular|semi-modular)\b/i.test(t)) specs['Tipo'] = 'Semimodular';
    else if (/\b(no\s*modular)\b/i.test(t)) specs['Tipo'] = 'No modular';
  }

  // C) PCs Ensambladas / Laptops
  else if (category === 'PCs y Computadoras' || category === 'Laptops') {
    const cpuM = t.match(/\b(?:AMD\s+)?(?:Ryzen\s+[3579](?:\s+\w+)?|Intel\s+Core\s+i[3579](?:-\w+)?|Core\s+i[3579](?:-\w+)?|Intel\s+Core\s+Ultra\s+\d+|Athlon|Threadripper)\b/i);
    if (cpuM) specs['Procesador'] = cpuM[0].trim();

    // Memoria RAM
    const ramExplicit = t.match(/\b(\d+\s*GB)\s*(?:RAM|DDR[345]|SO-DIMM)\b/i);
    if (ramExplicit) {
      specs['Memoria RAM'] = ramExplicit[1].toUpperCase() + ' RAM';
    } else {
      const ramPlain = t.match(/\b(\d{1,3}\s*GB)\b(?=\s*(?:SSD|NVMe|HDD|M\.2|\+|\/|,|\s*\d{3,4}))/i);
      if (ramPlain) {
        specs['Memoria RAM'] = ramPlain[1].toUpperCase() + ' RAM';
      } else {
        const ramAny = t.match(/\b(\d{1,3}\s*GB)\b/i);
        if (ramAny && parseInt(ramAny[1].replace(/\D/g, '')) <= 128) {
          specs['Memoria RAM'] = ramAny[1].toUpperCase() + ' RAM';
        }
      }
    }

    // Almacenamiento
    const ssdNum = t.match(/\bSSD\s*(\d{3,4})\b/i);
    if (ssdNum) {
      specs['Almacenamiento'] = `SSD ${ssdNum[1]}GB`;
    } else {
      const storageExplicit = t.match(/\b(\d+\s*(?:TB|GB))\s*(SSD|NVMe|PCIe|M\.2|HDD|SATA|Disco)\b/i);
      if (storageExplicit) {
        specs['Almacenamiento'] = `${storageExplicit[1]} ${storageExplicit[2].toUpperCase()}`;
      } else {
        const storagePrefix = t.match(/\b(SSD|NVMe|HDD)\s*(\d+\s*(?:TB|GB))\b/i);
        if (storagePrefix) {
          specs['Almacenamiento'] = `${storagePrefix[1].toUpperCase()} ${storagePrefix[2]}`;
        }
      }
    }

    // Gráficos
    const gpuM = t.match(/\b(?:NVIDIA\s+)?(?:GeForce\s+)?(RTX\s*\d{4}(?:\s*Ti|\s*Super)?|GTX\s*\d{4}|Radeon\s+RX\s*\d{4}(?:\s*XT)?|Radeon\s+Graphics|Intel\s+Iris\s+Xe|Intel\s+UHD)\b/i);
    if (gpuM) specs['Gráficos'] = gpuM[0].trim();

    // Sistema Operativo
    const osM = t.match(/\b(Windows\s*11\s*(?:Pro|Home)?|W11\s*Pro|W11\s*Home|Windows\s*10\s*(?:Pro|Home)?|W10\s*Pro|FreeDOS|Linux)\b/i);
    if (osM) {
      let osTxt = osM[0].trim();
      if (/w11/i.test(osTxt)) osTxt = osTxt.replace(/w11/i, 'Windows 11 ');
      else if (/w10/i.test(osTxt)) osTxt = osTxt.replace(/w10/i, 'Windows 10 ');
      specs['Sistema Operativo'] = osTxt.replace(/\b\w/g, l => l.toUpperCase()).trim();
    }

    // Monitor (si incluye)
    const monM = t.match(/\b(Monitor\s*\d{2}(?:\.\d)?["']?(?:\s*(?:FHD|IPS|144Hz|165Hz))?)\b/i);
    if (monM) specs['Monitor Incluido'] = monM[0].trim();
  }

  // D) Tarjetas de Video
  else if (category === 'Tarjetas de Video') {
    const gpuM = t.match(/\b(?:NVIDIA\s+)?(?:GeForce\s+)?(RTX\s*\d{4}(?:\s*Ti|\s*Super)?|GTX\s*\d{4}|Radeon\s+RX\s*\d{4}(?:\s*XT)?)\b/i);
    if (gpuM) specs['Modelo GPU'] = gpuM[0].trim();

    const vramM = t.match(/\b(\d+\s*GB)\s*(?:GDDR[56]X?)?\b/i);
    if (vramM) {
      const memType = t.match(/\b(GDDR[56]X?)\b/i);
      specs['Memoria VRAM'] = vramM[1].toUpperCase() + (memType ? ` ${memType[0].toUpperCase()}` : '');
    }

    const pcieM = t.match(/\b(PCIe\s*[345]\.0)\b/i);
    if (pcieM) specs['Interfaz'] = pcieM[0].toUpperCase();
  }

  // E) Procesadores
  else if (category === 'Procesadores') {
    const cpuM = t.match(/\b(?:AMD\s+)?(?:Ryzen\s+[3579](?:\s+\w+)?|Intel\s+Core\s+i[3579](?:-\w+)?|Core\s+i[3579](?:-\w+)?|Intel\s+Core\s+Ultra\s+\d+)\b/i);
    if (cpuM) specs['Modelo'] = cpuM[0].trim();

    const socketM = t.match(/\b(AM5|AM4|LGA\s*1700|LGA\s*1200|LGA\s*1151|sTR5)\b/i);
    if (socketM) specs['Socket'] = socketM[0].toUpperCase().replace(/\s+/g, '');

    const ghzM = t.match(/\b(\d+(?:\.\d+)?\s*GHz(?:\s*Turbo)?)\b/i);
    if (ghzM) specs['Frecuencia'] = ghzM[0].trim();
  }

  // F) Memorias RAM
  else if (category === 'Memorias RAM') {
    const ramType = t.match(/\b(DDR5|DDR4|DDR3|SO-DIMM)\b/i);
    if (ramType) specs['Tipo'] = ramType[0].toUpperCase();

    const capM = t.match(/\b(\d+\s*GB(?:\s*\(\s*\d+\s*x\s*\d+\s*GB\s*\))?)\b/i);
    if (capM) specs['Capacidad'] = capM[0].toUpperCase();

    const mhzM = t.match(/\b(\d{4}\s*MHz)\b/i);
    if (mhzM) specs['Frecuencia'] = mhzM[0].toUpperCase();
  }

  // G) Almacenamiento
  else if (category === 'Almacenamiento') {
    const capM = t.match(/\b(\d+\s*(?:TB|GB))\b/i);
    if (capM) specs['Capacidad'] = capM[0].toUpperCase();

    const typeM = t.match(/\b(NVMe\s*M\.2|M\.2\s*NVMe|M\.2|NVMe|SSD\s*SATA|SATA\s*SSD|SSD|Disco\s*Duro|HDD|MicroSD)\b/i);
    if (typeM) specs['Tipo de Unidad'] = typeM[0].toUpperCase();

    const pcieM = t.match(/\b(PCIe\s*(?:4\.0|5\.0|3\.0)|Gen\s*[345]|SATA\s*III)\b/i);
    if (pcieM) specs['Interfaz'] = pcieM[0].toUpperCase();
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
    let products = rawProducts.map(p => {
      const cat = p.category || detectCategory(p.title);
      return {
        ...p,
        category: cat,
        specs: extractDynamicSpecs(p.title, cat)
      };
    });

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