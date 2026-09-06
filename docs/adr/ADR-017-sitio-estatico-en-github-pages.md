# ADR-017: Sitio estático en GitHub Pages, sin servidor propio

**Estado:** Aceptado
**Fecha:** 2026-09-06

---

## Contexto

El ADR-015 dejó la aplicación como un solo contenedor que sirve archivos, y el ADR-016
sacó el TLS a un proxy aparte de la máquina. Al ir a probar el despliegue automático a la
VM de Oracle, la pregunta que ordenó todo fue otra: **si lo que hay que servir son
archivos estáticos, ¿para qué una máquina?**

Lo que quedaba en el repositorio para poder correrlo en un servidor:

| | Líneas |
|---|---|
| `deployment/` (deploy.py, preflight, plantillas) | 602 |
| `tests/integration/` y `itest.sh` | 289 |
| `docker-compose.yml` | 139 |
| `infrastructure/` (el proxy) | 82 |
| `Dockerfile` y `.dockerignore` | 72 |
| **Total** | **~1.184** |

Más 106 líneas de CI (los jobs `imagen` y `desplegar`, la comprobación del compose y la
verificación de los scripts de despliegue).

Todo eso para servir un `index.html`, un bundle de JavaScript y unas fotos.

El backend multiusuario sigue estando en el plan de Carlos, pero a meses de distancia, y
la prioridad declarada es que **el front esté listo y usable**.

## Opciones consideradas

### 1. Seguir con Oracle, que ya estaba armado y probado

Tiene un argumento real y no es el costo hundido: la instancia Always Free **se pierde si
queda ociosa**, y conseguir una Ampere A1 nueva suele fallar por falta de capacidad. Si
algo tiene que correr ahí para mantenerla viva, que sea esto.

Se descartó porque Carlos decidió no depender de esa máquina. Y el argumento se da vuelta:
mantener una VM parcheada para servir archivos estáticos es trabajo recurrente a cambio de
nada que Pages no dé.

### 2. Front en Pages y, cuando llegue, la API en Oracle

Parecía lo mejor de los dos mundos y **no lo es**, por una razón que no se ve hasta que
estás adentro: separa los orígenes. Con la página en `github.io` y la API en otro dominio,
la sesión no puede ir en una cookie `HttpOnly` normal —haría falta `SameSite=None`, que
Safari bloquea por omisión, y la app es solo para celular—, así que el token termina en
`localStorage`, expuesto a cualquier XSS. Además aparecen CORS y hay que abrir la CSP.

Es una arquitectura defendible —el dato en juego son tiempos de cocina, no pagos— pero es
una decisión que **no hace falta tomar hoy**, porque hoy no hay ni login ni API.

### 3. Un CDN delante de un dominio propio

Cloudflare gratis por delante, `/api/*` pasando a un servidor: da velocidad de CDN y un
solo origen, sin CORS ni cookies de tercera parte. Es la respuesta correcta **el día que
haya API y se quiera velocidad**. Hoy no hay API, y requiere comprar un dominio.

### 4. GitHub Pages, sin servidor de ningún tipo

Es la opción elegida.

## Decisión

El sitio se publica en **GitHub Pages** en cada merge a `main`, con el dominio que da
GitHub: <https://carlos-illobre.github.io/cocinadas/>. Sin Oracle, sin Docker, sin
DuckDNS, sin proxy.

- `microservices/frontend/` pasa a **`web/`**: ya no hay ningún microservicio del que
  distinguirlo.
- Se borran `deployment/`, `infrastructure/`, `docker-compose.yml`, `.dockerignore`, el
  `Dockerfile`, el `Caddyfile` de la aplicación, `tests/integration/`, `itest.sh` y el
  mutation testing.
- El CI queda en tres jobs: `pruebas`, `vulnerabilidades` y `publicar`.
- **Rutas relativas en todo** (`base: './'` en `vite.config.ts`). Pages sirve el sitio de
  un repositorio en `/<repo>/` y no en la raíz, así que una ruta absoluta apuntaría al
  dominio. Con rutas relativas el mismo bundle sirve igual en una subcarpeta, en la raíz
  de un dominio propio o abierto desde el disco, y **el nombre del repositorio no aparece
  en ningún lado**.

