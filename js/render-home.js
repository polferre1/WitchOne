/* ==========================================================================
   render-home.js
   Pinta las 4 tarjetas de categoría en la página de inicio (index.html),
   mostrando cuántos productos hay disponibles en cada una.
   ========================================================================== */

import { loadProducts, getProductsByCategory, CATEGORIES } from './data.js';

async function renderHomeCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  const products = await loadProducts();

  grid.innerHTML = CATEGORIES.map((cat) => {
    const count = getProductsByCategory(products, cat.slug).length;
    return `
      <a class="category-card" href="categoria.html?cat=${cat.slug}">
        <span class="icon">${cat.icono}</span>
        <h3>${cat.nombre}</h3>
        <p>${cat.descripcion}</p>
        <span class="count-tag">${count} producto${count === 1 ? '' : 's'} disponibles</span>
      </a>`;
  }).join('');
}

renderHomeCategories();
