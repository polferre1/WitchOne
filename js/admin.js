/* ==========================================================================
   admin.js
   Lógica completa del panel de administración (admin.html):
   - Carga los productos actuales (desde localStorage si ya se ha usado el
     panel antes, o si no desde data/products.json la primera vez).
   - Permite crear, editar y borrar productos con un formulario completo.
   - Guarda cada cambio automáticamente en localStorage (borrador de trabajo
     del navegador) para no perder el trabajo si recargas la página.
   - Permite descargar el products.json actualizado para sustituir el
     archivo del proyecto, y también importar un products.json existente.

   IMPORTANTE: al ser una web estática (sin servidor ni base de datos),
   este panel NO modifica el archivo real del proyecto directamente.
   El flujo de trabajo es:
     1) Edita/crea/borra productos aquí.
     2) Pulsa "Descargar products.json".
     3) Sustituye el archivo data/products.json de tu proyecto por el
        descargado y sube ese cambio (commit / deploy).
   ========================================================================== */

import { CATEGORIES } from './data.js';

const STORAGE_KEY = 'witchone_admin_products';
const PRODUCTS_URL = 'data/products.json';

let products = [];
let editingId = null;

/* ---------------------------------------------------------------------- */
/* CARGA Y GUARDADO EN LOCALSTORAGE                                        */
/* ---------------------------------------------------------------------- */

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ productos: products }));
}

async function loadInitialProducts({ forceFromFile = false } = {}) {
  if (!forceFromFile) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        products = JSON.parse(raw).productos || [];
        return;
      } catch {
        /* si el JSON guardado está corrupto, seguimos y recargamos del archivo */
      }
    }
  }

  try {
    const res = await fetch(PRODUCTS_URL, { cache: 'no-store' });
    const data = await res.json();
    products = data.productos || [];
    saveToLocalStorage();
  } catch (err) {
    console.error(err);
    products = [];
    showStatus('No se ha podido leer data/products.json. Empiezas con la lista vacía.', 'error');
  }
}

/* ---------------------------------------------------------------------- */
/* UTILIDADES                                                              */
/* ---------------------------------------------------------------------- */

