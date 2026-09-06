# Pruebas

Un solo nivel, con compuerta.

| Nivel | Necesita | Compuerta | Corredor |
|---|---|---|---|
| Unitarias | Nada | **Sí**: 100 % de instrucciones, ramas, funciones y líneas | `tests/utest.sh` |

Antes había tres. Qué pasó con los otros dos está más abajo, en «Lo que ya no está».

## Unitarias

Corren sin levantar nada y **exigen el 100 %** en las cuatro métricas. La compuerta está
en dos lugares: en `web/vite.config.ts` (`thresholds`), que hace fallar `pnpm test:cov`, y
en `tests/utest.sh`, que vuelve a leer
`coverage/coverage-summary.json` y muestra la tabla por archivo nombrando cuál bajó y en
qué métrica.

```bash
bash tests/utest.sh
```

Última corrida (2026-09-06):

| Proyecto | Pruebas | Cobertura |
|---|---|---|
| web | 292 | 100 / 100 / 100 / 100 |

Hay un solo proyecto, en `web/`. Las pruebas del catálogo, que eran de un servicio, viven
en `web/src/catalogo/` y entran en la misma compuerta sin configuración aparte: es la razón
por la que el generador vive dentro de `src/` y no en una carpeta de herramientas.

### Qué está excluido de la cobertura, y por qué, uno por uno

Solo adaptadores de infraestructura y raíces de composición. **El criterio:** si un
archivo excluido contiene una decisión (un `if`, un mapeo de errores, una política), esa
decisión se extrae a un módulo medible y afuera queda solo la llamada al sistema externo.

Son cuatro, y ninguno decide nada.

| Archivo | Por qué |
|---|---|
| `src/main.tsx` | Raíz de composición: monta `<App/>` en `#raiz`. |
| `src/catalogo/generar.ts` | Escribe a disco el plan que armó `planificar()`: crea carpetas, escribe JSON y copia fotos. Sin ramas propias. Todo lo que decide qué archivos van y con qué contenido está en `catalogo.ts`, que se mide entero. |
| `src/imagenes/optimizar.ts` | Maneja el navegador que convierte las imágenes y escribe los archivos. Qué imagen, a qué ancho y con qué nombre lo decide `plan.ts`, que sí se mide. Corre a mano con `pnpm optimizar`, no en el build. |
| `src/pruebas/**`, `src/**/*.test.*` | Utilidades de las pruebas y las pruebas mismas. |

Los dos primeros siguen la misma regla y por eso son el ejemplo de qué se excluye y qué
no: **la decisión se mide, la llamada al sistema externo no**.

