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

## Las imágenes: originales en un lado, versiones chicas en otro

Los **originales** viven en `data/` (ingredientes, utensilios, fotos de recetas) y en
`data/inicio-capas/` (las capas de la pantalla de inicio). Ahí pueden pesar lo que
haga falta: una foto de ingrediente de 2000 × 2000 está bien como fuente.

Las **versiones que se publican** están en `assets/`, en WebP y al tamaño al que se
muestran. Se versionan, y se regeneran con:

```bash
pnpm optimizar          # las que falten o hayan cambiado
pnpm optimizar --todas  # rehace todas
```

`src/imagenes/plan.ts` decide qué se convierte, a qué ancho y con qué nombre —y se mide al
100 %—; `src/imagenes/optimizar.ts` maneja el navegador que convierte. Se usa el canvas de
Chrome y no una librería para no agregar una dependencia por un comando que se corre a
mano cada tanto.

Si una receta usa una foto que todavía no tiene versión chica, **el build corta** y dice
cuál falta: publicar una receta sin sus fotos es peor que no publicar.

Los anchos salen de a qué tamaño se muestra cada cosa en el CSS: 128 px para ingredientes
y utensilios (se ven a 38–52), 860 para la foto del plato (ocupa los 430 de ancho de la
app, a 2×) y 1000 para las capas de inicio. Nunca se agranda.

## Instalable en el teléfono (`manifest.webmanifest`)

Con el manifest, agregar la app a la pantalla de inicio la abre **sin la barra del
navegador** (`"display": "standalone"`). Todas sus rutas son relativas, así que resuelve
igual bajo `/cocinadas/` en GitHub Pages que en la raíz de un dominio propio.

Además del manifest hacen falta cuatro `meta` en el `index.html`: iOS no leyó el manifest
hasta la 16.4 y todavía usa las `apple-*` para el nombre del ícono y la barra de estado.
`black-translucent` está elegido a propósito: deja que la foto de la mesada llegue hasta
arriba de todo, que es lo que el diseño espera con `viewport-fit=cover` y los
`env(safe-area-inset-*)` del CSS.

**Pendiente**: un ícono con `purpose: "maskable"`. Sin él, Android recorta el ícono a la
forma del sistema —círculo o cuadrado redondeado— y se come las asas de la olla y las
hojas. Hay que generar una variante con la olla al 60 % centrada sobre un fondo sólido.

## Archivos estáticos (`public/`)

Lo que está acá se copia tal cual a la raíz del sitio al compilar. Vite no los procesa ni
les agrega hash: cambiar uno obliga a publicar de nuevo. El `Cache-Control` lo decide
GitHub Pages; no se puede configurar.

`public/api/catalogo/` y `public/inicio/` no se versionan: los genera el build a partir de
`data/` y de `assets/`.

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
| `icono-512.png` | Solo la olla, lienzo cuadrado | 512 × 512 | El ícono grande del `manifest.webmanifest`: es el que usa Android para la pantalla de arranque al abrir la app instalada. |
| `icono-192.png` | Ídem | 192 × 192 | La olla de la marca (`src/Logotipo.tsx`) y el `apple-touch-icon` de `index.html`. Se muestra a unos 88 px: 192 cubre pantallas del doble de densidad, y la de 512 pesaría 238 KB en vez de 42 |
| `favicon.png` | Ídem | 64 × 64 | Favicon en `index.html` |
| `inicio.jpg` | La foto de la mesada (brócoli, albahaca, limón, ajo, spaghetti sobre pizarra) que entregó Carlos como capa de fondo de la pantalla de inicio, sin la etiqueta "Made with AI" (se recortó la franja superior donde estaba) y comprimida a JPEG | 1024 × 1436 | Fondo de `src/Inicio.tsx`, con `object-fit: cover` y un velo radial oscuro en el centro para que el logo y el lema se lean |

Para regenerar la olla desde otro original: se recorta a la izquierda de la palabra —en el
logo original, la columna con menos píxeles opacos entre las dos partes— y se centra en un
lienzo cuadrado antes de reducirla.