function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateId(categoria, nombre) {
  const prefix = categoria.slice(0, 3);
  const base = slugify(nombre).split('-').slice(0, 2).join('-') || 'producto';
  let candidate = `${prefix}-${base}`;
  let n = 1;
  while (products.some((p) => p.id === candidate)) {
    candidate = `${prefix}-${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function showStatus(message, type = 'ok') {
  const el = document.getElementById('admin-status');
  el.textContent = message;
  el.className = `admin-status show ${type}`;
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => el.classList.remove('show'), 4000);
}

/* ---------------------------------------------------------------------- */
/* EDITORES DE LISTAS DINÁMICAS (ventajas, desventajas, specs, reseñas)   */
/* ---------------------------------------------------------------------- */

function simpleListEditor(containerId, values = []) {
  const container = document.getElementById(containerId);

  function addRow(value = '') {
    const row = document.createElement('div');
    row.className = 'list-row';
    row.innerHTML = `
      <input type="text" value="${escapeAttr(value)}" placeholder="Escribe un punto...">
      <button type="button" class="remove-row-btn" title="Eliminar">✕</button>`;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  container.innerHTML = '';
  (values.length ? values : ['']).forEach(addRow);

  return {
    getValues: () =>
      Array.from(container.querySelectorAll('input'))
        .map((i) => i.value.trim())
        .filter(Boolean),
    addRow
  };
}

function specsEditor(containerId, specsObj = {}) {
  const container = document.getElementById(containerId);

  function addRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
      <input type="text" class="spec-key" value="${escapeAttr(key)}" placeholder="Ej: Procesador">
      <input type="text" class="spec-value" value="${escapeAttr(value)}" placeholder="Ej: Intel Core i5">
      <button type="button" class="remove-row-btn" title="Eliminar">✕</button>`;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  container.innerHTML = '';
  const entries = Object.entries(specsObj);
  (entries.length ? entries : [['', '']]).forEach(([k, v]) => addRow(k, v));

  return {
    getValues: () => {
      const result = {};
      container.querySelectorAll('.spec-row').forEach((row) => {
        const key = row.querySelector('.spec-key').value.trim();
        const value = row.querySelector('.spec-value').value.trim();
        if (key && value) result[key] = value;
      });
      return result;
    },
    addRow
  };
}

function reviewsEditor(containerId, reviews = []) {
  const container = document.getElementById(containerId);

  function addRow(review = {}) {
    const row = document.createElement('div');
    row.className = 'review-row';
    row.innerHTML = `
      <input type="text" class="review-autor" value="${escapeAttr(review.autor || '')}" placeholder="Autor (ej: Marta L.)">
      <input type="number" class="review-valoracion" value="${review.valoracion ?? 5}" min="1" max="5" step="1" placeholder="1-5">
      <textarea class="review-texto" placeholder="Texto de la reseña copiado de Amazon...">${escapeHTML(review.texto || '')}</textarea>
      <button type="button" class="remove-row-btn" title="Eliminar">✕</button>`;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  container.innerHTML = '';
  (reviews.length ? reviews : []).forEach(addRow);

  return {
    getValues: () => {
      const result = [];
      container.querySelectorAll('.review-row').forEach((row) => {
        const autor = row.querySelector('.review-autor').value.trim();
        const texto = row.querySelector('.review-texto').value.trim();
        const valoracion = Number(row.querySelector('.review-valoracion').value) || 5;
        if (texto) {
          result.push({ autor: autor || 'Cliente de Amazon', valoracion, texto, fecha: new Date().toISOString().slice(0, 10) });
        }
      });
      return result;
    },
    addRow
  };
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}
function escapeHTML(str) {
  return String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

let ventajasEditor, desventajasEditor, specsEd, reviewsEd;

function initDynamicEditors(product = null) {
  ventajasEditor = simpleListEditor('ventajas-editor', product?.ventajas || []);
  desventajasEditor = simpleListEditor('desventajas-editor', product?.desventajas || []);
  specsEd = specsEditor('specs-editor', product?.specs || {});
  reviewsEd = reviewsEditor('reviews-editor', product?.resenas || []);
}

/* ---------------------------------------------------------------------- */
/* FORMULARIO: rellenar / leer / resetear                                 */
/* ---------------------------------------------------------------------- */

function populateCategorySelect() {
  const select = document.getElementById('f-categoria');
  select.innerHTML = CATEGORIES.map((c) => `<option value="${c.slug}">${c.icono} ${c.nombre}</option>`).join('');
}

function fillFormWithProduct(product) {
  editingId = product.id;
  document.getElementById('form-title').textContent = `Editando: ${product.nombre}`;
  document.getElementById('f-nombre').value = product.nombre || '';
  document.getElementById('f-categoria').value = product.categoria || CATEGORIES[0].slug;
  document.getElementById('f-imagen').value = product.imagen || '';
  document.getElementById('f-precio').value = product.precio ?? '';
  document.getElementById('f-precio-original').value = product.precioOriginal ?? '';
  document.getElementById('f-valoracion').value = product.valoracion ?? 4.5;
  document.getElementById('f-num-valoraciones').value = product.numValoraciones ?? 0;
  document.getElementById('f-disponible').checked = product.disponible !== false;
  document.getElementById('f-link').value = product.linkAfiliado || '';
  document.getElementById('f-descripcion').value = product.descripcion || '';
  updateImagePreview();
  initDynamicEditors(product);
  document.getElementById('btn-cancel-edit').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  document.getElementById('product-form').reset();
  document.getElementById('form-title').textContent = 'Nuevo producto';
  document.getElementById('f-valoracion').value = 4.5;
  document.getElementById('f-num-valoraciones').value = 0;
  document.getElementById('f-disponible').checked = true;
  document.getElementById('btn-cancel-edit').style.display = 'none';
  initDynamicEditors(null);
  updateImagePreview();
}

function updateImagePreview() {
  const url = document.getElementById('f-imagen').value.trim();
  const preview = document.getElementById('image-preview');
  if (url) {
    preview.style.display = 'flex';
    preview.innerHTML = `<img src="${url}" alt="Vista previa" onerror="this.style.opacity=0.2">`;
  } else {
    preview.style.display = 'none';
  }
}

function readFormAsProduct() {
  const nombre = document.getElementById('f-nombre').value.trim();
  const categoria = document.getElementById('f-categoria').value;

  return {
    id: editingId || generateId(categoria, nombre),
    nombre,
    categoria,
    imagen: document.getElementById('f-imagen').value.trim(),
    precio: Number(document.getElementById('f-precio').value) || 0,
    precioOriginal: Number(document.getElementById('f-precio-original').value) || undefined,
    valoracion: Number(document.getElementById('f-valoracion').value) || 0,
    numValoraciones: Number(document.getElementById('f-num-valoraciones').value) || 0,
    disponible: document.getElementById('f-disponible').checked,
    linkAfiliado: document.getElementById('f-link').value.trim(),
    descripcion: document.getElementById('f-descripcion').value.trim(),
    ventajas: ventajasEditor.getValues(),
    desventajas: desventajasEditor.getValues(),
    specs: specsEd.getValues(),
    resenas: reviewsEd.getValues()
  };
}

/* ---------------------------------------------------------------------- */
/* TABLA DE PRODUCTOS                                                      */
/* ---------------------------------------------------------------------- */

function renderTable(filterText = '') {
  const tbody = document.getElementById('products-tbody');
  const term = filterText.trim().toLowerCase();
  const filtered = products.filter((p) => !term || p.nombre.toLowerCase().includes(term));

  document.getElementById('products-count').textContent = `${products.length} producto${products.length === 1 ? '' : 's'} en total`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--color-text-faint)">No hay productos que coincidan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p) => {
    const catMeta = CATEGORIES.find((c) => c.slug === p.categoria);
    return `
      <tr>
        <td><img src="${p.imagen}" alt=""></td>
        <td>${p.nombre}<br><span class="text-muted" style="font-size:.75rem">${p.id}</span></td>
        <td>${catMeta ? `${catMeta.icono} ${catMeta.nombre}` : p.categoria}</td>
        <td>${p.precio} €</td>
        <td>${p.valoracion} ★</td>
        <td>${p.disponible !== false ? '✅' : '❌'}</td>
        <td class="row-actions">
          <button class="btn btn-outline btn-sm" data-edit="${p.id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-delete="${p.id}">Borrar</button>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = products.find((p) => p.id === btn.dataset.edit);
      if (product) fillFormWithProduct(product);
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = products.find((p) => p.id === btn.dataset.delete);
      if (!product) return;
      if (!confirm(`¿Seguro que quieres borrar "${product.nombre}"? Esta acción no se puede deshacer.`)) return;
      products = products.filter((p) => p.id !== product.id);
      saveToLocalStorage();
      renderTable(document.getElementById('admin-search').value);
      showStatus('Producto borrado del borrador. Recuerda descargar el JSON para aplicarlo a la web.', 'info');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* IMPORTAR / EXPORTAR products.json                                       */
/* ---------------------------------------------------------------------- */

function downloadProductsJSON() {
  const payload = JSON.stringify({ productos: products }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showStatus('Descargado. Sustituye data/products.json por este archivo en tu proyecto.', 'ok');
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.productos)) throw new Error('Formato inválido');
      products = data.productos;
      saveToLocalStorage();
      renderTable();
      showStatus(`Importados ${products.length} productos desde el archivo.`, 'ok');
    } catch (err) {
      showStatus('El archivo no tiene el formato esperado (debe tener una clave "productos").', 'error');
    }
  };
  reader.readAsText(file);
}

/* ---------------------------------------------------------------------- */
/* INICIALIZACIÓN                                                          */
/* ---------------------------------------------------------------------- */

async function initAdmin() {
  populateCategorySelect();
  await loadInitialProducts();
  initDynamicEditors(null);
  renderTable();

  document.getElementById('f-imagen').addEventListener('input', updateImagePreview);

  document.getElementById('ventajas-add').addEventListener('click', () => ventajasEditor.addRow());
  document.getElementById('desventajas-add').addEventListener('click', () => desventajasEditor.addRow());
  document.getElementById('specs-add').addEventListener('click', () => specsEd.addRow());
  document.getElementById('reviews-add').addEventListener('click', () => reviewsEd.addRow());

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const productData = readFormAsProduct();

    if (!productData.nombre || !productData.imagen || !productData.linkAfiliado) {
      showStatus('Nombre, imagen y link de afiliado son obligatorios.', 'error');
      return;
    }

    const existingIndex = products.findIndex((p) => p.id === productData.id);
    if (existingIndex >= 0) {
      products[existingIndex] = productData;
      showStatus('Producto actualizado en el borrador.', 'ok');
    } else {
      products.push(productData);
      showStatus('Producto añadido al borrador.', 'ok');
    }

    saveToLocalStorage();
    renderTable(document.getElementById('admin-search').value);
    resetForm();
  });

  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

  document.getElementById('admin-search').addEventListener('input', (e) => renderTable(e.target.value));

  document.getElementById('btn-export').addEventListener('click', downloadProductsJSON);

  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) handleImportFile(e.target.files[0]);
    e.target.value = '';
  });

  document.getElementById('btn-reload-file').addEventListener('click', async () => {
    if (!confirm('Esto descarta los cambios del borrador actual y recarga data/products.json original. ¿Continuar?')) return;
    await loadInitialProducts({ forceFromFile: true });
    renderTable();
    resetForm();
    showStatus('Borrador reiniciado desde data/products.json.', 'info');
  });
}

initAdmin();
