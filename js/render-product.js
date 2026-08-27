/* ==========================================================================
   render-product.js
   Lógica de la página producto.html:
   - Lee el id del producto de la URL (?id=por-002)
   - Pinta imagen, precio, valoración, descripción
   - Pinta las listas de ventajas / desventajas
   - Pinta la tabla de especificaciones técnicas
   - Pinta las reseñas (rellenadas a mano desde el admin)
   ========================================================================== */

import {
  loadProducts,
  getProductById,
  getCategoryMeta,
  formatPrice,
  renderStarsHTML,
  getDiscountPercent
} from './data.js';
import { getCompareIds, toggleCompareId } from './comparador.js';

function reviewHTML(review) {
  return `
    <div class="review">
      <div class="review-head">
        <span class="author">${review.autor || 'Cliente de Amazon'}</span>
        <span class="rating"><span class="stars">${renderStarsHTML(review.valoracion)}</span></span>
      </div>
      ${review.fecha ? `<span class="text-muted" style="font-size:.78rem">${review.fecha}</span>` : ''}
      <p>${review.texto}</p>
    </div>`;
}

async function initProductPage() {
  const root = document.getElementById('product-root');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const products = await loadProducts();
  const product = getProductById(products, id);

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="icon">😕</div>
        <p>No se ha encontrado el producto solicitado.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:16px">Volver al inicio</a>
      </div>`;
    return;
  }

  const meta = getCategoryMeta(product.categoria);
  document.title = `${product.nombre} · WitchOne`;

  document.getElementById('breadcrumb-category').textContent = meta ? meta.nombre : product.categoria;
  document.getElementById('breadcrumb-category').href = `categoria.html?cat=${product.categoria}`;
  document.getElementById('breadcrumb-product').textContent = product.nombre;

  const discount = getDiscountPercent(product.precio, product.precioOriginal);

  document.getElementById('product-image').src = product.imagen;
  document.getElementById('product-image').alt = product.nombre;
  document.getElementById('product-title').textContent = product.nombre;
  document.getElementById('product-rating').innerHTML = `
    <span class="stars">${renderStarsHTML(product.valoracion)}</span>
    <span class="count">${product.valoracion} · ${product.numValoraciones || 0} valoraciones</span>`;
  document.getElementById('product-availability').innerHTML = product.disponible
    ? '<span class="badge" style="background:rgba(74,222,128,.15);color:var(--color-success);border-color:rgba(74,222,128,.35)">✔ Disponible en Amazon</span>'
    : '<span class="badge" style="background:rgba(248,113,113,.15);color:var(--color-danger);border-color:rgba(248,113,113,.35)">Sin stock frecuente</span>';

  document.getElementById('product-price').innerHTML = `
    ${formatPrice(product.precio)}
    <small>Precio orientativo · el precio final se confirma en Amazon</small>`;

  if (discount > 0) {
    document.getElementById('product-original-price').innerHTML =
      `<s>${formatPrice(product.precioOriginal)}</s> <span class="badge">-${discount}%</span>`;
  }

  document.getElementById('product-cta').href = product.linkAfiliado;
  document.getElementById('product-description').textContent = product.descripcion || '';

  // Ventajas / desventajas
  const prosList = document.getElementById('product-pros');
  const consList = document.getElementById('product-cons');
  prosList.innerHTML = (product.ventajas || []).map((v) => `<li>${v}</li>`).join('') || '<li>Sin datos todavía.</li>';
  consList.innerHTML = (product.desventajas || []).map((v) => `<li>${v}</li>`).join('') || '<li>Sin datos todavía.</li>';

  // Tabla de especificaciones
  const specsBody = document.getElementById('product-specs');
  const specEntries = Object.entries(product.specs || {});
  specsBody.innerHTML = specEntries.length
    ? specEntries.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')
    : '<tr><td colspan="2">Sin especificaciones registradas.</td></tr>';

  // Reseñas
  const reviewsWrap = document.getElementById('product-reviews');
  const reviews = product.resenas || [];
  reviewsWrap.innerHTML = reviews.length
    ? reviews.map(reviewHTML).join('')
    : `<div class="empty-state"><div class="icon">📝</div><p>Todavía no se han añadido reseñas para este producto.</p></div>`;

  const compareLink = document.getElementById('compare-link');
  compareLink.href = 'comparador.html';
  compareLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (!getCompareIds().includes(product.id)) toggleCompareId(product.id);
    window.location.href = 'comparador.html';
  });
}

initProductPage();
