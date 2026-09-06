# Pruebas

Tres niveles, separados por lo que necesitan y por si tienen compuerta.

| Nivel | Necesita | Compuerta | Corredor |
|---|---|---|---|
| Unitarias | Nada | **Sí**: 100 % de instrucciones, ramas, funciones y líneas | `tests/utest.sh` |
| Integración | El stack levantado (salvo `--rapido`) | No | `tests/itest.sh` |
| Mutación | Nada | **No**, informa | `tests/mutation.sh` |

Mezclarlas haría que una suite que debería correr en segundos dependa de que haya un
broker arriba, y que la compuerta de cobertura se vuelva inaplicable porque las pruebas de
integración inflan los números sin probar ramas.

## Unitarias

Corren sin levantar nada y **exigen el 100 %** en las cuatro métricas. La compuerta está
en dos lugares: en la configuración de Vitest de cada servicio (`thresholds`), que hace
fallar `pnpm test:cov`, y en `tests/utest.sh`, que vuelve a leer
`coverage/coverage-summary.json` y muestra la tabla por archivo nombrando cuál bajó y en
qué métrica.

```bash
bash tests/utest.sh              # todos los servicios
bash tests/utest.sh catalogo     # uno
```

Última corrida en este esqueleto (2026-09-05):

| Servicio | Pruebas | Cobertura |
|---|---|---|
| catalogo | 69 | 100 / 100 / 100 / 100 |
| usuarios | 22 | 100 / 100 / 100 / 100 |
| cocinadas | 22 | 100 / 100 / 100 / 100 |
| frontend | 201 | 100 / 100 / 100 / 100 |

### Qué está excluido de la cobertura, y por qué, uno por uno

Solo adaptadores de infraestructura y raíces de composición. **El criterio:** si un
archivo excluido contiene una decisión (un `if`, un mapeo de errores, una política), esa
decisión se extrae a un módulo medible y afuera queda solo la llamada al sistema externo.

| Servicio | Archivo | Por qué |
|---|---|---|
| catalogo, usuarios, cocinadas | `src/server.ts` | Raíz de composición: lee la configuración, arma la app, conecta las dependencias y llama a `listen`. Solo llamadas, sin ramas. |
| catalogo, usuarios, cocinadas | `src/infra/nats.ts` | Configura el cliente de NATS real. No se puede ejercitar sin un broker. |
| usuarios, cocinadas | `src/infra/db.ts` | Crea el pool de `pg` y el cliente de Drizzle, y hace `select 1` al arrancar. No se puede ejercitar sin PostgreSQL. |
| frontend | `src/main.tsx` | Raíz de composición: monta `<App/>` en `#raiz`. |
| frontend | `src/pruebas/**`, `src/**/*.test.*` | Utilidades de las pruebas y las pruebas mismas. |

