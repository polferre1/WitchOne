/* ==========================================================================
   comparador.js
   Toda la lógica de la función "Comparador":
   - Guarda qué productos están seleccionados para comparar (localStorage,
     así la selección se mantiene aunque cambies de página).
   - Pinta la barra flotante "X productos seleccionados · Comparar ahora"
     que aparece en las páginas de categoría.
   - Pinta la tabla comparativa en comparador.html.

   Es un módulo ES: se importa con <script type="module"> desde cada página.
   ========================================================================== */

import {
  loadProducts,
  getCategoryMeta,
  getProductsByCategory,
  getProductById,
  formatPrice,
  renderStarsHTML,
  CATEGORIES
} from './data.js';

const STORAGE_KEY = 'witchone_compare_ids';
const MAX_COMPARE = 4;

/** Lee la lista de ids seleccionados para comparar desde localStorage. */
export function getCompareIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCompareIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  renderCompareBar();
}

/** Añade o quita un producto de la selección de comparación. */
export function toggleCompareId(id) {
  let ids = getCompareIds();
  if (ids.includes(id)) {
    ids = ids.filter((x) => x !== id);
  } else {
    if (ids.length >= MAX_COMPARE) {
      alert(`Puedes comparar como máximo ${MAX_COMPARE} productos a la vez.`);
      return getCompareIds();
    }
    ids.push(id);
  }
  setCompareIds(ids);
  return ids;
}

export function removeCompareId(id) {
  setCompareIds(getCompareIds().filter((x) => x !== id));
}

export function clearCompareIds() {
  setCompareIds([]);
}

/* ---------------------------------------------------------------------- */
/* BARRA FLOTANTE (aparece en páginas de categoría al marcar productos)   */
/* ---------------------------------------------------------------------- */

let barInjected = false;

function ensureBarInDOM() {
  if (barInjected) return;
  const bar = document.createElement('div');
  bar.className = 'compare-bar';
  bar.id = 'compare-bar';
  bar.innerHTML = `
    <span class="count"><span id="compare-count">0</span> seleccionados</span>
    <a href="comparador.html" class="btn btn-primary btn-sm">Comparar ahora</a>
    <button type="button" class="btn btn-outline btn-sm" id="compare-clear">Vaciar</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('#compare-clear').addEventListener('click', clearCompareIds);
  barInjected = true;
}

/** Actualiza la barra flotante y los checkboxes visibles según localStorage. */
export function renderCompareBar() {
  ensureBarInDOM();
  const ids = getCompareIds();
  const bar = document.getElementById('compare-bar');
  const countEl = document.getElementById('compare-count');
  countEl.textContent = ids.length;
  bar.classList.toggle('visible', ids.length > 0);

  // Sincroniza los checkboxes de las tarjetas de producto (si existen en la página)
  document.querySelectorAll('[data-compare-checkbox]').forEach((checkbox) => {
    checkbox.checked = ids.includes(checkbox.dataset.compareCheckbox);
  });
}

/** Engancha los checkboxes "Comparar" de las tarjetas de producto. */
export function initCompareCheckboxes(container = document) {
  container.querySelectorAll('[data-compare-checkbox]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      toggleCompareId(checkbox.dataset.compareCheckbox);
    });
  });
  renderCompareBar();
}

/* ---------------------------------------------------------------------- */
/* PÁGINA DEL COMPARADOR (comparador.html)                                */
/* ---------------------------------------------------------------------- */

const SPEC_LABELS_ORDER_HINT = [
  'Procesador', 'Tarjeta gráfica', 'RAM', 'Almacenamiento', 'Pantalla',
  'Cámara', 'Batería', 'Peso', 'Conectividad', 'Sistema operativo'
];

function buildRow(label, cells) {
  return `<tr><td class="label-col">${label}</td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
}

