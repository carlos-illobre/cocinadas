# Cocinadas

**La app: <https://carlos-illobre.github.io/cocinadas/>**

La receta como línea de tiempo viva: una app de celular que guía la preparación de un
plato paso a paso, cronometra cada paso, muestra los procesos que corren en paralelo
(descongelado, agua, pasta, brócoli tapado) con alarmas, y guarda los tiempos de cada
cocinada para ver cómo va mejorando cada receta.

Es **solo frontend**: un sitio estático que se baja entero al teléfono, con el catálogo de
recetas adentro. No hay servidor ni base de datos — las cocinadas se guardan en el
`localStorage` del navegador. El porqué está en
[ADR-017](docs/adr/ADR-017-sitio-estatico-en-github-pages.md).

| Carpeta | Qué es |
|---|---|
| `data/recetas/`, `data/ingredientes/`, `data/utencillos/` | **El catálogo**: recetas como POE (HTML + PDF imprimible + JSON de datos), fichas de ingredientes con foto y fichas de utensilios. Es contenido, no código; la app lo lee tal cual. |
| `web/` | **La aplicación**: la SPA React + TypeScript y el generador que convierte el catálogo en los archivos que ella consume. |
| `tests/`, `docs/` | La compuerta de cobertura y la documentación. |

## Cómo se instala y se levanta

Hace falta **Node 22** y **pnpm 10**. Nada más: ni Docker, ni base de datos, ni servidor.

```bash
cd web && pnpm install && pnpm dev
```

Abre en <http://localhost:5173>. `pnpm dev` genera antes el catálogo leyendo `data/`; si
tocás una receta o una ficha, volvé a correr `pnpm generar:catalogo`.

Para ver exactamente lo que se publica:

```bash
cd web && pnpm build && pnpm preview
```

## Cómo se prueba

```bash
bash tests/utest.sh
```

Unitarias con **compuerta del 100 %** en instrucciones, ramas, funciones y líneas. El
detalle de qué se mide, qué está excluido y por qué, en [docs/TESTING.md](docs/TESTING.md).

## Cómo se publica

**Cada merge a `main` publica el sitio solo.** El CI corre las pruebas, compila y sube el
resultado a GitHub Pages; no hay que apretar nada ni entrar a ningún servidor. El detalle
está en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## El catálogo

No hay API: el catálogo son archivos que se generan al compilar leyendo `data/`, y que la
app pide como cualquier otro archivo del sitio.

| Archivo | Qué tiene |
|---|---|
| `api/catalogo/recetas.json` | Un resumen por plato: nombre, momento, porciones, nutrición, `foto` y sus `versiones` (número, clave, título, duración). |
| `api/catalogo/recetas/<plato>/<version>.json` | La receta completa ([esquema](data/recetas/esquema-receta.md)) con la ruta de la foto de cada ingrediente y utensilio resuelta. `<version>` es la clave (`dos-etapas`) o el número (`2`); se escriben las dos. |
| `api/catalogo/fotos/recetas/<plato>.<ext>` | La foto del plato terminado. |
| `api/catalogo/fotos/ingredientes/<id>.<ext>`, `api/catalogo/fotos/utensilios/<id>.<ext>` | La primera imagen enlazada en la ficha. Solo se copian las que alguna receta usa. |

Se conserva el prefijo `api/` a propósito, aunque no haya ninguna API detrás: es por donde
entraría un backend el día que las cocinadas tengan que salir del celular.

Las cocinadas, el tema y la cocinada en curso viven en el `localStorage`
(`cocinadas.historial`, `cocinadas.tema`, `cocinadas.cocinando`). No salen del teléfono.

## El mockup navegable

El diseño de las pantallas sale de un prototipo hecho en Figma Make, que se puede recorrer
como si fuera la app:

**<https://www.figma.com/make/ktWkl4C92atKONL5GR4Gn5/Cocinadas>**

Se abre el archivo y con el botón **Preview** se navega a pantalla completa. Hace falta que
Figma te haya dado acceso. De ahí salen los colores, las tipografías (Nunito y Space Mono)
y los dos temas, claro y oscuro, que la app implementa en `web/src/estilos.css`. El
prototipo tiene además pantallas que la app no implementa a propósito: login por nombre,
dificultad y los cronómetros por paso independientes.

El resto del diseño visual está en `docs/mockups/`: el mockup HTML de la pantalla de
cocina, el concepto de la bienvenida, y en `inicio-capas/` los originales de las capas de
esa pantalla con el script que genera las versiones livianas.

## Dónde leer más

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): qué hace cada pieza y qué ADR respalda cada
  decisión.
- [docs/adr/README.md](docs/adr/README.md): el índice de decisiones de arquitectura, con
  las que se dieron de baja y por qué.
- [docs/TESTING.md](docs/TESTING.md) y [docs/SECURITY.md](docs/SECURITY.md).
- [data/recetas/README.md](data/recetas/README.md), [data/ingredientes/README.md](data/ingredientes/README.md),
  [data/utencillos/README.md](data/utencillos/README.md): las convenciones del catálogo.
