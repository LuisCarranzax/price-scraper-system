# Extraccion Dinamica de Especificaciones y Categorizacion

Este documento explica el funcionamiento del motor de analisis semantico y expresiones regulares implementado en el backend para la categorizacion y extraccion dinamica de caracteristicas tecnicas.

---

## 1. Problematica de Deteccion en Hardware

Los titulos publicados en tiendas peruanas no siguen una estructura estandarizada. Por ejemplo:
- Una placa madre puede titularse *"Placa ASUS Prime H610M-K Intel LGA1700 DDR5"*. Un analizador superficial la catalogaria como "Memoria RAM" por la presencia del termino "DDR5".
- Una computadora ensamblada puede titularse *"COMPUTADORA GEEKOM IT12 Core i5-12450H 16GB SSD512 + Monitor 27\" W11Pro"*, donde "16GB" representa memoria RAM y "SSD512" almacenamiento, sin usar etiquetas explicitas.
- Una fuente de poder suele omitir la palabra "vatios", utilizando unicamente expresiones como "850W 80 Plus Bronze".

---

## 2. Jerarquia y Prioridad de Categorizacion (`detectCategory`)

Para evitar colisiones entre terminos, la clasificacion opera en un orden de precedencia estricto:

```
1. Placas Madre (Detecta: Placa, Motherboard, H610, B550, B650, B760, Z790, AM4, AM5, LGA)
   ↓ (Si no coincide)
2. PCs y Computadoras (Detecta: Computadora, PC Gamer, PC Armada, Geekom, Mini PC, Desktop)
   ↓
3. Laptops y Portatiles (Detecta: Laptop, Notebook, Victus, Macbook, Thinkpad, TUF Gaming)
   ↓
4. Fuentes de Poder (Detecta: Fuente de poder, Power supply, PSU, 80 Plus, 850W, etc.)
   ↓
5. Tarjetas de Video (Detecta: RTX, GTX, Radeon RX, GPU, Tarjeta grafica)
   ↓
6. Procesadores (Detecta: Ryzen, Intel Core, Core i3/i5/i7/i9, CPU)
   ↓
7. Memorias RAM (Detecta: Memoria RAM, DDR4, DDR5, Fury Beast, SO-DIMM)
   ↓
8. Almacenamiento (Detecta: SSD, NVMe, M.2, SATA, Disco Duro, HDD)
   ↓
9. Pantallas y Monitores (Detecta: Monitor, Pantalla gamer, IPS, 144Hz)
   ↓
10. Accesorios y Repuestos (Detecta: Teclado, Mouse, Cooler, Bateria, Repuesto)
    ↓
11. Hardware General (Categoria residual por defecto)
```

---

## 3. Reglas de Extraccion Dinamica por Categoria (`extractDynamicSpecs`)

Una vez determinada la categoria, la funcion analiza el texto del articulo para extraer campos estructurados:

### A. Placas Madre
- **Socket**: Extrae `LGA1700`, `LGA1200`, `AM5`, `AM4`, `sTR5` con normalizacion a mayusculas.
- **Plataforma**: Clasifica `Intel` o `AMD`.
- **Chipset**: Captura modelos especificos como `H610M-K`, `B550`, `B650`, `B760`, `Z790`, `A520`.
- **RAM Soportada**: Detecta compatibilidad `DDR5`, `DDR4` o `DDR3`.
- **Formato**: Reconoce dimensiones `Micro-ATX` (`mATX`), `ATX`, `Mini-ITX`, `E-ATX`.

### B. Fuentes de Poder
- **Potencia**: Captura valores en vatios como `850W`, `750W`, `650W`, `600W`, `500W`, `1000W`.
- **Certificacion**: Reconoce grados de eficiencia `80 Plus Titanium`, `80 Plus Platinum`, `80 Plus Gold`, `80 Plus Bronze`, `80 Plus White`.
- **Modularidad**: Discrimina entre `Full Modular`, `Semimodular` y `No modular`.

### C. PCs Ensambladas y Laptops
- **Procesador**: Extrae modelos Intel Core o AMD Ryzen (`Core i5-12450H`, `Ryzen 7 5700X`).
- **Memoria RAM**: Discrimina valores de memoria (`16GB RAM`, `32GB RAM`), reconociendo cantidades numericas seguidas de GB.
- **Almacenamiento**: Captura capacidades vinculadas a unidades de estado solido o discos mecanicos (`SSD 512GB`, `1TB NVMe`, `SSD512`).
- **Graficos**: Detecta graficos integrados o GPUs dedicadas (`GeForce RTX 4060`, `Radeon Graphics`, `Intel Iris Xe`).
- **Sistema Operativo**: Normaliza menciones como `W11Pro` o `W10` hacia `Windows 11 Pro`, `Windows 10 Home`, `FreeDOS`.
- **Monitor**: Detecta perifericos incluidos como `Monitor 27"` o `Monitor 24"`.

### D. Tarjetas de Video
- **Modelo GPU**: `GeForce RTX 4060`, `Radeon RX 7600`, etc.
- **Memoria VRAM**: Capacidad y tipo (`8GB GDDR6`, `12GB GDDR6X`, `16GB GDDR6`).
- **Interfaz**: `PCIe 4.0`, `PCIe 5.0`, `PCIe 3.0`.

### E. Procesadores
- **Modelo**: `AMD Ryzen 7 5700X`, `Intel Core i5-13400`.
- **Socket Compatible**: `AM4`, `AM5`, `LGA1700`.
- **Frecuencia**: `4.6 GHz Turbo`, `3.8 GHz`.

---

## 4. Ejemplos Reales de Extraccion

### Ejemplo 1: Placa Madre
- **Titulo**: `Placa ASUS Prime H610M-K Intel LGA1700 DDR5 HDMI/VGA/RJ45`
- **Categoria**: `Placas Madre`
- **Ficha Extraida**:
  - `Socket`: LGA1700
  - `Plataforma`: Intel
  - `Chipset`: H610M-K
  - `RAM Soportada`: DDR5

### Ejemplo 2: Fuente de Poder
- **Titulo**: `Fuente ASRock PRO-850B 850W Power supply 80 Plus Bronze Black`
- **Categoria**: `Fuentes de Poder`
- **Ficha Extraida**:
  - `Potencia`: 850W
  - `Certificacion`: 80 Plus Bronze

### Ejemplo 3: PC Ensamblada
- **Titulo**: `COMPUTADORA GEEKOM IT12 Core i5-12450H 16GB SSD512 + Monitor 27" W11Pro`
- **Categoria**: `PCs y Computadoras`
- **Ficha Extraida**:
  - `Procesador`: Core i5-12450H
  - `Memoria RAM`: 16GB RAM
  - `Almacenamiento`: SSD 512GB
  - `Sistema Operativo`: Windows 11 Pro
  - `Monitor Incluido`: Monitor 27"
