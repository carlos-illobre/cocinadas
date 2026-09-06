# ADR-009: Caddy como reverse proxy con TLS automático

**Estado:** Aceptado, enmendado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md) , [ADR-016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md) y [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)
**Fecha:** 2026-09-05

---

## Contexto

Hay un dominio (`templa.duckdns.org`) y hace falta HTTPS: la app recibe credenciales
y usa APIs del navegador (notificaciones, audio para las alarmas) que exigen contexto
seguro. Un solo punto de entrada tiene que servir la SPA en `/` y enrutar
`/api/<servicio>/` a cada microservicio. Los certificados de Let's Encrypt duran 90 días
y la renovación tiene que ser automática **y** el proxy tiene que recargar después de
renovar; es el punto que la skill de despliegue en Oracle marca como el que se olvida.

Tamaños de imagen medidos (`docker images`):

| Imagen | Tamaño |
|---|---|
| `caddy:2-alpine` | 88,7 MB |
| `nginx:alpine` | 103 MB |
| `nginx:1.27-alpine` | 74,5 MB |

El tamaño no decide: son comparables. Decide la operación del TLS.

## Opciones consideradas

### 1. nginx + certbot

El clásico. Se descartó porque la renovación hay que orquestarla: un cron o un contenedor
aparte que corra certbot, más un `nginx -s reload` después, más el desafío HTTP-01
servido desde una ruta que nginx tiene que conocer. Tres piezas que fallan por separado y
cuyo fallo se descubre 90 días después.

### 2. Traefik

Descubre los servicios por etiquetas de Docker y emite certificados solo. Parecía la
opción más «moderna». Para cuatro backends fijos, el descubrimiento dinámico no aporta y
la configuración (proveedores, entrypoints, routers, middlewares en etiquetas) es varias
veces más larga que un Caddyfile de veinte líneas.

### 3. Caddy 2

Emite y renueva el certificado solo (ACME HTTP-01 y TLS-ALPN-01), recarga la
configuración sin reiniciar, y sirve HTTP/2 y HTTP/3 de fábrica. Con `SITE_ADDRESS` en
`http://localhost` no hace TLS (desarrollo); con el dominio a secas, lo hace todo.

## Decisión

Caddy 2 (`caddy:2-alpine`) como `reverse-proxy` en el compose, único contenedor que
publica puertos hacia afuera (80, 443 TCP y UDP). `infrastructure/reverse-proxy/Caddyfile`
enruta con `handle_path`, que quita el prefijo `/api/<servicio>` antes de reenviar: los
servicios no saben bajo qué ruta están publicados. Los certificados viven en el volumen
`caddy-datos`. La dirección del sitio sale de `SITE_ADDRESS` en el `.env` (ADR-001).

El frontend usa también Caddy, en modo file server sin TLS (ADR-013).

## Consecuencias

### Positivas

- TLS que se emite y renueva sin cron, sin contenedor extra y sin recarga a mano.
- Un Caddyfile corto que se lee entero.
- HTTP/3 sin configuración.

### Negativas

- La emisión necesita el puerto 80 abierto en la Security List de la VCN y el DNS ya
  propagado; emitir antes de tiempo quema uno de los pocos intentos por hora que
  Let's Encrypt permite.
- Menos conocido que nginx: menos gente cerca que sepa depurarlo.
- El volumen `caddy-datos` hay que respaldarlo; perderlo obliga a reemitir, con los
  límites de intentos de Let's Encrypt.

### Lo que no cambia

Los servicios escuchan HTTP plano en la red interna del compose; el TLS termina en el
proxy.

## Cuándo revisar esta decisión

- Si hace falta un balanceador entre varias VM: ahí el balanceador de red de Oracle (el
  de capa 4, sin el tope de 10 Mbps del de capa 7) toma el puerto 443 y Caddy queda detrás
  o desaparece.
- Si aparecen decenas de backends dinámicos: Traefik.

## Referencias

- `.claude/skills/desplegar-en-oracle-cloud/referencias/operacion.md`, «El dominio y el certificado».
- [ADR-013](ADR-013-frontend-spa-react-vite.md).

---

## Enmienda (2026-09-06): [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)

Caddy sigue siendo la elección, y ahora es lo único que corre. Los dos Caddy que había —el
del sistema, que terminaba el TLS y enrutaba `/api/<servicio>/`, y el del frontend, que
servía los archivos— se fundieron en uno: sin servicios detrás, el primero solo le pasaba
las peticiones al segundo. El Caddyfile pasó a viajar dentro de la imagen, así que la
configuración del servidor cambia con el mismo SHA que el código.

---

## Enmienda (2026-09-06): [ADR-016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md)

Caddy sigue siendo la elección, pero se parte en dos. El TLS y el reparto por dominio
dejan de ser parte de la aplicación y pasan a un proxy de la MÁQUINA, en
`infrastructure/proxy/`, que es optativo y se prende desde el `.env`: en esa VM corre más
de una aplicación y el 80 y el 443 son de una sola. La aplicación queda como inquilina,
escuchando en `:80` sin saber por qué dominio la llamaron, y conserva lo suyo —cabeceras
de seguridad, política de contenido, ruteo de la SPA y caché— dentro de su imagen.

---

## Enmienda (2026-09-06): [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

Caddy sale del proyecto: el sitio lo sirve GitHub Pages, con su TLS. Con él se van las
cabeceras de seguridad y la CSP que vivían en el Caddyfile, porque Pages no deja definir
cabeceras — queda pendiente recuperar la CSP con `<meta http-equiv>` (docs/SECURITY.md).
Es la contrapartida concreta de no tener servidor propio.
