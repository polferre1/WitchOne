# WitchOne

Web de afiliación de Amazon sobre tecnología (ordenadores de sobremesa, portátiles,
móviles y tablets), hecha con **HTML, CSS y JavaScript vanilla** (sin frameworks).

## 📁 Estructura del proyecto

```
WitchOne/
├── index.html          Página de inicio (4 categorías destacadas)
├── categoria.html       Listado de productos de una categoría (?cat=portatiles)
├── producto.html         Ficha de producto (?id=por-002)
├── comparador.html       Comparador de productos lado a lado
├── admin.html            Panel de administración de productos (sin código)
│
├── css/
│   ├── variables.css     Paleta de colores, tipografías, medidas
│   ├── base.css          Reset y estilos generales
│   ├── layout.css        Header, footer, navegación
│   ├── components.css    Tarjetas, botones, tablas, formularios...
│   ├── pages.css         Estilos propios de cada página
│   └── admin.css         Estilos propios del panel de administración
│
├── js/
│   ├── data.js            Carga products.json + categorías + utilidades
│   ├── nav.js              Menú móvil y enlace activo
│   ├── render-home.js      Pinta las categorías en el inicio
│   ├── render-category.js  Pinta las tarjetas de producto de una categoría
│   ├── render-product.js   Pinta la ficha de producto
│   ├── comparador.js       Selección de productos a comparar + tabla comparativa
│   └── admin.js            CRUD de productos del panel admin
│
├── data/
│   └── products.json      "Base de datos" de productos (la lee toda la web)
│
└── images/                Carpeta libre por si guardas imágenes propias
```

## ▶️ Cómo ver la web en local

Como la web usa `fetch()` para leer `data/products.json`, **no funciona abriendo
los archivos `.html` directamente con doble clic** (el navegador bloquea esas
peticiones en `file://`). Necesitas servirla con un pequeño servidor local:

**Opción A — Python (ya viene instalado en la mayoría de sistemas):**
```bash
cd WitchOne
python3 -m http.server 8000
```
Luego abre `http://localhost:8000/index.html` en el navegador.

**Opción B — Extensión "Live Server" de VS Code:**
Instala la extensión, clic derecho sobre `index.html` → "Open with Live Server".

Para publicarla de verdad, súbela tal cual a cualquier hosting estático:
GitHub Pages, Netlify, Vercel, Cloudflare Pages, o tu hosting habitual.

## 🛠️ Cómo añadir, editar o borrar productos (sin tocar código)

1. Abre `admin.html` (con el servidor local en marcha, o ya publicado en tu
   hosting — recomendable protegerlo o no enlazarlo públicamente).
2. Al entrar, el panel carga automáticamente los productos actuales desde
   `data/products.json`.
3. Usa el formulario de la izquierda para **crear un producto nuevo** o pulsa
   **"Editar"** en la tabla de la derecha para modificar uno existente.
   Puedes añadir tantas líneas de ventajas, desventajas, especificaciones y
   reseñas como quieras con los botones "+ Añadir...".
4. Cada cambio (crear, editar, borrar) se guarda automáticamente como
   **borrador en tu navegador** (localStorage), así que no pierdes el trabajo
   si recargas la página por accidente. Ojo: ese borrador es local a tu
   navegador/ordenador, no se comparte automáticamente con la web pública.
5. Cuando termines tus cambios, pulsa **"⬇ Descargar products.json"**. Se
   descargará el archivo actualizado con todos los productos.
6. **Sustituye** el archivo `data/products.json` de la carpeta del proyecto
   por el que acabas de descargar.
7. **Sube ese cambio** a donde tengas alojada la web:
   - Si usas GitHub Pages/Netlify/Vercel conectado a un repositorio: haz commit
     y push del archivo `data/products.json` actualizado (o sube el archivo
     desde la web de GitHub si no usas git en local).
   - Si usas un hosting tradicional (FTP/panel de control): sube el archivo
     `data/products.json` sobrescribiendo el anterior.
8. En cuanto el archivo esté actualizado en el servidor, la web principal
   (inicio, categorías, fichas de producto y comparador) mostrará los
   productos nuevos automáticamente, sin tocar ni una línea de código.

### ✨ Autorrelleno desde Amazon (pegando texto)

No es posible que la web lea Amazon automáticamente solo pegando el link: el navegador
bloquea esas peticiones entre webs (CORS) y, además, el Programa de Afiliados de Amazon
prohíbe extraer datos de sus páginas de forma automatizada (scraping), incluso si fuera
técnicamente posible.

En su lugar, el panel incluye **dos cuadros** de autorrelleno que sí son 100% seguros y
permitidos: tú mismo copias el texto de la página del producto (nada se descarga
automáticamente) y un script local detecta y rellena por ti.

