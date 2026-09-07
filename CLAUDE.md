# Cocinadas

Contexto que no se deduce leyendo el código. Lo demás está en el
[README](README.md), en [docs/](docs/) y en los [ADR](docs/adr/), que son la explicación
larga de cada decisión: antes de cambiar algo que tenga un ADR, leelo.

## Cómo se escribe acá

- **Todo en español**: nombres de variables y funciones, comentarios, mensajes de commit,
  documentación y textos de la app. Con voseo («tocá», «entrá», «verificá»).
- Los comentarios explican **por qué**, no qué hace la línea de al lado. Si un comentario
  se puede deducir del código, sobra.
- Mensajes de commit: qué cambió y por qué, en imperativo y en español.

## Invariantes que no se negocian

1. **Cobertura del 100 %**, con compuerta. Lo que no se puede probar se extrae a un módulo
   medible y afuera queda solo la llamada al sistema externo (ver `docs/TESTING.md` para
   las exclusiones, que son tres y están justificadas).
2. **Todas las rutas son relativas.** GitHub Pages sirve el sitio en `/<repo>/`, así que
   una ruta que empiece con `/` da 404 **solo en producción**. `vite.config.ts` tiene
   `base: './'` y el CI comprueba el `index.html` compilado (ADR-017).
3. **No se crea nada «para después».** Un servicio, una capa o una pieza de
   infraestructura se crean cuando tienen algo que hacer hoy. Es la lección de ADR-015:
   `usuarios` y `cocinadas` vivieron meses sin nada más que `/health`, y cuando se
   borraron no había nada que rescatar.
4. **Un ADR viejo nunca se reescribe.** Si una decisión posterior lo cambia, se le agrega
   una enmienda al final que apunta al nuevo, y se actualiza el estado en el índice. Buena
   parte de la lista está superada y eso es información, no basura.

## Cómo está armado

