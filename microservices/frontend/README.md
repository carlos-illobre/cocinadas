# Frontend de Templa

La SPA (React 19 + TypeScript, Vite, Vitest). Cómo levantarla y probarla: ver el README de la raíz y `docs/TESTING.md`.

## Archivos estáticos (`public/`)

Lo que está acá se copia tal cual a la raíz del sitio al compilar. Vite no los procesa ni
les agrega hash: cambiar uno obliga a un despliegue nuevo, y el Caddy del frontend los
sirve con `Cache-Control: no-cache` salvo lo que esté bajo `/assets/`.

## La identidad visual

Todos derivan de la imagen original que entregó Carlos el 2026-09-05 (la olla naranja
con reloj y la palabra Templa en degradé naranja a verde), recortada, sin la etiqueta
"Made with AI" y con fondo transparente.

| Archivo | Qué es | Tamaño | Dónde se usa |
|---|---|---|---|
| `logo.png` | Ícono + palabra, completo | 978 × 325 | Cabecera de la app (`src/App.tsx`) y portada de la documentación (`docs/logo.png`) |
| `marca.png` | Solo la palabra Templa | 642 × 243 | Reservado para cabeceras angostas o fondos oscuros |
| `icono-512.png` | Solo la olla, lienzo cuadrado | 512 × 512 | Ícono de instalación (PWA) cuando exista el manifest |
| `icono-192.png` | Ídem | 192 × 192 | `apple-touch-icon` en `index.html` y `docs/icono-192.png` |
| `favicon.png` | Ídem | 64 × 64 | Favicon en `index.html` |
| `inicio.jpg` | La foto de la mesada (brócoli, albahaca, limón, ajo, spaghetti sobre pizarra) que entregó Carlos como capa de fondo de la pantalla de inicio, sin la etiqueta "Made with AI" (se recortó la franja superior donde estaba) y comprimida a JPEG | 1024 × 1436 | Fondo de `src/Inicio.tsx`, con `object-fit: cover` y un velo radial oscuro en el centro para que el logo y el lema se lean |

Para regenerarlos desde otro original: el corte entre la olla y la palabra se hace en la
columna con menos píxeles opacos entre ambos (se midió: columna 344 del logo recortado),
y la olla se centra en un lienzo cuadrado antes de reducirla.

El concepto de pantalla de bienvenida que acompañó al logo (fondo negro con verduras y
el lema «Tu receta, al punto justo») está en `docs/mockups/bienvenida-concepto.png`: es
referencia de diseño, no se sirve desde acá.
