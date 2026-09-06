# ADR-018: Un E2E de camino feliz con Playwright

**Estado:** Aceptado
**Fecha:** 2026-09-06

---

## Contexto

Al salir de Oracle (ADR-017) se borraron las pruebas de integración: probaban que el
stack de contenedores estuviera arriba, y ya no hay stack. Quedó un solo nivel, las
unitarias con la compuerta del 100 %, que es mucho pero no es todo: corren en jsdom,
contra el código fuente y con el catálogo simulado.

Hay una lista concreta de cosas que ese nivel **no puede ver**, y son justamente las que
rompieron este proyecto en producción:

- **Rutas absolutas.** Es el invariante 2 y el motivo de `base: './'`. Una ruta con barra
  inicial funciona en `localhost` y da 404 solo bajo `/cocinadas/`. El CI ya revisa el
  `index.html` compilado, pero solo el `index.html`.
- **El catálogo generado en el build.** Las unitarias le pasan datos a mano; que
  `pnpm generar:catalogo` haya escrito lo que la app pide, en la ruta que la app pide, no
  lo mira nadie.
- **Las imágenes.** Ya pasó una vez: `1.jpg` se convirtió a `1.webp` y quedaron tres
  lugares pidiendo el `.jpg`. Los tests seguían en verde y la pantalla de inicio quedó sin
  fondo. Lo encontré mirando una captura.
- **El `localStorage` de verdad**, entre recargas y con el botón de atrás.

## Opciones consideradas

**Seguir sin E2E y mirar capturas a mano.** Es lo que veníamos haciendo, y encontró los
dos errores de arriba, así que no es una opción tonta. Pero solo funciona cuando alguien
se acuerda de mirar, y no mira nunca lo mismo dos veces.

**Cypress.** Es la alternativa obvia y madura. Tiene un modo interactivo mejor. Pero para
lo que necesitamos —un navegador, un tamaño de celular, correr en el CI— la ventaja no
aparece, y Playwright emula dispositivos de fábrica (`devices['Pixel 7']`) y ya trae el
servidor de desarrollo, el informe HTML y las trazas sin agregar nada.

**Subir la exigencia de las unitarias en vez de agregar un nivel.** Parecía la más
alineada con el proyecto: un solo nivel, la compuerta ya en 100 %. No sirve, y el motivo
es de raíz: ninguna prueba en jsdom baja un archivo. `<img src="…">` en jsdom no pide
nada, así que una foto que no existe no se distingue de una que sí. El problema no es
cuánto se exige, es dónde se corre.

**Escribir muchos E2E.** Es la trampa clásica: son lentos, son frágiles y terminan
duplicando lo que las unitarias ya prueban mejor y en un segundo.

## Decisión

**Un solo E2E, el camino feliz completo, con Playwright, contra el sitio compilado.**

- Contra `pnpm build` + `pnpm preview`, no contra `vite dev`: lo que se publica es el
  build, con sus rutas relativas y su catálogo escrito.
- Un solo navegador (Chromium) y un solo dispositivo (Pixel 7). La app es solo para
  celular; probar un escritorio de 1280 px sería probar una pantalla que nadie usa.
- Cocina lo más rápido que se pueda tocar, sin esperar los tiempos de la receta. El
  resultado son 0 XP y está bien: lo que se comprueba es que el recorrido llegue hasta el
  final. El puntaje ya lo miden `src/xp.test.ts` y `App.test.tsx`, en un segundo y con
  todos los casos de borde.
- **No tiene compuerta de cobertura y no la va a tener.** Su trabajo es que el camino
  entero funcione en un navegador, no medir líneas. La cobertura sigue siendo cosa de las
  unitarias.
- Job propio en el CI, separado de `pruebas`, porque necesita bajar ~100 MB de navegador:
  si estuviera en el mismo job, un cambio de una línea de CSS pagaría esa descarga antes
  de saber si las unitarias pasan. `publicar` ahora depende de los dos.

## Consecuencias

**Positivas**

- Las cuatro cosas de la lista de arriba pasan a estar cubiertas por algo que corre solo.
- Cuando falla, deja traza, capturas y video del reintento: se ve qué pantalla estaba y
  qué había en ella, que es lo que más cuesta reconstruir de un fallo del CI.
- Es documentación ejecutable del recorrido: el archivo se lee como el guion de una
  cocinada.

**Negativas**

- Una dependencia más y un navegador de ~100 MB en el CI. Es la mitad del costo del job.
- Es sensible a los textos de los botones. Se eligieron localizadores por rol y nombre
  accesible a propósito —fallan con un mensaje que dice qué botón no encontró—, pero
  renombrar «Listo, siguiente ✓» rompe la prueba. Es un costo aceptado: si cambia un
  botón, que algo lo note.
- Si cambia la receta —otro número de pasos, otra mise en place— hay que tocar la prueba.
  El bucle de los pasos avanza por lo que hay en pantalla justamente para amortiguar eso,
  pero el «25 items» está escrito.

**Lo que no cambia**

- Las unitarias siguen con la compuerta del 100 % y siguen siendo el nivel principal.
- El E2E no reemplaza mirar capturas cuando el trabajo es visual: comprueba que las cosas
  estén, no que se vean bien.

## Cuándo revisarla

- Si aparece una segunda receta con otra forma, para decidir si la prueba se parametriza
  o si se congela una receta de prueba.
- Si el E2E empieza a fallar por motivos que no son errores (parpadeos), antes de agregarle
  reintentos: un E2E que falla al azar se ignora, y entonces no sirve para nada.
- El día que haya enlaces profundos o un service worker: los dos cambian cómo carga la app
  y este es el único lugar donde eso se puede probar.

## Referencias

- `web/playwright.config.ts` y `web/e2e/primera-cocinada.spec.ts`
- `docs/TESTING.md`
- ADR-017 (por qué se fueron las pruebas de integración), ADR-010 (pnpm y Vitest)
