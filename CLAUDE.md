# Cocinadas

Contexto que no se deduce leyendo el código. Lo demás está en el [README](README.md), en
[docs/](docs/) y en los [ADR](docs/adr/), que son la explicación larga de cada decisión:
antes de cambiar algo que tenga un ADR, leelo.

## Cómo trabaja Claude acá

- **Nunca una ruta fuera de la carpeta del proyecto**, ni siquiera como texto dentro de
  un comando: `/tmp`, `~/.claude`, `../algo`, un `#!/bin/sh`, un literal que empiece con
  `/`. Todo lo temporal va en `tmp/` (en el `.gitignore`) y se limpia al terminar.
- **Una rama por pedido.** Carlos sube las ramas y abre los PR; Claude no tiene token.
  Si un pedido depende de otro sin mergear, la rama se apila sobre esa y se dice el orden.
- **Lo visual se verifica con capturas** (Playwright, Pixel 7, los dos temas), no leyendo
  el CSS: dos errores de esta sesión solo aparecieron en una captura. El Chromium del
  contenedor no tiene fuentes de emoji: los □ en las capturas no son un error.
- El prototipo de Figma es un archivo **Make**: el conector no puede editarlo ni leer su
  código. El código se lee del bundle publicado en
  <https://neat-jelly-56883574.figma.site> (`assets/index-*.js` y `.css`).

## Cómo se escribe acá

- **Todo en español**: código, comentarios, commits, documentación y textos de la app,
  con voseo («tocá», «entrá»). Las carpetas también: `pantallas/`, `componentes/`.
- Los comentarios explican **por qué**, no qué. Si se deduce del código, sobra.
- Commits: qué cambió y por qué, en imperativo.
- En la documentación **no se escribe lo que no está**: si no aparece, es porque no está.

## Invariantes que no se negocian

1. **Cobertura del 100 %** en `web/src/**` y `web/herramientas/**`, con compuerta en
   `vite.config.ts`. Lo que no se puede probar se extrae a un módulo medible y afuera
   queda solo la llamada al sistema (`docs/TESTING.md`, cuatro exclusiones justificadas).
2. **`tsc` y ESLint sin avisos** (`pnpm lint`), con las reglas de tipos estrictas. Tres
   reglas están apagadas a propósito y dicen por qué en `web/eslint.config.js`.
3. **Todas las rutas son relativas.** Pages sirve en `/cocinadas/`; una ruta con `/`
   inicial da 404 solo en producción (ADR-017). El CI revisa el `index.html` compilado.
4. **No se crea nada «para después».** Lección de ADR-015.
5. **Un ADR viejo nunca se reescribe**: se le agrega una enmienda al final.

## Cómo está armado