Lo que sí se mide, y con qué: la lectura de configuración (`config.ts`: variable ausente,
vacía, puerto inválido y sus bordes, secreto corto), la app HTTP (`app.ts`, con `inject`
de Fastify, sin abrir puerto: nivel de logs, `/health`, y que `/` sea 404), el inventario
del catálogo (`catalogo.ts`, sobre un directorio temporal con la misma forma que el
repositorio), y en el frontend la consulta de salud (`salud.ts`, con un `fetch`
inyectado), el cliente del catálogo (`api.ts`, con un `fetch` inyectado que responde por ruta), las pantallas `Inicio`, `Recetas` y `Portada` (con Testing Library: carga, error, datos con y sin foto, cambio de versión, desmontaje antes de la respuesta) el recorrido completo en `App` (inicio → recetas → portada → cocina → resumen y vuelta), el modelo de la cocinada (`cocina/modelo.ts`: pasos, huecos entre pasos, procesos que corren solos, alarma, pausa entre etapas, resumen y desvíos, todo puro con el reloj inyectado), los avisos sonoros (`cocina/sonido.ts`, con un AudioContext falso que graba las notas) y la pantalla `Cocina` con relojes falsos (tic, exceso titilando, sub-pasos, porqué, procesos, carriles, alarma con sonido repetido, fin de etapa y final). Además, `cocina/receta-real.test.ts` importa los dos JSON reales de `data/recetas/` y los cocina enteros con el modelo, exactamente a tiempo: es la prueba de que los datos y la pantalla hablan el mismo idioma. Con las pantallas de la segunda ronda se suman: el almacén de cocinadas (`historial/almacen.ts`: orden, basura guardada, agrupación por receta, y el almacén seguro con uno en memoria y uno que lanza), la mise en place (tildar, destildar, receta vacía), el historial y su gráfico (barras, techo del eje, elección de receta), los ajustes y la barra inferior, y en `App` el recorrido completo con guardado, las pestañas y el arranque con datos ya guardados o con un `localStorage` que no existe o lanza. Con las pantallas copiadas del prototipo de Figma (tercera ronda) se suman la experiencia (`xp.ts`: niveles contiguos, progreso dentro del nivel, puntos por precisión) y su barra (`BarraXp`), la lista de recetas con la tarjeta grande, y la portada con los modos con ícono. Con el tema claro/oscuro del prototipo se suman `tema.ts` (leer, guardar, alternar y aplicar) y, en `App`, que el tema se aplique al documento, se guarde y se recuerde al arrancar. En `catalogo`, además: la carga del catálogo sobre un directorio temporal con la forma de `data/` (recetas válidas e ignoradas, fichas con foto, sin foto, con enlace roto y con enlace fuera del directorio) y las rutas HTTP con un catálogo falso y archivos temporales (200 con tipo y caché, 404, 400 por identificadores inválidos sin tocar el catálogo).

## Integración

```bash
bash tests/itest.sh --rapido   # sin stack: paridad de .env y contratos. Dice qué saltea.
bash tests/itest.sh            # con stack: lo anterior + health.sh
```

Un script por asunto en `tests/integration/`:

| Script | Qué verifica | Necesita stack |
|---|---|---|
| `paridad-env.sh` | Que `.env.example`, `deployment/oracle-single/.env.oracle` y `.env` declaren exactamente las mismas variables; que **toda variable que `docker-compose.yml` interpola esté declarada**; y que el compose **no tenga valores por omisión** (`${VAR:-x}`). Lo mismo para el par de despliegue. | No |
| `contratos.sh` | Que las copias de esquemas de eventos en `microservices/*/src/contratos/` sean idénticas a `contratos/eventos/`. | No |
| `health.sh` | Que cada servicio conteste `/health` en su puerto publicado y a través del reverse proxy, que la SPA se sirva, y que la imagen de `catalogo` traiga recetas adentro (ADR-006). | Sí |

**La paridad es la que más rinde:** una variable que el compose usa y ningún `.env`
define cae en su valor por omisión sin que nada avise. En el mejor caso el ambiente
arranca distinto de lo esperado; en el peor, una variable de seguridad, arranca abierto.
Por eso el compose no tiene valores por omisión (`:?` en todas) y esta prueba corre en el
CI en cada push.

Última corrida de `health.sh` (2026-09-05, stack local): los cuatro `/health` por puerto,
los tres por el proxy y la SPA en `http://localhost/` contestaron; el inventario de la
imagen de catálogo fue `{"recetas":2,"ingredientes":30,"utensilios":22}`.

## Mutación

```bash
bash tests/mutation.sh              # todos
bash tests/mutation.sh catalogo     # uno
```

Stryker con el corredor de Vitest, sobre los mismos archivos que mide la cobertura. **Sin
umbral:** existen mutantes equivalentes que ninguna prueba puede matar, y un umbral
obligaría a pelear con eso en vez de leer los sobrevivientes que sí importan. El objetivo
no es un porcentaje: es que **no quede ningún sobreviviente sin explicar**. Cada uno
termina en una de tres cosas: una prueba nueva, una anotación de equivalente, o una
decisión documentada acá de no cubrirlo.

Los informes quedan en `microservices/<servicio>/reports/mutation/index.html`.

### Resultado medido (2026-09-05)

Números impresos por `tests/mutation.sh` desde el `mutation.json` de cada servicio.