Este ADR supera a [ADR-011](ADR-011-despliegue-en-vm-oracle-con-imagenes-por-sha.md) y
[ADR-016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md), y enmienda a
[ADR-001](ADR-001-compose-unico-y-env-como-fuente-de-verdad.md),
[ADR-009](ADR-009-caddy-reverse-proxy-y-tls.md),
[ADR-010](ADR-010-pnpm-vitest-y-stryker.md),
[ADR-014](ADR-014-endurecimiento-antes-de-publicar.md) y
[ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md).

## Consecuencias

### Positivas

- **Se borran ~1.184 líneas de infraestructura** y el CI baja de 221 a 115 líneas.
- No hay servidor que parchear, ni certificados que renovar, ni disco que se llene, ni
  instancia que se pueda perder.
- Pages sirve por CDN: la primera carga desde un celular llega desde un borde cercano y no
  desde una sola máquina en una sola región.
- El desarrollo local se simplifica: `pnpm dev` era el bucle real de trabajo y ahora es el
  único.
- Costo cero y sin cuenta de nube que administrar.

### Negativas

- **Se pierden las cabeceras HTTP.** Pages no deja configurarlas, así que se van la CSP,
  `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` y HSTS, que estaban en
  el Caddyfile. La CSP se puede recuperar con `<meta http-equiv>` en el `index.html` —sin
  `frame-ancestors`, que en meta se ignora—; `Permissions-Policy` y HSTS quedan en manos
  de GitHub. **Está pendiente** (ver docs/SECURITY.md).
- Ya no se puede correr en local el artefacto exacto de producción. Lo más cercano es
  `pnpm build && pnpm preview`, que se parece pero no es idéntico.
- No se puede afinar el `Cache-Control`: los assets llevan hash en el nombre y podrían
  cachearse para siempre, pero manda lo que ponga Pages.
- El repositorio tiene que ser público para que Pages sea gratis. Lo es.
- El día que haya backend hay que traer de vuelta un servidor, y decidir entre los
  escenarios 2 y 3 de arriba.

### Lo que no cambia

El catálogo se sigue generando en el build leyendo `data/` y viaja dentro de lo que se
publica (ADR-006), así que la versión del catálogo es la del commit publicado. La
compuerta del 100 % sigue en pie (ADR-010, sin la parte de Stryker). El prefijo `api/` en
las URL se conserva, y `historial/almacen.ts` sigue guardando las cocinadas detrás de un
`Almacen` inyectable: las dos cosas que dejan volver a un backend sin tocar las pantallas.

## Lo que hay que saber para volver atrás

Nada de lo borrado se perdió: está en la historia de git, y cada pieza tiene su ADR
explicando el porqué. Rehacerlo es leer el ADR-015 y el ADR-016 y recuperar cinco archivos.

Lo que **no** se recupera leyendo un ADR es la instancia de Oracle: si se pierde por
inactividad, conseguir otra Ampere A1 depende de que haya capacidad.

## Cuándo revisar esta decisión

- **Cuando llegue el login y el historial en la nube.** Ahí hay que elegir entre el
  escenario 2 (orígenes separados, token en `localStorage`) y el 3 (CDN delante de un
  dominio propio, un solo origen). El 3 es mejor y cuesta un dominio.
- Si hacen falta cabeceras que `<meta>` no cubre —HSTS propio, `frame-ancestors`,
  `Permissions-Policy`—, Pages deja de alcanzar.
- Si el catálogo crece tanto que bajarlo entero con la app deja de ser razonable en una
  conexión de celular. La señal es el peso del bundle, no la cantidad de recetas.

## Referencias

- [ADR-006](ADR-006-catalogo-desde-el-repositorio-en-la-imagen.md),
  [ADR-013](ADR-013-frontend-spa-react-vite.md),
  [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md).
- [DEPLOYMENT.md](../DEPLOYMENT.md).