/** Pinta la tabla comparativa a partir de una lista de productos ya cargados. */
function renderCompareTable(products) {
  const wrap = document.getElementById('compare-table-wrap');
  if (!products.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚖️</div>
        <p>Selecciona al menos 2 productos de la misma categoría en el panel de la izquierda para ver la comparativa.</p>
      </div>`;
    return;
  }

  // Reúne todas las claves de "specs" que aparezcan en cualquiera de los productos
  const specKeys = [];
  products.forEach((p) => {
    Object.keys(p.specs || {}).forEach((k) => {
      if (!specKeys.includes(k)) specKeys.push(k);
    });
  });
  specKeys.sort((a, b) => {
    const ia = SPEC_LABELS_ORDER_HINT.indexOf(a);
    const ib = SPEC_LABELS_ORDER_HINT.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const headerCells = products.map((p) => `
    <th>
      <img src="${p.imagen}" alt="${p.nombre}">
      <div>${p.nombre}</div>
      <button type="button" class="remove-col" data-remove-id="${p.id}">Quitar ✕</button>
    </th>`).join('');

  const priceRow = buildRow('Precio', products.map((p) => `<strong style="color:var(--color-accent)">${formatPrice(p.precio)}</strong>`));
  const ratingRow = buildRow('Valoración', products.map((p) => `${renderStarsHTML(p.valoracion)} <span class="text-muted">(${p.numValoraciones || 0})</span>`));
  const specRows = specKeys.map((key) => buildRow(key, products.map((p) => (p.specs && p.specs[key]) || '—')));
  const prosRow = buildRow('Ventajas', products.map((p) => `<ul>${(p.ventajas || []).map((v) => `<li>✓ ${v}</li>`).join('')}</ul>`));
  const consRow = buildRow('Desventajas', products.map((p) => `<ul>${(p.desventajas || []).map((v) => `<li>✕ ${v}</li>`).join('')}</ul>`));
  const linkRow = buildRow('', products.map((p) => `<a class="btn btn-amazon btn-sm" href="${p.linkAfiliado}" target="_blank" rel="nofollow sponsored noopener">Ver en Amazon</a>`));

  wrap.innerHTML = `
    <table class="compare-table">
      <thead><tr><th class="label-col"></th>${headerCells}</tr></thead>
      <tbody>
        ${priceRow}
        ${ratingRow}
        ${specRows.join('')}
        ${prosRow}
        ${consRow}
        ${linkRow}
      </tbody>
    </table>`;

  wrap.querySelectorAll('[data-remove-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeCompareId(btn.dataset.removeId);
      initComparePage();
    });
  });
}

/** Pinta el panel lateral con el selector de categoría + lista de productos. */
async function renderPicker(allProducts) {
  const categorySelect = document.getElementById('compare-category-select');
  const pickerList = document.getElementById('compare-picker-list');
  const selectedIds = getCompareIds();

  // Si ya hay productos seleccionados, partimos de su categoría
  const preselected = selectedIds.map((id) => getProductById(allProducts, id)).filter(Boolean);
  const initialCategory = preselected[0] ? preselected[0].categoria : CATEGORIES[0].slug;

  categorySelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.slug}">${c.icono} ${c.nombre}</option>`).join('');
  categorySelect.value = initialCategory;

  function paintList() {
    const slug = categorySelect.value;
    const products = getProductsByCategory(allProducts, slug);
    const ids = getCompareIds();
    pickerList.innerHTML = products.map((p) => `
      <label class="picker-item">
        <input type="checkbox" data-compare-checkbox="${p.id}" ${ids.includes(p.id) ? 'checked' : ''}>
        <img src="${p.imagen}" alt="">
        <span>${p.nombre}</span>
      </label>`).join('');
    initCompareCheckboxes(pickerList);
  }

  categorySelect.addEventListener('change', paintList);
  paintList();
}

/** Punto de entrada de la página comparador.html */
export async function initComparePage() {
  const allProducts = await loadProducts();
  await renderPicker(allProducts);

  const ids = getCompareIds();
  const selectedProducts = ids.map((id) => getProductById(allProducts, id)).filter(Boolean);
  renderCompareTable(selectedProducts);

  // Vuelve a pintar la tabla cada vez que cambie la selección
  window.addEventListener('storage', async () => {
    const updatedIds = getCompareIds();
    const updatedProducts = updatedIds.map((id) => getProductById(allProducts, id)).filter(Boolean);
    renderCompareTable(updatedProducts);
  });

  document.getElementById('compare-picker-list').addEventListener('change', () => {
    const updatedIds = getCompareIds();
    const updatedProducts = updatedIds.map((id) => getProductById(allProducts, id)).filter(Boolean);
    renderCompareTable(updatedProducts);
  });

  document.getElementById('compare-clear-all')?.addEventListener('click', () => {
    clearCompareIds();
    initComparePage();
  });
}