| Servicio | Mutantes | Muertos | Sobrevivieron | Puntaje |
|---|---|---|---|---|
| catalogo | 292 | 288 | 4 | 98,6 % |
| usuarios | 47 | 47 | 0 | 100 % |
| cocinadas | 47 | 47 | 0 | 100 % |
| frontend | 301 | 290 | 11 | 96,3 % |

**Primera corrida, antes de leer los sobrevivientes:** catalogo 94,3 % con 5
sobrevivientes. Tres eran huecos reales y se cerraron con pruebas nuevas:

| Sobreviviente | Qué faltaba | Prueba agregada |
|---|---|---|
| `config.ts:31` `puerto < 1` → `puerto <= 1`, y `> 65535` → `>= 65535` | Nadie probaba los bordes exactos 1 y 65535 | «acepta el borde 1 / 65535» |
| `app.ts:17` `Fastify({ logger: { level } })` → `Fastify({})` (dos mutantes) | Nadie comprobaba el nivel de logs configurado | «configura el logger con el nivel pedido» |
| `app.ts:19` `'/health'` → `''` | Con la ruta vacía Fastify sirve `/`, y ninguna prueba pedía `/` | «no responde en la raíz: la única ruta es /health» |

Las mismas pruebas se agregaron en usuarios y cocinadas, que tenían los mismos huecos
(el código de `config.ts` y `app.ts` es el mismo por diseño, invariante 7).

**Los once sobrevivientes del frontend, explicados** (la primera corrida con las pantallas de catálogo tuvo 22; once se cerraron con pruebas: bordes de `reloj`, texto exacto del marcador sin foto, clase exacta de la pestaña no elegida, estado de carga ausente después de cargar, etapa sin pasos):

| Sobreviviente | Por qué sobrevive | Decisión |
|---|---|---|
| `Recetas.tsx:24/27/30/31`, `Portada.tsx:29/32/35/36`, `App.tsx:93/97/98`: la guarda `if (vigente)` y la limpieza `vigente = false` del efecto que consulta al catálogo | Evitan que una respuesta tardía (de un `fetch` anterior, o después de desmontar) pise el estado. Se escribieron pruebas de carrera (`la respuesta tardía … no pisa a la nueva`) y no las detectan: la actualización de estado fuera de `act` que provoca el mutante no llega a renderizarse dentro de la prueba, así que el DOM queda igual con o sin guarda. React 19 tampoco avisa por actualizaciones sobre componentes desmontados. | No cubrir. Las guardas se mantienen: son la protección real contra la carrera al cambiar de versión rápido, aunque la prueba no pueda observarla. Cuando haya un enrutador, la carrera se prueba de punta a punta con Playwright. |
| `Portada.tsx:22` el estado inicial `{ estado: 'cargando' }` → `{}` / `""` | El efecto vuelve a poner `cargando` en cuanto monta, y el efecto corre dentro del mismo `render` de la prueba: el estado inicial nunca llega a verse. Equivalente. | No cubrir; el inicial queda para que el primer cuadro no sea un estado vacío si algún día el efecto se demora. |

**Los cuatro sobrevivientes de catalogo, explicados** (segunda corrida; la primera tuvo 23 y 19 se cerraron con pruebas: bordes de los esquemas de parámetros, orden de las versiones independiente del disco, recorrido no recursivo de utensilios, plato sin foto declarada, índices que no se mezclan):

| Sobreviviente | Por qué sobrevive | Decisión |
|---|---|---|
| `catalogo.ts:205` `x.id !== null && fotos.has(x.id)` → `true && …` | `Map.has(null)` es `false`, así que quitar la guarda de nulo no cambia ningún resultado. Equivalente. | No cubrir; la guarda queda porque documenta que un `id: null` no se busca. |
| `rutas.ts:22` `ruta === null \|\| tipo === null` → `tipo === null` | `tipo` ya es `null` cuando `ruta` lo es (se calcula en la línea anterior), así que la primera mitad es redundante para el resultado. Equivalente. | No cubrir. |
| `rutas.ts:35` y `rutas.ts:67` `required: ['plato']` / `['id']` → `['']` | Un parámetro de ruta siempre está presente: `required` no puede fallar nunca. Equivalente. | No cubrir; se deja por claridad del esquema. |

