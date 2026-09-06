# ADR-015: De cuatro servicios a una sola SPA estática

**Estado:** Aceptado, enmendado por [ADR-016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md) y [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)
**Fecha:** 2026-09-06

---

## Contexto

El proyecto se armó como microservicios (ADR-002) para un dominio que se dividía en tres:
catálogo, usuarios y cocinadas. Un año de código después, lo que hay escrito es esto:

- `usuarios` y `cocinadas` **no tenían ninguna ruta más que `/health`**. Sus dos `app.ts`
  eran idénticos byte por byte: Fastify, límite de peticiones y `/health`. Ni una tabla,
  ni un esquema SQL, ni un JWT emitido, ni un handler.
- **PostgreSQL** no lo leía ni lo escribía nadie. `infra/db.ts` hacía un `select 1` al
  arrancar para que una `DATABASE_URL` mal puesta cortara el arranque, y nada más.
- **NATS** no publicaba ni consumía nada. `infra/nats.ts` se conectaba «aunque el servicio
  todavía no publique nada», y `contratos/eventos/` no lo usaba ningún servicio.
- `catalogo` sí servía datos reales, pero de solo lectura y empaquetados en su imagen
  (ADR-006): la respuesta de cada endpoint era una constante del commit desplegado.
- Toda la funcionalidad —cocina, gantt, cronómetros, alarmas, mise en place, experiencia,
  logros, historial— estaba en el frontend, y el estado en el `localStorage` del teléfono.

Seis contenedores para servir una SPA y un puñado de JSON que no cambian entre peticiones.
Cada uno con su techo de memoria, su healthcheck, su imagen que construir y publicar, y su
lugar en la cadena de arranque.

Carlos planteó que el proyecto va a ser chico y que la separación no se está pagando. La
pregunta que decidía todo era si el historial de cocinadas va a salir alguna vez del
celular; la respuesta fue «algún día, pero no ahora».

## Opciones consideradas

### 1. Dejarlo como está y llenar los servicios vacíos

Lo que decía el plan original. Se descartó porque los servicios vacíos no adelantan nada:
el día que haya que escribir el registro de usuarios y el de cocinadas, hay que escribirlo
entero igual. Lo único que aportan mientras tanto es costo de operación y ruido en cada
lectura del repositorio.

### 2. Fusionar todo en un monolito Node con PostgreSQL

Parecía la simplificación obvia: un servicio en vez de tres, una base en vez de ninguna
que se use. No lo es. Mientras no haya un solo dato del lado del servidor, un proceso Node
y una base son dos piezas que hay que operar, respaldar y actualizar para no guardar nada.
La simplificación de verdad no es «menos servicios», es **ningún servicio**.

### 3. Un servicio solo para el catálogo, y el resto estático

Deja tres contenedores (proxy, SPA, catálogo) y mantiene la API viva por si vuelve un
backend. Se descartó porque el catálogo ya era inmutable por despliegue: su contenido lo
fija el commit, no la petición. Servir un archivo que nunca cambia con un proceso que lo
tiene cargado en memoria es un proceso de más.

### 4. Una sola SPA estática, con el catálogo generado en el build

Es la opción elegida.

## Decisión

**Un solo contenedor:** Caddy sirviendo archivos, que además termina el TLS. Sin Node en
producción, sin PostgreSQL, sin NATS, sin proxy interno.

El catálogo pasa de servicio a paso del build: `src/catalogo/catalogo.ts` lee `data/` y
devuelve el plan de qué archivos escribir; `src/catalogo/generar.ts` los escribe en
`public/api/catalogo/` antes de `vite build` y Vite los copia al bundle. Es la misma
lógica que tenía el servicio, corriendo una vez por despliegue en vez de una vez por
arranque.

Dos consecuencias de forma que salen de eso:

- Las **fotos son archivos con su extensión** (`/fotos/ingredientes/<id>.jpg`) y el
  `Content-Type` lo pone Caddy. Solo se copian las que alguna receta referencia: el bundle
  se baja entero al celular, así que una foto que ninguna receta usa es peso que nadie
  mira.
- El **Dockerfile de la aplicación se construye desde la raíz** del repositorio, porque el
  build necesita `data/`. Es la excepción a que cada imagen se construya desde su propia
  carpeta, y es la misma excepción que ya tenía `catalogo` por ADR-006.

Se conserva el prefijo `/api/catalogo/` en las URL aunque no haya ninguna API detrás. No
es nostalgia: es la puerta por la que vuelve un backend sin tocar el frontend.

Este ADR supera a [ADR-002](ADR-002-tres-microservicios.md),
[ADR-003](ADR-003-eventos-con-nats-jetstream.md),
[ADR-004](ADR-004-mensajes-json-con-esquema-versionado.md),
[ADR-005](ADR-005-postgresql-para-usuarios-y-cocinadas.md),
[ADR-007](ADR-007-fastify.md), [ADR-008](ADR-008-drizzle-orm.md) y
[ADR-012](ADR-012-autorizacion-con-jwt.md), y enmienda a
[ADR-006](ADR-006-catalogo-desde-el-repositorio-en-la-imagen.md),
[ADR-009](ADR-009-caddy-reverse-proxy-y-tls.md),
[ADR-011](ADR-011-despliegue-en-vm-oracle-con-imagenes-por-sha.md),
[ADR-013](ADR-013-frontend-spa-react-vite.md) y
[ADR-014](ADR-014-endurecimiento-antes-de-publicar.md).

