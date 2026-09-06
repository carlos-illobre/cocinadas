# Cocinadas · la aplicación

Todo el código del proyecto: la SPA (React 19 + TypeScript, Vite, Vitest) y el generador
del catálogo. El porqué de que esté todo acá está en
[ADR-015](../docs/adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md) y
[ADR-017](../docs/adr/ADR-017-sitio-estatico-en-github-pages.md).

Cómo levantarla y probarla: ver el [README de la raíz](../README.md) y
[docs/TESTING.md](../docs/TESTING.md).

## Rutas relativas, siempre

`vite.config.ts` tiene `base: './'` y **toda ruta del código es relativa**
(`icono-512.png`, `inicio/1.jpg`, `api/catalogo`). GitHub Pages sirve el sitio en `/<repo>/` y
no en la raíz, así que una ruta absoluta da 404 solo en producción. El CI lo comprueba
sobre el `index.html` compilado.

## El generador del catálogo (`src/catalogo/`)

Corre en Node antes de `vite build` (`pnpm generar:catalogo`), lee `data/` del repositorio
—por una ruta relativa a su propio archivo, así que mover la carpeta la rompe— y escribe
`public/api/catalogo/`. Está partido en dos a propósito: `catalogo.ts` es puro y
devuelve el plan de qué archivos hay que escribir —se mide al 100 % como todo lo demás—, y
`generar.ts` solo escribe ese plan a disco, por eso es lo único excluido de la cobertura
además de `main.tsx`.

Vive en `src/` y no en una carpeta de herramientas justamente para que la compuerta de
cobertura lo alcance sin configuración aparte.

## Archivos estáticos (`public/`)

Lo que está acá se copia tal cual a la raíz del sitio al compilar. Vite no los procesa ni
les agrega hash: cambiar uno obliga a publicar de nuevo. El `Cache-Control` lo decide
GitHub Pages; no se puede configurar.

`public/api/catalogo/` no se versiona: lo genera el build desde `data/`.

## La identidad visual

Todos derivan de la imagen original que entregó Carlos el 2026-09-05 (la olla naranja
con reloj y la palabra Cocinadas en degradé naranja a verde), recortada, sin la etiqueta
"Made with AI" y con fondo transparente.

**La palabra «Cocinadas» ya no es una imagen**: se escribe con la tipografía Lobster —la
del logo original— y el degradado naranja a verde, en `src/Logotipo.tsx`. Los dos PNG que
la traían dibujada (`logo.png` y `marca.png`) se borraron porque seguían diciendo
«Templa»: renombrar el proyecto no renombra un archivo binario, y por eso el nombre viejo
sobrevivió al renombre y se siguió mostrando en la pantalla de inicio.

Lo que queda son las imágenes **sin texto adentro**, que no envejecen:

| Archivo | Qué es | Tamaño | Dónde se usa |
|---|---|---|---|
| `icono-512.png` | Solo la olla, lienzo cuadrado | 512 × 512 | La olla de la marca (`src/Logotipo.tsx`), y el ícono de instalación (PWA) cuando exista el manifest |
| `icono-192.png` | Ídem | 192 × 192 | `apple-touch-icon` en `index.html` |
| `favicon.png` | Ídem | 64 × 64 | Favicon en `index.html` |
| `inicio.jpg` | La foto de la mesada (brócoli, albahaca, limón, ajo, spaghetti sobre pizarra) que entregó Carlos como capa de fondo de la pantalla de inicio, sin la etiqueta "Made with AI" (se recortó la franja superior donde estaba) y comprimida a JPEG | 1024 × 1436 | Fondo de `src/Inicio.tsx`, con `object-fit: cover` y un velo radial oscuro en el centro para que el logo y el lema se lean |

Para regenerar la olla desde otro original: se recorta a la izquierda de la palabra —en el
logo original, la columna con menos píxeles opacos entre las dos partes— y se centra en un
lienzo cuadrado antes de reducirla.

El concepto de pantalla de bienvenida que acompañó al logo (fondo negro con verduras y
el lema «Tu receta, al punto justo») está en `docs/mockups/bienvenida-concepto.png`: es
referencia de diseño, no se sirve desde acá.