### Dos ajustes de Stryker que no vienen de fábrica

- Con el `node_modules` estricto de pnpm, el descubrimiento automático de plugins no
  encuentra el corredor: «Cannot find TestRunner plugin "vitest"» en los cuatro proyectos.
  Se declara `"plugins": ["@stryker-mutator/vitest-runner"]` en cada
  `stryker.config.json`.
- `coverageAnalysis: "perTest"` para que cada mutante corra solo las pruebas que lo
  tocan; en catalogo, 1,53 pruebas por mutante en promedio y 17 segundos en total.

## Mutation testing a mano

Antes de confiar en una prueba, se rompió el código a propósito y se comprobó que fallara.
Todas las filas se ejecutaron el 2026-09-05; las que dicen **no detectado** son las que
valen, porque son lo que hubo que arreglar.

| Qué se rompió | Prueba que debía fallar | ¿Falló? | Qué se hizo |
|---|---|---|---|
| Borrar `MEM_LIMIT_NATS` de `.env.example` | `paridad-env.sh` | Sí: «sobran: MEM_LIMIT_NATS» en `.env.oracle` y en `.env`, y «el compose usa variables que .env.example no declara». | Nada; la prueba sirve. |
| Cambiar `${TAG:?...}` por `${TAG:-local}` en el compose | `paridad-env.sh` | **No.** La variable seguía declarada, así que la paridad pasaba, y `grep -c ':-'` daba 4: cuatro fallbacks sin que nada avisara. | Se agregó a `paridad-env.sh` la comprobación de que el compose no tenga `${VAR:-x}` ni `${VAR-x}`. Repetido: ahora falla con «el compose tiene valores por omisión: ${TAG:-local}». |
| `obligatoria()` devolviendo `''` en vez de lanzar cuando la variable está vacía | `config.test.ts` «corta también si está declarada pero vacía» | Sí, 1 de 26. | Nada. |
| `esFicha()` sin el filtro de `plantilla-` | `catalogo.test.ts` | Sí, 3 de 26: «plantilla-ingrediente.md no es una ficha», el conteo de ingredientes (3 en vez de 2) y el inventario. | Nada. |
| Instalar el frontend desde una ruta con distinta capitalización que la real (Windows) | `App.test.tsx` | Sí, las 4 pruebas de `App`, pero con un error que no dice la causa: «Cannot read properties of null (reading 'useState')». | Documentado en «Windows». `resolve.dedupe` en `vite.config.ts` no alcanza si los enlaces de pnpm ya apuntan a la otra ruta; hay que reinstalar desde la ruta real. |
| Compartir una sola instancia de Fastify entre pruebas y cerrarla en `afterEach` | Las propias pruebas de `app.test.ts` | Sí: «Fastify has already been closed and cannot be reopened» desde la segunda prueba. | Una app por prueba (`beforeEach`). Quedó como regla en el comentario del test. |

## Windows

La carpeta del proyecto se llama `data/recetas` en el disco aunque el sistema la muestre como
`Recetas`. pnpm guarda en `node_modules` enlaces con la ruta tal como se escribió al
instalar; si difiere de la real en mayúsculas, Vite resuelve `react` por dos rutas y los
hooks fallan. Instalar y correr las pruebas siempre desde la ruta real:

```bash
cd /c/Users/<usuario>/OneDrive/Desktop/recetas   # minúscula, como en el disco
```

En Linux (CI, Docker) no existe el problema.

## El pipeline

`.github/workflows/ci.yml` corre en cada push: `tests/utest.sh`, `tests/itest.sh
--rapido`, `docker compose config` (que falla si alguna variable queda sin definir) y
`bash -n` sobre los scripts de despliegue. Solo si todo pasa, y solo en `main`, construye
y publica las imágenes. **El mutation testing corre solo en el CI** (job `mutacion`, después
de `pruebas`, sin bloquear el pipeline): tarda minutos, así que no se corre en la máquina
de desarrollo salvo pedido expreso. Los informes de cada servicio quedan como artefacto
`mutacion` del run, y las tablas de arriba se actualizan desde ahí.
