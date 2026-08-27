/* ==========================================================================
   data.js
   Módulo central de datos. Se encarga de:
   - Descargar y cachear el archivo data/products.json
   - Definir las 4 categorías fijas de la web (nombre, icono, descripción)
   - Ofrecer funciones de ayuda (formatear precio, pintar estrellas, buscar
     productos por id/categoría) que usan el resto de scripts.

   Al ser un módulo ES (type="module" en el HTML), todo lo que quieras usar
   desde fuera debe exportarse con "export".
   ========================================================================== */

// Metadatos fijos de las 4 categorías destacadas de WitchOne.
// El "slug" debe coincidir exactamente con el campo "categoria" de cada
// producto en products.json.
export const CATEGORIES = [
  {
    slug: 'sobremesa',
    nombre: 'Ordenadores Sobremesa',
    icono: '🖥️',
    descripcion: 'Torres y mini PCs para gaming, trabajo y ofimática.'
  },
  {
    slug: 'portatiles',
    nombre: 'Portátiles',
    icono: '💻',
    descripcion: 'Ligeros, potentes o gaming: el portátil para cada necesidad.'
  },
  {
    slug: 'moviles',
    nombre: 'Móviles',
    icono: '📱',
    descripcion: 'Los smartphones más interesantes del momento.'
  },
  {
    slug: 'tablets',
    nombre: 'Tablets',
    icono: '📲',
    descripcion: 'Para leer, dibujar, estudiar o ver tus series favoritas.'
  }
];

// Ruta al archivo de datos. Al estar en la raíz del proyecto, funciona
// igual desde cualquier página HTML (todas están también en la raíz).
const PRODUCTS_URL = 'data/products.json';

// Caché en memoria para no volver a descargar el JSON varias veces
// mientras el usuario navega por la misma página.
let productsCache = null;

/**
 * Descarga (o devuelve de caché) la lista completa de productos.
 * @returns {Promise<Array>} array de productos
 */
export async function loadProducts() {
  if (productsCache) return productsCache;

  try {
    const res = await fetch(PRODUCTS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo leer products.json');
    const data = await res.json();
    productsCache = data.productos || [];
    return productsCache;
  } catch (err) {
    console.error('Error cargando productos:', err);
    return [];
  }
}

/** Devuelve los datos de una categoría por su slug. */
export function getCategoryMeta(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

/** Filtra productos por categoría. */
export function getProductsByCategory(products, slug) {
  return products.filter((p) => p.categoria === slug);
}

/** Busca un producto por su id. */
export function getProductById(products, id) {
  return products.find((p) => p.id === id) || null;
}

/** Formatea un número como precio en euros: 749.99 -> "749,99 €" */
export function formatPrice(value) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return Number(value).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });
}

/**
 * Genera el HTML de estrellas para una valoración de 0 a 5.
 * Usa estrellas llenas, media estrella y vacías según el decimal.
 */
export function renderStarsHTML(rating) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(safe);
  const half = safe - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

/** Lee un parámetro de la URL actual, ej: getQueryParam('id') */
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Calcula el % de descuento entre precio original y precio actual. */
export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