**Cuadro 1 — Texto general** (nombre, precio, valoración, ventajas):
1. Abre el producto en Amazon.
2. Selecciona el texto desde el título hasta el final de "Acerca de este artículo" y cópialo.
3. Pégalo en el primer cuadro y pulsa "🪄 Detectar nombre, precio, valoración y ventajas".

**Cuadro 2 — Tabla de especificaciones** (aparte, más fiable):
Las tablas de "Información técnica" de Amazon se copian con un formato distinto al resto
de la página (a veces con caracteres invisibles de formato bidireccional), así que tienen
su propio cuadro dedicado:
1. En la página de Amazon, selecciona **solo** la tabla "Información técnica" o
   "Detalles del producto" y cópiala.
2. Pégala en el segundo cuadro ("Tabla de especificaciones") y pulsa
   "🪄 Detectar especificaciones".
3. El parser reconoce varios formatos habituales: "Clave: Valor" en la misma línea, tablas
   copiadas con tabulador, o la clave y el valor en dos líneas seguidas.

En ambos casos: revisa los campos rellenados (la detección es orientativa, no siempre
acierta al 100%) y añade a mano la **imagen** (URL de la foto) y tu **link de afiliado**,
que nunca se autorrellenan.

Si en el futuro tu cuenta de Afiliado consigue ventas cualificadas, existe una vía 100%
automática y permitida: la API oficial de Amazon (Product Advertising API), que requeriría
añadir un pequeño servidor/función serverless para consultar los datos sin exponer las
claves de la API en el navegador. Dímelo cuando llegue ese momento y lo montamos.

### ☁️ Guardar cambios directamente en GitHub (sin descargar/subir el JSON a mano)

Si tu web está en un repositorio de GitHub (como este), puedes saltarte el paso de
descargar `products.json` y sustituirlo a mano: el panel puede subir el archivo
actualizado directamente a tu repositorio con un clic.

**Configuración (una sola vez):**
1. Entra en GitHub → tu foto de perfil (arriba a la derecha) → **Settings**.
2. En el menú de la izquierda, baja hasta **Developer settings** → **Personal access
   tokens** → **Fine-grained tokens** → **Generate new token**.
3. Ponle un nombre (ej. "WitchOne admin"), y en **Repository access** elige
   **Only select repositories** → selecciona tu repositorio `WitchOne`.
4. En **Permissions → Repository permissions**, busca **Contents** y ponlo en
   **Read and write**. El resto de permisos déjalos como están (sin acceso).
5. Genera el token y cópialo (solo se muestra una vez).
6. En `admin.html`, en el bloque "☁️ Guardar cambios directamente en GitHub":
   - **Repositorio**: `polferre1/WitchOne`
   - **Rama**: la misma que tengas seleccionada en GitHub Pages (Settings → Pages).
   - **Token**: pega el token que acabas de generar.

**Uso normal:** después de crear/editar/borrar productos, pulsa **"☁️ Guardar en
GitHub"**. Sube el `products.json` actualizado directamente al repositorio y la web se
actualiza sola en 1-2 minutos (GitHub Pages se reconstruye automáticamente).

**Importante sobre seguridad:**
- El token se guarda **solo en este navegador** (localStorage) y las peticiones van
  directas de tu navegador a `api.github.com`; no pasan por ningún servidor nuestro.
- Usa siempre un **fine-grained token** limitado a este único repositorio con permiso
  solo de `Contents`, nunca un token clásico con acceso a toda tu cuenta.
- No uses esta opción desde un ordenador/navegador compartido o público. Si lo haces,
  pulsa "Olvidar token guardado" al terminar.
- Si el token se filtrara, revócalo desde GitHub → Settings → Developer settings →
  Personal access tokens, y genera uno nuevo.

La opción de **"⬇ Descargar products.json"** sigue disponible como alternativa manual si
prefieres no usar un token de GitHub.

**Botones extra del panel:**
- **"📂 Importar JSON"**: carga un `products.json` desde tu ordenador al
  borrador de trabajo (útil si quieres retomar un archivo ya publicado).
- **"↺ Recargar desde archivo"**: descarta el borrador actual y vuelve a leer
  `data/products.json` tal y como está en el proyecto (por si quieres empezar
  de cero o deshacer cambios no publicados).

## 🎨 Paleta de colores

Definida en `css/variables.css` — cámbiala ahí si quieres ajustar el estilo:

| Uso | Hex |
|---|---|
| Fondo principal | `#12081F` |
| Fondo de tarjetas | `#1E1033` |
| Primario (marca) | `#7C3AED` |
| Acento (CTA Amazon / estrellas) | `#F5B841` |
| Texto principal | `#F5F3FA` |

## ⚖️ Aviso de afiliación

El footer de todas las páginas incluye el aviso obligatorio del Programa de
Afiliados de Amazon. Revísalo y ajústalo a tu situación concreta si es
necesario (país, nombre de la web, etc.) — está en el bloque
`.affiliate-disclosure` dentro de cada archivo `.html`.
