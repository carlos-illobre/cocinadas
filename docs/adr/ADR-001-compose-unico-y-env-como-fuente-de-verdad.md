# ADR-001: Un solo `docker-compose.yml` y el `.env` como fuente de la verdad

**Estado:** Aceptado, enmendado por [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)
**Fecha:** 2026-09-05

---

## Contexto

El sistema corre en dos ambientes desde el primer día: la máquina de desarrollo (Windows
con Docker Desktop) y una VM de Oracle Cloud. Lo que cambia entre ellos es poco y
concreto: la interfaz en la que se publican los puertos, la dirección del sitio (con o
sin TLS), el prefijo del registro de imágenes, la etiqueta de la versión, las
credenciales de la base, el secreto de los JWT, el nivel de logs y los techos de memoria.
Trece variables en total (medido con `tests/integration/paridad-env.sh`).

## Opciones consideradas

### 1. Un compose por ambiente (`docker-compose.yml` + `docker-compose.prod.yml`)

La forma más difundida. Se descartó porque dos composes divergen en silencio: el día que
alguien agrega un servicio, una variable o un `healthcheck` en uno solo, producción y
desarrollo dejan de ser el mismo sistema y nadie se entera hasta que falla el despliegue.

### 2. Un compose con la sobreescritura de Compose (`docker-compose.override.yml`)

Parece la solución oficial y no lo es para este caso: el override se aplica solo a
mano, se mezcla por reglas que hay que conocer (listas que se concatenan, mapas que se
pisan), y termina siendo la opción 1 con una capa más de indirección.

### 3. Un solo compose, con todo lo variable en el `.env` y sin valores por omisión

Un archivo. La diferencia entre ambientes es exactamente el contenido del `.env`, que se
puede leer de un vistazo y comparar con una prueba. Los servicios que solo existen en un
ambiente irían con `profiles:`, no en otro archivo (hoy no hay ninguno).

## Decisión

Un único `docker-compose.yml`. Toda variable que cambie entre ambientes se lee del `.env`
con la forma `${VAR:?mensaje}`, que corta el arranque si falta. Ningún valor por omisión
en el compose ni en la configuración de los servicios (`config.ts` lanza si una variable
está ausente o vacía). Lo que no cambia entre ambientes (host del broker, puertos
internos, ruta de los datos del catálogo) va literal en el compose.

Se versionan `.env.example` y `deployment/oracle-single/.env.oracle` con marcadores de
posición; el `.env` real está en el `.gitignore`. `tests/integration/paridad-env.sh`
comprueba en cada push que los tres declaren las mismas variables, que todas las que el
compose interpola estén declaradas, y que el compose no tenga fallbacks.

## Consecuencias

### Positivas

- Un solo lugar donde mirar para saber cómo está configurado un ambiente.
- Una variable olvidada se ve al arrancar, con su nombre, no como comportamiento raro.
- La prueba de paridad convierte «me olvidé de agregarla en producción» en un fallo del
  CI en segundos.

### Negativas

- Agregar una variable obliga a tocar tres archivos (`.env`, `.env.example`,
  `.env.oracle`). La prueba de paridad lo recuerda, pero es trabajo.
- Los `${VAR:?...}` hacen el compose más ruidoso de leer.

### Lo que no cambia

El compose se levanta igual que siempre (`docker compose up -d`); no hay flags ni
archivos extra que recordar.

## Cuándo revisar esta decisión

- Si aparece un tercer ambiente con diferencias estructurales (no solo de valores), por
  ejemplo un servicio que existe solo en uno: primero `profiles:`, y si no alcanza, este
  ADR se enmienda.
- Si el número de variables supera unas treinta y el `.env` se vuelve inmanejable: en ese
  punto conviene agruparlas por servicio, no partir el compose.

## Referencias

- `.claude/skills/microservicios-base/referencias/invariantes.md`, invariantes 1 a 4.
- `docs/TESTING.md`, «Integración».

---

## Enmienda (2026-09-06): [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

Ya no hay compose ni `.env`: no queda nada que se configure por ambiente, porque hay un
solo ambiente y es el sitio publicado. Lo que sobrevive del ADR es su principio, aplicado
ahora al build: nada de valores por omisión escondidos, y una sola fuente para cada cosa.