Es un sitio estático en GitHub Pages (<https://carlos-illobre.github.io/cocinadas/>): una
SPA que se baja entera al teléfono, con el catálogo adentro. Las cocinadas viven en el `localStorage` (`cocinadas.historial`,
`cocinadas.tema`, `cocinadas.cocinando`). Todo el código está en `web/`.

El catálogo **se genera en el build**: `web/herramientas/catalogo/catalogo.ts` lee `data/` y
devuelve el plan de archivos (puro, medido al 100 %); `generar.ts` lo escribe en
`web/public/api/catalogo/`, que no se versiona. Tocar una receta obliga a
`pnpm generar:catalogo` en desarrollo, y a volver a publicar en producción.

`web/` se divide por lo que corre en cada lado:

- `src/` es lo que va al navegador. `pantallas/` son las pantallas (una por archivo; la
  cocina es una carpeta porque son cinco componentes), `componentes/` lo que comparten
  varias, y el resto son módulos de dominio puros por tema: `cocina/` (modelo, cocinada
  en curso, sonido), `historial/`, `progreso/` (experiencia y logros), `api.ts` (el
  cliente del catálogo y sus tipos) y `tema.ts`.
- `herramientas/` son los scripts de build, que corren en Node: el generador del
  catálogo y el optimizador de imágenes. Se miden con la misma compuerta que `src/`.
- `e2e/` son las pruebas de Playwright.

`pnpm lint` corre `tsc` y ESLint (`eslint.config.js`, reglas de tipos estrictas y las de
hooks de React); es parte del job `pruebas` del CI.

**Las imágenes tienen dos vidas**: los originales en `data/` y `docs/mockups/`, que pueden
pesar lo que quieran, y las versiones que se publican en `web/assets/`, en WebP y al
tamaño al que se muestran. Se versionan y se regeneran con `pnpm optimizar`. Si agregás
una foto y no corrés ese comando, **el build corta** y te dice cuál falta.

El porqué de todo esto —y **qué hace falta el día que las cocinadas tengan que salir del
celular**— está en los ADR **015** y **017**. Los ADR 001 a 016 describen microservicios,
PostgreSQL, NATS, JWT, Docker, Caddy y un despliegue en Oracle que el proyecto tuvo y ya
no tiene: están **superados o enmendados**. Leerlos como historia, no como estado actual.

## El producto

- Es una app **solo para celular**. Guía una receta como una línea de tiempo viva.
- Las recetas son POE: las cuatro restricciones fijas son **cero desperdicio, sin sal
  agregada, una porción y el reloj arranca al abrir el freezer**. El tiempo declarado
  incluye descongelar, lavar y cortar; nunca se esconde tiempo.
- **Está gamificada, pero premia la precisión, no la velocidad**: los puntos salen de lo
  cerca que estuvo la cocinada de los tiempos de la receta (`src/progreso/xp.ts`, `puntosDe`). El
  criterio exacto todavía está por acordar con Carlos.
- El diseño de las pantallas sale del prototipo de Figma Make, que es la fuente:
  <https://www.figma.com/make/ktWkl4C92atKONL5GR4Gn5/Cocinadas>. Cambia seguido; el código
  fuente se lee desde el bundle de su preview, no desde el conector de Figma.
- Del prototipo se dejaron afuera a propósito: login por nombre, dificultad, y los
  cronómetros por paso independientes.

## Los datos son contenido, no código

`data/recetas/`, `data/ingredientes/` y `data/utencillos/` son el catálogo. Cada versión de
una receta es un HTML imprimible, un PDF y un **JSON que es lo que la app usa**
(`data/recetas/esquema-receta.md`). Los tres tienen que decir lo mismo; si se corrige uno,
se corrigen los otros. `python data/recetas/validar-receta.py` lo comprueba.

Las recetas las genera la skill `receta-poe-fitness`, que vive fuera del repositorio.

## Comandos

```bash
cd web && pnpm test:cov                      # unitarias, con la compuerta del 100 %
cd web && pnpm e2e                           # el camino feliz en un navegador (ADR-018)
cd web && pnpm dev                           # la app en http://localhost:5173
cd web && pnpm generar:catalogo              # tras tocar una receta o una ficha
cd web && pnpm optimizar                     # tras agregar o cambiar una imagen
cd web && pnpm build && pnpm preview         # exactamente lo que se publica
python3 data/recetas/validar-receta.py       # el catálogo del repositorio es válido
```

Para trabajo temporal usar `tmp/` en la raíz, que está en el `.gitignore`, y **limpiarla al
terminar**.

## Trampas conocidas

- **En Windows**, la carpeta del proyecto se llama `recetas` en minúscula aunque el
  explorador la muestre capitalizada. Instalar dependencias desde la ruta con otra
  capitalización deja los enlaces de pnpm apuntando a otro lado y React se carga dos
  veces, con un error que no dice la causa.
- **Nada de rutas absolutas.** Pages sirve en `/cocinadas/`, así que `/logo.png` busca la
  raíz del dominio y da 404 solo en producción. Las rutas relativas funcionan porque la
  app **nunca cambia la URL**: `avanzar` en `App.tsx` hace `pushState(null, '')` sin
  tercer argumento. El día que haya enlaces profundos, esto hay que rehacerlo.
- **`web/herramientas/catalogo/generar.ts` busca `data/` por una ruta relativa a su propio
  archivo.** Si se mueve de carpeta, hay que ajustarla — y lo mismo vale para
  `herramientas/imagenes/optimizar.ts` y `src/cocina/receta-real.test.ts`.
- **`pnpm optimizar` necesita Chrome o Chromium instalado.** Convierte con el canvas del
  navegador para no agregar una dependencia de imágenes al proyecto.
- **Se perdieron las cabeceras de seguridad y la CSP** al salir de Caddy: Pages no deja
  definirlas. Recuperar la CSP con `<meta http-equiv>` está pendiente (`docs/SECURITY.md`).
- **Cada merge a `main` publica solo.** Lo único configurado en GitHub es
  Settings → Pages → Source: GitHub Actions.
