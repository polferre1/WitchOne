/* ==========================================================================
   render-category.js
   Lógica de la página categoria.html:
   - Lee la categoría de la URL (?cat=portatiles)
   - Pinta la cabecera (icono, nombre, descripción)
   - Pinta la rejilla de tarjetas de producto
   - Permite ordenar (precio, valoración) y buscar por nombre
   - Activa las casillas "Comparar" de cada tarjeta
   ========================================================================== */

import {
  loadProducts,
  getProductsByCategory,
  getCategoryMeta,
  formatPrice,
  renderStarsHTML,
  getDiscountPercent
} from './data.js';
import { initCompareCheckboxes } from './comparador.js';

function productCardHTML(p) {
  const discount = getDiscountPercent(p.precio, p.precioOriginal);
  return `
    <article class="product-card">
      <div class="thumb">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      </div>
      <div class="body">
        ${discount > 0 ? `<span class="badge">-${discount}%</span>` : ''}
        <h3><a href="producto.html?id=${p.id}">${p.nombre}</a></h3>
        <div class="rating">
          <span class="stars">${renderStarsHTML(p.valoracion)}</span>
          <span class="count">(${p.numValoraciones || 0})</span>
        </div>
        <div class="price">
          ${formatPrice(p.precio)}
          <small>Precio orientativo, consulta Amazon para el precio final</small>
        </div>
        <label class="compare-check">
          <input type="checkbox" data-compare-checkbox="${p.id}">
          Añadir al comparador
        </label>
        <div class="card-actions">
          <a class="btn btn-outline btn-sm" href="producto.html?id=${p.id}">Ver ficha</a>
          <a class="btn btn-amazon btn-sm" href="${p.linkAfiliado}" target="_blank" rel="nofollow sponsored noopener">Ver en Amazon</a>
        </div>
      </div>
    </article>`;
}

function applyFilters(products, { search, sort }) {
  let result = [...products];

  if (search) {
    const term = search.toLowerCase();
    result = result.filter((p) => p.nombre.toLowerCase().includes(term));
  }

  switch (sort) {
    case 'price-asc':
      result.sort((a, b) => a.precio - b.precio);
      break;
    case 'price-desc':
      result.sort((a, b) => b.precio - a.precio);
      break;
    case 'rating-desc':
      result.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
      break;
    default:
      break;
  }

  return result;
}

async function initCategoryPage() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('cat') || 'sobremesa';
  const meta = getCategoryMeta(slug);

  // Cabecera de la categoría
  document.getElementById('category-icon').textContent = meta ? meta.icono : '🛍️';
  document.getElementById('category-title').textContent = meta ? meta.nombre : 'Categoría';
  document.getElementById('category-title-crumb').textContent = meta ? meta.nombre : 'Categoría';
  document.getElementById('category-desc').textContent = meta ? meta.descripcion : '';
  document.title = `${meta ? meta.nombre : 'Categoría'} · WitchOne`;

  const allProducts = await loadProducts();
  const categoryProducts = getProductsByCategory(allProducts, slug);

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  function paint() {
    const filtered = applyFilters(categoryProducts, {
      search: searchInput.value.trim(),
      sort: sortSelect.value
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="icon">🔍</div>
          <p>No se han encontrado productos con esos criterios.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(productCardHTML).join('');
    initCompareCheckboxes(grid);
  }

  searchInput.addEventListener('input', paint);
  sortSelect.addEventListener('change', paint);

  paint();
}

initCategoryPage();