Lo que sí se mide, y con qué: la generación del catálogo (`src/catalogo/catalogo.ts`,
sobre un directorio temporal con la misma forma que `data/`: recetas válidas e ignoradas,
fichas con foto, sin foto, con enlace roto, con enlace fuera del directorio y con enlace a
algo que no es una imagen; y el plan resultante, que las versiones se escriban por clave y
por número, que solo se copien las fotos que alguna receta referencia, y que avise cuál
falta en vez de publicar una receta sin foto), el plan de optimización de imágenes
(`src/imagenes/plan.ts`: qué se convierte y a qué ancho, incluidas las excepciones de las
capas de inicio), la consulta de salud (`salud.ts`, con un `fetch`
inyectado), el cliente del catálogo (`api.ts`, con un `fetch` inyectado que responde por ruta), las pantallas `Inicio`, `Recetas` y `Portada` (con Testing Library: carga, error, datos con y sin foto, cambio de versión, desmontaje antes de la respuesta) el recorrido completo en `App` (inicio → recetas → portada → cocina → resumen y vuelta), el modelo de la cocinada (`cocina/modelo.ts`: pasos, huecos entre pasos, procesos que corren solos, alarma, pausa entre etapas, resumen y desvíos, todo puro con el reloj inyectado), los avisos sonoros (`cocina/sonido.ts`, con un AudioContext falso que graba cada nota con su frecuencia, su forma de onda y el pico de su envolvente) y el gantt vertical (`gantt` y `frenteGantt`: altos proporcionales al tiempo con un mínimo legible, huecos entre pasos, procesos en la misma escala y el frente que avanza con el cronómetro) y la pantalla `Cocina` con relojes falsos (tic, exceso titilando, sub-pasos, porqué, procesos, carriles, alarma con sonido repetido, fin de etapa y final). Además, `cocina/receta-real.test.ts` importa los dos JSON reales de `data/recetas/` y los cocina enteros con el modelo, exactamente a tiempo: es la prueba de que los datos y la pantalla hablan el mismo idioma. Con las pantallas de la segunda ronda se suman: el almacén de cocinadas (`historial/almacen.ts`: orden, basura guardada, agrupación por receta, y el almacén seguro con uno en memoria y uno que lanza), la mise en place (tildar, destildar, receta vacía), el historial y su gráfico (barras, techo del eje, elección de receta), el perfil con sus números y sus logros (`logros.ts`: cada regla con su caso que la consigue y otro que no, incluida la racha con huecos y con dos cocinadas del mismo día), la barra inferior, la cocinada en curso (`cocina/enCurso.ts`: retomar, descartar la vieja, la de otra receta y cualquier cosa guardada que no se pueda leer) y la navegación con el botón de atrás del teléfono (que vuelve de pantalla, que no cuenta dos veces cuando ya volvió un botón de la pantalla, y que en la primera no hace nada), y en `App` el recorrido completo con guardado, las pestañas y el arranque con datos ya guardados o con un `localStorage` que no existe o lanza. Con las pantallas copiadas del prototipo de Figma (tercera ronda) se suman la experiencia (`xp.ts`: niveles contiguos, progreso dentro del nivel, puntos por precisión) y su barra (`BarraXp`), la lista de recetas con la tarjeta grande, y la portada con los modos con ícono. Con el tema claro/oscuro del prototipo se suman `tema.ts` (leer, guardar, alternar y aplicar) y, en `App`, que el tema se aplique al documento, se guarde y se recuerde al arrancar.

## Lo que ya no está

**Las pruebas de integración y el mutation testing se dieron de baja** con el paso a un
sitio estático (ADR-017).

- `tests/itest.sh` y `tests/integration/` verificaban la paridad de los `.env`, los
  contratos de eventos y el camino de punta a punta con el stack de Docker levantado. Sin
  `.env`, sin eventos y sin stack, no quedaba nada que verificaran.
- Lo único de ese nivel que sobrevive está **dentro** del pipeline: el job `publicar`
  comprueba que el `index.html` compilado no tenga rutas absolutas, que es el error que
  solo aparecería en producción (ver DEPLOYMENT.md, «Las dos trampas de Pages»).
- Stryker corría sobre cuatro proyectos y tardaba minutos de CI. Con un solo proyecto y sin
  servidor, ese tiempo dejó de pagarse. El análisis de los sobrevivientes que se hizo en su
  momento sigue siendo válido como registro y está en la historia de git; los dos que
  quedaron sin cubrir a propósito eran las guardas de carrera de los efectos que consultan
  al catálogo, y esas guardas siguen en el código.

## Windows

La carpeta del proyecto se llama `recetas` en el disco aunque el explorador la muestre
capitalizada. pnpm guarda en `node_modules` enlaces con la ruta tal como se escribió al
instalar; si difiere de la real en mayúsculas, Vite resuelve `react` por dos rutas y los
hooks fallan. Instalar y correr las pruebas siempre desde la ruta real:

```bash
cd /c/Users/<usuario>/OneDrive/Desktop/recetas   # minúscula, como en el disco
```

En Linux (CI, Docker) no existe el problema.

## El pipeline

`.github/workflows/ci.yml` corre en cada push: `tests/utest.sh` y
`bash -n` sobre los scripts de despliegue. Solo si todo pasa, y solo en `main`, construye
y publica las imágenes. **El mutation testing corre solo en el CI** (job `mutacion`, después
de `pruebas`, sin bloquear el pipeline): tarda minutos, así que no se corre en la máquina
de desarrollo salvo pedido expreso. Los informes de cada servicio quedan como artefacto
`mutacion` del run, y las tablas de arriba se actualizan desde ahí.
