# ADR-013: El frontend como SPA React + Vite en su propia imagen

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

El usuario pidió React + TypeScript. La app es para el celular apoyado en la mesada:
cronómetros que corren en el navegador, alarmas sonoras y visuales, y un diseño ya
aprobado (`docs/mockups/app-cocina-mockup.html`). Todo el estado de la cocinada en curso vive
en el cliente; el servidor solo recibe el resultado al final. Hay que decidir cómo se
construye y cómo se sirve.

Medido en este esqueleto (`docker images`):

| Imagen | Tamaño |
|---|---|
| `templa-frontend` (Caddy + archivos estáticos) | **88,7 MB** |
| `node:22-alpine` (solo la base, sin la app) | 232 MB |
| `templa-usuarios` (Node + dependencias) | 273 MB |

## Opciones consideradas

### 1. Next.js con renderizado en el servidor

Parecía la opción «completa». No lo es acá: la app no tiene páginas que indexar ni
contenido que convenga renderizar en el servidor (todo es interacción con cronómetros),
y el servidor de Next es un proceso Node de 230 MB o más corriendo en la VM para servir lo
que unos archivos estáticos sirven igual.

### 2. Create React App / Webpack

Herramientas en mantenimiento mínimo; CRA está deprecado. Se descartó.

### 3. Servir la SPA desde el reverse proxy del sistema

Copiar `dist/` a un volumen que Caddy monta. Ahorra un contenedor. Se descartó porque
rompe el despliegue por SHA (ADR-011): el proxy y la SPA tendrían versiones distintas y
la reversión no revertiría el frontend.

### 4. SPA con Vite, compilada en el build y servida por un Caddy propio como archivos estáticos

Vite para desarrollo con recarga y para el build; la imagen final es `caddy:2-alpine` con
`dist/` en `/srv`, sin Node. Vitest, el mismo corredor que los servicios (ADR-010).

## Decisión

Opción 4. `microservices/frontend` es un proyecto autocontenido con su Dockerfile
multi-etapa (Node para compilar, Caddy para servir). En desarrollo, `pnpm dev` levanta
Vite en 5173 con las llamadas a `/api/<servicio>/` reenviadas a los puertos que publica
el compose, con el mismo prefijo que quita el proxy en producción, así el código es
idéntico en los dos casos. El Caddy del frontend escucha 8080 sin TLS y devuelve
`index.html` para cualquier ruta que no sea un archivo (SPA); el TLS lo termina el proxy
del sistema (ADR-009).

El sistema de diseño (tokens de color, tipografías, componentes) se toma del mockup
aprobado. Las tipografías (Bricolage Grotesque e Instrument Sans) se cargan de Google Fonts;
cuando la app sea instalable sin conexión, pasan a `public/`.

## Consecuencias

### Positivas

- La imagen del frontend pesa 88,7 MB, menos que la base de Node sola.
- Frontend versionado por SHA con el resto; la reversión lo incluye.
- Sin proceso Node en producción para el frontend: menos memoria (techo 128 MB).

### Negativas

- Sin renderizado en el servidor: la primera carga trae todo el JavaScript. Para una app
  que se abre una vez y se usa veinte minutos, es aceptable.
- Dos Caddy en el compose (el proxy y el del frontend). Es deliberado (opción 3).
- Las rutas del navegador tienen que resolverse en la SPA; un enlace directo a
  `/receta/x` funciona porque Caddy devuelve `index.html`, pero un 404 real se decide en
  el cliente.

### Lo que no cambia

El proxy enruta `/` al frontend y `/api/<servicio>/` a cada servicio; la SPA nunca
conoce los puertos internos.

## Cuándo revisar esta decisión

- Si hace falta compartir recetas por enlace con vista previa (Open Graph) o indexarlas:
  renderizado en el servidor para esas páginas.
- Si la app pasa a ser instalable (PWA) con funcionamiento sin conexión: sigue siendo
  una SPA; se agrega un service worker, no cambia esta decisión.

## Referencias

- [ADR-009](ADR-009-caddy-reverse-proxy-y-tls.md), [ADR-010](ADR-010-pnpm-vitest-y-stryker.md), [ADR-011](ADR-011-despliegue-en-vm-oracle-con-imagenes-por-sha.md).
- `docs/mockups/app-cocina-mockup.html`.