## Consecuencias

### Positivas

- **En el servidor no queda nada que respaldar.** Los datos viven en el teléfono de quien
  cocina; el único volumen que sobrevive guarda certificados, que se vuelven a emitir
  solos. `respaldo.sh` se borró porque no tenía qué copiar.
- La superficie de ataque se reduce a un file server: no hay base con credenciales, ni
  broker, ni proceso que interprete un cuerpo de petición.
- El techo de memoria del stack baja de 1792 MB a 128 MB, y el arranque deja de tener
  cadena de dependencias.
- Una imagen en vez de cuatro: el CI construye y publica una sola vez, y `docker compose
  ps` tiene una línea.
- La configuración del servidor viaja dentro de la imagen: el Caddyfile cambia con el
  mismo SHA que el código, y el despliegue dejó de copiarlo aparte.

### Negativas

- **El catálogo se baja entero con la aplicación.** Hoy son unos 3,6 MB de fotos; con
  veinte recetas más eso crece y va a haber que servir las fotos aparte o encogerlas. Es
  el precio de no tener quién las sirva bajo demanda.
- El límite de peticiones por IP se fue con Fastify. Para archivos estáticos servidos por
  Caddy no hace falta, pero el día que haya un endpoint que escriba, vuelve a hacer falta.
- Agregar una receta obliga a **reconstruir y redesplegar la imagen**. Ya era así por
  ADR-006, pero ahora no hay ninguna alternativa a mano.
- Se perdió el aislamiento entre partes: un error en el build del catálogo rompe el build
  de la aplicación entera.

### Lo que no cambia

El frontend ve las mismas URL bajo `/api/catalogo/`, con `.json` al final. El catálogo
sigue siendo el del commit desplegado, así que revertir un despliegue revierte también las
recetas (ADR-006). El `.env` sigue siendo la única fuente de lo que cambia entre ambientes
(ADR-001), y la compuerta del 100 % sigue aplicando: la lógica del catálogo se mide igual
que antes, ahora dentro del único proyecto.

## El camino de vuelta

El día que las cocinadas tengan que salir del celular —cuenta de usuario, ver el historial
desde otro teléfono, no perder todo si se borran los datos del navegador— hay que traer un
backend. Lo que este ADR deja preparado:

1. **El prefijo `/api/` ya existe** y el frontend ya pide por ahí. Agregar un servicio es
   agregar un `handle_path /api/<servicio>/*` con su `reverse_proxy` al Caddyfile, y un
   servicio más al compose. El resto del Caddyfile no se toca.
2. **El almacén ya está detrás de una interfaz.** `historial/almacen.ts` expone
   `listarCocinadas` y `guardarCocinada` sobre un `Almacen` inyectado; hoy es
   `localStorage` y mañana puede ser un cliente HTTP con `localStorage` de caché. La
   pantalla no sabe cuál es.
3. **Lo que hay que volver a decidir**, y por lo tanto lo que necesita ADR propio: la base
   (el ADR-005 sigue siendo un análisis válido), el framework HTTP (ADR-007), la forma de
   autorizar (ADR-012) y si hace falta un broker (ADR-003) —que casi seguro no, con un
   solo servicio—. Esos ADR están superados, no borrados: se leen como punto de partida.
4. **Lo que no hay que repetir**: no volver a crear servicios vacíos «para después». Un
   servicio se crea cuando tiene una ruta que hace algo.

## Cuándo revisar esta decisión

- Cuando el historial tenga que salir del celular: es el disparador de arriba.
- Si el catálogo crece tanto que bajarlo entero deja de ser razonable en una conexión de
  celular. La señal es el peso del bundle, no la cantidad de recetas.
- Si aparece algo que tenga que pasar del lado del servidor por definición: pagos, algo
  compartido entre personas, o cualquier secreto que no pueda estar en el navegador.

## Referencias

- [ADR-001](ADR-001-compose-unico-y-env-como-fuente-de-verdad.md),
  [ADR-006](ADR-006-catalogo-desde-el-repositorio-en-la-imagen.md),
  [ADR-013](ADR-013-frontend-spa-react-vite.md).

---

## Enmienda (2026-09-06): [ADR-016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md)

Lo que decide este ADR no cambia: un solo contenedor para la aplicación, sin backend, con
el catálogo generado en el build. Lo que cambia es lo que hay ADELANTE. Como en la VM
corre más de una aplicación, el TLS y el reparto por dominio salen de la aplicación y
pasan a un proxy optativo de la máquina. Dos consecuencias sobre lo escrito acá: los
volúmenes `caddy-datos` y `caddy-config` ya no son de la aplicación sino del proxy —con el
proxy apagado, el proyecto no usa ninguno—, y el Caddyfile del proxy es un archivo que el
despliegue copia a la VM, así que la frase «la configuración del servidor viaja dentro de
la imagen» vale para la aplicación y no para el proxy.

---

## Enmienda (2026-09-06): [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

Se cumplió hasta el final: no quedó ni ese contenedor. La aplicación es el mismo bundle
estático con el catálogo generado en el build, pero servido por GitHub Pages en vez de por
un Caddy propio. Todo lo que este ADR dejó preparado para el regreso de un backend —el
prefijo `api/` en las URL, el `Almacen` inyectable— sigue en pie y sin cambios.
