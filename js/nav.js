/* ==========================================================================
   nav.js
   Comportamiento del menú de navegación:
   - Abrir/cerrar el menú en móvil (botón hamburguesa)
   - Marcar como "activo" el enlace de la página en la que estamos
   Este script NO es un módulo (se carga con <script> normal) porque
   se usa en todas las páginas y no necesita import/export.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Cierra el menú al pulsar un enlace (útil en móvil)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Resalta el enlace de navegación correspondiente a la página actual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a[data-page]').forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });
});