Sitio estático en GitHub Pages (<https://carlos-illobre.github.io/cocinadas/>): una SPA
que se baja entera al teléfono, catálogo incluido. Las cocinadas viven en el
`localStorage` (`cocinadas.historial`, `cocinadas.tema`, `cocinadas.cocinando`).
**Cada merge a `main` publica solo.**

`web/` se divide por dónde corre cada cosa:

- `src/` va al navegador: `pantallas/` (una por archivo; la cocina es una carpeta de
  siete), `componentes/` (lo compartido, incluido `Recuperacion`, el límite de error),
  y dominio puro por tema: `cocina/` (modelo, cocinada en curso, sonido), `historial/`,
  `progreso/` (experiencia y logros), `api.ts` (cliente del catálogo y tipos), `tema.ts`.
- `herramientas/` corre en Node: el generador del catálogo y el optimizador de imágenes.
- `e2e/` son las pruebas de Playwright: el camino feliz entero contra `pnpm build`, y
  los sonidos (ADR-018). Sin compuerta de cobertura, a propósito.

El catálogo **se genera en el build**: `herramientas/catalogo/catalogo.ts` lee `data/` y
decide (puro); `generar.ts` escribe en `web/public/api/catalogo/`, que no se versiona.
Las imágenes tienen dos vidas: originales en `data/` y `docs/mockups/`, y las versiones
publicadas en `web/assets/` (WebP, al tamaño que se muestran), que se regeneran con
`pnpm optimizar`. Si falta una, el build corta y dice cuál.

La CSP va como `<meta>` inyectado por `vite.config.ts` **solo en el build**
(`docs/SECURITY.md`). El historial de por qué esto fue microservicios y dejó de serlo:
ADR-015 y ADR-017; los ADR 001 a 016 son historia.

## El producto

- App **solo para celular**, que guía una receta como una línea de tiempo viva. Se lee de
  parado, a un brazo del teléfono: **la tipografía chica ya se subió dos veces** (+3 px
  sobre el original); nada informativo por debajo de 13,5 px.
- Las recetas son POE: cero desperdicio, sin sal agregada, una porción, y el reloj arranca
  al abrir el freezer. El tiempo declarado incluye descongelar, lavar y cortar.
- **Gamificada, premiando la precisión y no la velocidad.** Criterio (del prototipo,
  `src/progreso/xp.ts`, `desgloseDe`): 200 por completar, 100 de bonus si el total quedó
  a ±10 % del previsto —simétrico a propósito—, 10 por cada paso que no se pasó del suyo.
  Provisional hasta que Carlos lo confirme. El logro «en tiempo» usa la misma regla.
- **Al terminar el último paso no se salta a los resultados**: la tarjeta se vuelve
  «Receta completada» con un botón, y el confeti y el sonido arrancan al tocarlo.
- El gráfico de progreso es **puntos contra la línea del objetivo**, con escala simétrica:
  la distancia a la línea es el desempeño.
- Del prototipo se dejaron afuera a propósito: login por nombre, dificultad, cronómetros
  por paso independientes, el guardado automático (acá es explícito) y, por ahora, el
  cartel modal «Logro desbloqueado» y los sub-pasos numerados.

## Los datos son contenido, no código

`data/recetas/`, `data/ingredientes/` y `data/utencillos/` son el catálogo. Cada versión
de una receta es un HTML imprimible, un PDF y un **JSON que es lo que la app usa**
(`data/recetas/esquema-receta.md`); los tres tienen que decir lo mismo.
`python data/recetas/validar-receta.py` lo comprueba. Las recetas las genera la skill
`receta-poe-fitness`, que vive fuera del repositorio.

## Comandos

```bash
cd web && pnpm lint                          # tsc + ESLint
cd web && pnpm test:cov                      # unitarias, con la compuerta del 100 %
cd web && pnpm e2e                           # Playwright contra el build (una vez: pnpm exec playwright install chromium)
cd web && pnpm dev                           # la app en http://localhost:5173
cd web && pnpm generar:catalogo              # tras tocar una receta o una ficha
cd web && pnpm optimizar                     # tras agregar o cambiar una imagen (necesita Chrome/Chromium)
cd web && pnpm build && pnpm preview         # exactamente lo que se publica
python3 data/recetas/validar-receta.py       # el catálogo del repositorio es válido
```

## Trampas conocidas

- **Pages cachea 10 minutos** (`max-age=600`, no se puede cambiar). Para ver un cambio ya:
  abrir la URL con `?x=1` (otro número cada vez). El acceso directo instalado se actualiza
  solo: no hay service worker; solo si cambia el manifest hay que reinstalarlo.
- **Un ancestro con `transform` es el bloque contenedor de sus hijos `position: fixed`.**
  La animación de entrada de `.pantalla` no deja `transform` puesto (sin fill-mode) y el
  confeti es hermano del `<main>`, no hijo. El E2E mide que el confeti cubra la ventana.
- **Todas las pantallas viven en el mismo documento**: el desplazamiento no se reinicia
  solo. `App` lo hace al cambiar de pantalla y `Cocina` al cambiar de fase.
- **`prefers-reduced-motion`** apaga la animación de entrada y el rebote del trofeo; el
  confeti se oculta entero. Si «no se ven las animaciones», mirar eso y el ahorro de
  batería antes que el código.
- **En WSL, el `pnpm` de Windows puede pisar al de Linux** en el PATH y fallar con
  «Invalid argument». Usar el de nvm: `PATH="$HOME/.nvm/versions/node/<v>/bin:$PATH"`.
- **En Windows**, la carpeta del proyecto se llama `recetas` en minúscula aunque el
  explorador la capitalice; instalar desde otra capitalización carga React dos veces.
- **`generar.ts`, `optimizar.ts` y `receta-real.test.ts` encuentran `data/` por una ruta
  relativa a su propio archivo.** Si se mueven de carpeta, hay que ajustarla.
- Lo que sigue **abierto** en seguridad está en `docs/SECURITY.md`: Google Fonts como
  único tercero, y las acciones del CI ancladas por etiqueta y no por SHA.
