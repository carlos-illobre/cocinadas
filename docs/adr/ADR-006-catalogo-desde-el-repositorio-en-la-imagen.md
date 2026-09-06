# ADR-006: El catálogo se lee de los JSON del repositorio y viaja dentro de la imagen

**Estado:** Aceptado
**Fecha:** 2026-09-05

---

## Contexto

Las recetas, los ingredientes y los utensilios ya existen en el repositorio como
contenido versionado: cada receta es una carpeta con HTML, PDF y un JSON por versión
(`data/recetas/esquema-receta.md`); cada ingrediente y utensilio es una ficha Markdown con su
foto. El usuario los mantiene a mano y con la skill `receta-poe-fitness`, y quiere que la
app los detecte sola al agregar archivos, sin cargarlos en ninguna parte.

Invariante 7: cada servicio se construye solo con su carpeta. El catálogo, sin embargo,
vive en tres carpetas de `data/`, fuera de `microservices/`.

## Opciones consideradas

### 1. Cargar el catálogo en PostgreSQL

Un script importa los JSON a tablas y el servicio consulta la base. Se descartó porque
duplica la fuente de la verdad (el repo y la base pueden diverger), obliga a correr el
importador en cada despliegue, y hace que `catalogo` dependa de la base para servir datos
que no cambian entre peticiones.

### 2. Montar las carpetas del repositorio como volumen en la VM

`./data/recetas:/datos/recetas:ro` en el compose. Parecía la más simple y la que respeta la
invariante 7 al pie de la letra. No lo es: en la VM no hay una copia del repositorio
(`deploy.py` copia solo el compose y el Caddyfile), así que habría que clonar y hacer
`git pull` en la instancia en cada despliegue, y la versión del catálogo dejaría de estar
atada al SHA desplegado: una reversión de imagen no revertiría las recetas.

### 3. Empaquetar las tres carpetas dentro de la imagen de `catalogo`

El Dockerfile de `catalogo` se construye con contexto en la raíz y copia
`microservices/catalogo` más `data/recetas/`, `data/ingredientes/` y `data/utencillos/`. El
`.dockerignore` de la raíz deja afuera todo lo demás (mockups, manuales, PDF, otros
servicios). La versión del catálogo es la del commit; revertir revierte las recetas.

## Decisión

Opción 3. `catalogo` lee en tiempo de ejecución el directorio `DIRECTORIO_DATOS`
(`/datos` en la imagen) y detecta recetas por la existencia de `*.json` en cada carpeta
de plato, ingredientes por las fichas `.md` de las subcarpetas de categoría y utensilios
por las fichas `.md` de la raíz de su carpeta, ignorando `README.md`, `plantilla-*.md` e
`indice-*.md`. La foto de cada ficha se resuelve desde la primera imagen Markdown
enlazada. `/health` devuelve el inventario (cantidad de cada cosa) para que un despliegue
sin datos se vea en el primer arranque.

Es una **excepción deliberada a la invariante 7** (contexto de build en la raíz), acotada
por el `.dockerignore` de la raíz y documentada acá.

Medido: la imagen de `catalogo` pesa 261 MB contra 273 MB de `usuarios`; los datos
(2 recetas, 30 fichas de ingredientes con sus fotos, 22 de utensilios) agregan menos de
lo que las dependencias de base de datos agregan a los otros.

## Consecuencias

### Positivas

- Agregar una receta es agregar archivos y hacer commit; la app la ve en el siguiente
  despliegue, sin cargas ni base.
- Catálogo y código siempre coherentes: el JSON que sirve `catalogo` es el que el commit
  desplegado espera.
- `catalogo` no depende de PostgreSQL y arranca en segundos.

### Negativas

- Cambiar una coma de una receta obliga a construir y desplegar la imagen de `catalogo`.
  Es el precio de la coherencia; con `deploy.py` cuesta un comando.
- El contexto de build de `catalogo` es la raíz del repositorio: un cambio en las
  carpetas de datos invalida su caché de capas (solo la última capa, por el orden del
  Dockerfile).
- Las fotos de los envases viajan en la imagen. Hoy son 25 archivos de 100 a 400 KB;
  si el catálogo crece a cientos de fotos grandes, conviene reducirlas al construir.

### Lo que no cambia

Las convenciones de `data/recetas/README.md`, `data/ingredientes/README.md` y
`data/utencillos/README.md` son el contrato; el servicio no impone ningún formato nuevo.

## Cuándo revisar esta decisión

- Si el catálogo lo edita alguien que no tiene el repositorio (un editor web): ahí hace
  falta una base y un importador, y este ADR se enmienda.
- Si la imagen de `catalogo` supera los 500 MB por las fotos.

## Referencias

- `data/recetas/esquema-receta.md`, `.dockerignore` de la raíz, `microservices/catalogo/Dockerfile`.
