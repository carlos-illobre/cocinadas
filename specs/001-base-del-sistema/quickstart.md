# Quickstart: cómo se instala, se levanta, se prueba y se publica

La guía de uso del repositorio. El porqué de cada cosa está en [plan.md](plan.md) y en
los ADR (`docs/adr/`).

## Qué hay en cada carpeta

| Carpeta | Qué es |
|---|---|
| `data/recetas/`, `data/ingredientes/`, `data/utencillos/` | El catálogo: recetas como POE (HTML imprimible, PDF y JSON de datos), fichas de ingredientes y fichas de utensilios, con sus fotos originales. Es contenido, no código. |
| `data/inicio-capas/` | Las capas originales de la pantalla de entrada. |
| `web/src/` | Lo que va al navegador: `pantallas/`, `componentes/` y el dominio puro por tema (`cocina/`, `historial/`, `progreso/`). |
| `web/herramientas/` | Lo que corre en Node al compilar: el generador del catálogo (`catalogo/`) y el optimizador de imágenes (`imagenes/`). |
| `web/e2e/` | Las pruebas de punta a punta de Playwright. |
| `web/assets/` | Las versiones livianas de las imágenes (WebP, al tamaño al que se muestran). Se versionan. |
| `web/public/api/catalogo/`, `web/public/inicio/` | Generado al compilar. No se versiona. |
| `docs/` | Los ADR (`docs/adr/`) y la descripción de negocio. |
| `specs/` | La especificación, una carpeta por capacidad. |
| `proyecto/` | La ficha del proyecto, los riesgos y el estado por requerimiento (`proyecto/estado/`). |
| `herramientas/` | El control de que la especificación y el estado coinciden. |
| `tmp/` | Lo temporal. No se versiona y se limpia al terminar. |

## Requisitos

- **Node 22** y **pnpm 10**.
- **Python 3**, para validar el catálogo.
- **Chrome o Chromium**, solo para optimizar imágenes.
- El Chromium de Playwright, para la prueba de punta a punta (se baja una sola vez).

## Instalar y levantar

```bash
cd web && pnpm install && pnpm dev
```

Abre en <http://localhost:5173>. `pnpm dev` genera antes el catálogo leyendo `data/`.

| Cuándo | Comando |
|---|---|
| Tocaste una receta o una ficha | `cd web && pnpm generar:catalogo` |
| Agregaste o cambiaste una imagen | `cd web && pnpm optimizar` |
| Querés ver exactamente lo que se publica | `cd web && pnpm build && pnpm preview` |
| Querés validar el catálogo del repositorio | `python3 data/recetas/validar-receta.py` |

Si al compilar falta la versión liviana de una imagen, la compilación se corta y dice
cuál: corré `pnpm optimizar`.

## Probar: las tres compuertas

Antes de subir código pasan las tres. Ninguna se baja.

```bash
cd web && pnpm lint        # 1. tsc sin errores y ESLint sin avisos
cd web && pnpm test:cov    # 2. unitarias, con cobertura del 100 %
cd web && pnpm e2e         # 3. el camino feliz, contra el sitio compilado
```

La primera vez, antes de `pnpm e2e`:

```bash
cd web && pnpm exec playwright install chromium
```

1. **`pnpm lint`.** ESLint usa las reglas con información de tipos
   (`strict-type-checked` y `stylistic-type-checked`) y las de hooks de React. Hay tres
   reglas apagadas a propósito, con su motivo en `web/eslint.config.js`.
2. **`pnpm test:cov`.** Exige el 100 % de instrucciones, ramas, funciones y líneas en
   `web/src/**` y `web/herramientas/**`. La compuerta son los `thresholds` de
   `web/vite.config.ts`; si algo baja, falla e imprime las líneas sin cubrir. Hay cuatro
   exclusiones, y ninguna decide nada: `src/main.tsx`,
   `herramientas/catalogo/generar.ts`, `herramientas/imagenes/optimizar.ts` y las propias
   pruebas (`src/pruebas/**`, `*.test.*`). Si un archivo excluido necesita un `if`, esa
   decisión se saca a un módulo que se mide.
3. **`pnpm e2e`.** Compila, sirve el resultado y recorre el camino feliz en Chromium
   emulando un Pixel 7 (`web/e2e/primera-cocinada.spec.ts`), más la prueba de los sonidos
   (`web/e2e/sonidos.spec.ts`). Sin compuerta de cobertura, a propósito (ADR-018).

Además, lo que corre la integración continua y conviene correr antes de subir:

```bash
python3 data/recetas/validar-receta.py    # las tres formas de cada receta dicen lo mismo
node herramientas/trazabilidad.mjs        # la especificación y el estado coinciden
```

**Lo visual se verifica con capturas** (Playwright, Pixel 7, los dos temas), no leyendo
el CSS. Las capturas van en `tmp/`.

## Publicar

**Cada push a `main` publica el sitio solo.** Todo va directo a `main`, sin ramas ni pull
requests.

El pipeline (`.github/workflows/ci.yml`) corre en cada push:

| Job | Qué hace |
|---|---|
| `pruebas` | `pnpm lint`, `pnpm test:cov`, `validar-receta.py` y el control de trazabilidad. |
| `e2e` | El camino feliz sobre el sitio compilado. Job aparte porque baja el navegador. |
| `vulnerabilidades` | Trivy: CVE y secretos. Informa, no reprueba. |
| `publicar` | Solo en `main` y solo si `pruebas` y `e2e` pasaron. Compila, comprueba que el `index.html` no tenga rutas absolutas y publica en GitHub Pages. |

La cobertura queda como artefacto `cobertura` del run; el informe y las trazas del E2E,
como artefacto `e2e`.

**Configuración en GitHub, una sola vez:** Settings → Pages → Build and deployment →
Source: GitHub Actions. El repositorio tiene que ser público para que Pages sea gratis.
No hay secretos que cargar.

**Revertir:**

```bash
git revert <sha>
```

y subirlo. El push siguiente publica de nuevo. Como el catálogo se genera al compilar,
revertir el código revierte también las recetas.

**Bajar el sitio:** Settings → Pages → Source: «None».

**Ver qué se publicó y cuándo:** Actions → los runs de `publicar`, o Settings → Pages.

**Reproducir la subcarpeta de Pages en local**, para detectar una ruta absoluta antes de
publicar:

```bash
cd web && pnpm build
mkdir -p tmp/pages/cocinadas && cp -r web/dist/* tmp/pages/cocinadas/
cd tmp/pages && python3 -m http.server 8099
```

(los dos últimos, desde la raíz del repositorio) y abrir
<http://localhost:8099/cocinadas/>. Al terminar, borrar `tmp/pages`.

## Reglas de trabajo en el repositorio

- **Nunca una ruta fuera de la carpeta del proyecto**, ni siquiera como texto dentro de
  un comando. Lo temporal va en `tmp/`.
- **Todas las rutas del código son relativas** (`logo.png`, `api/catalogo`), nunca con
  barra inicial.
- **Todo en castellano con voseo**: código, comentarios, commits y documentación. Los
  comentarios explican por qué, no qué. Commits: qué cambió y por qué, en imperativo.
- **No se crea nada «para después».**
- **Un ADR viejo no se reescribe**: se le agrega una enmienda al final.
- **Antes de tocar una pantalla**, leer el `ux.md` de su capacidad: el diseño aprobado
  es regla.
- **Al terminar una tarea**, actualizar el estado del requerimiento en
  `proyecto/estado/` con las pruebas que lo respaldan, y cerrar su issue.

## Trampas conocidas

- **Pages sirve el sitio en `/cocinadas/`, no en la raíz.** Una ruta con barra inicial
  funciona en local y da 404 solo en línea. `base: './'` en `web/vite.config.ts` lo
  evita y el job `publicar` lo comprueba, pero solo sobre el `index.html`.
- **Pages no deja poner cabeceras HTTP.** La política de contenido va como `<meta>` y se
  inyecta solo en el build; en `pnpm dev` no está. Para probarla: `pnpm build && pnpm
  preview`, o `pnpm e2e`.
- **Pages cachea 10 minutos** (`max-age=600`, no se puede cambiar). Para ver un cambio
  enseguida, abrir la dirección con `?x=1` (otro número cada vez).
- **Si cambia el manifest, el acceso directo instalado hay que reinstalarlo.**
- **Un ancestro con `transform` es el bloque contenedor de sus hijos `position: fixed`.**
  La animación de entrada de una pantalla no puede dejar `transform` puesto, y lo que
  cubre la ventana entera (el confeti) va como hermano de la pantalla, no adentro. El
  E2E mide que el confeti cubra la ventana.
- **Todas las pantallas viven en el mismo documento**: el desplazamiento no se reinicia
  solo. Hay que volver arriba al cambiar de pantalla y al cambiar de fase en la cocina.
- **`prefers-reduced-motion` apaga las animaciones.** Si «no se ven las animaciones»,
  mirar eso y el ahorro de batería del teléfono antes que el código.
- **El Chromium del contenedor no tiene fuentes de emoji**: los □ en las capturas no son
  un error.
- **El navegador no deja sonar hasta que hubo un gesto de la persona.** El audio se crea
  con el primer toque, no al arrancar.
- **El generador del catálogo, el optimizador de imágenes y la prueba que cocina la
  receta real encuentran `data/` por una ruta relativa a su propio archivo.** Si se
  mueven de carpeta, hay que ajustarla.
- **En jsdom un `<img>` no baja nada**: una foto rota no se distingue de una buena en
  las unitarias. Eso lo ve solo el E2E.
- **El E2E es sensible a los textos de los botones y a la forma de la receta** (la
  cantidad de items de la mise en place está escrita). Si cambia un botón o la receta,
  hay que tocar la prueba.
- **En WSL, el `pnpm` de Windows puede pisar al de Linux** en el PATH y fallar con
  «Invalid argument». Usar el de Node instalado en Linux, poniéndolo primero en el PATH.
- **En Windows, instalar y correr siempre desde la ruta real de la carpeta, con sus
  mayúsculas y minúsculas tal como está en el disco.** pnpm guarda enlaces con la ruta
  como se escribió; si difiere, se carga React dos veces y los hooks fallan.
- **Trivy: los tags de la acción llevan el prefijo `v`.** Sin él, el job falla sin
  escanear.
