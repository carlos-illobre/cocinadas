# Cocinadas

La receta como línea de tiempo viva: una app de celular que guía la preparación de un
plato paso a paso, cronometra cada paso, muestra los procesos que corren en paralelo
(descongelado, agua, pasta, brócoli tapado) con alarmas, y guarda los tiempos de cada
cocinada para ver cómo va mejorando cada receta.

El repositorio tiene dos mitades que se alimentan entre sí:

| Carpeta | Qué es |
|---|---|
| `data/recetas/`, `data/ingredientes/`, `data/utencillos/` | **El catálogo**: recetas como POE (HTML + PDF imprimible + JSON de datos), fichas de ingredientes con foto y fichas de utensilios. Es contenido, no código; la app lo lee tal cual. |
| `microservices/frontend/`, `tests/`, `deployment/`, `docs/` | **La aplicación**: una SPA React + TypeScript que se sirve como archivos estáticos, con el catálogo generado adentro, y todo lo necesario para probarla, desplegarla y entenderla. |
| `docs/mockups/` | El diseño visual de la app: el mockup HTML de la pantalla de cocina (`app-cocina-mockup.html`), el concepto de la pantalla de bienvenida y en `inicio-capas/` los originales de las capas de esa pantalla, con el script que genera las versiones livianas que usa la app. |

## El mockup navegable

El diseño de las pantallas de catálogo (lista de recetas, detalle, mise en place, progreso
y ajustes) sale de un prototipo hecho en Figma Make, que se puede recorrer como si fuera la
app:

**https://www.figma.com/make/ktWkl4C92atKONL5GR4Gn5/Cocinadas**

Se abre el archivo y con el botón **Preview** se navega el prototipo a pantalla completa.
Hace falta que Figma te haya dado acceso al archivo. De ahí salen los colores, las
tipografías (Nunito y Space Mono) y los dos temas, claro y oscuro, que la app implementa
en `microservices/frontend/src/estilos.css`. El prototipo tiene además pantallas que la app
no implementa a propósito: login por nombre, logros, rachas y dificultad.

## Cómo levantarlo

Hace falta Docker con el plugin Compose, Node 22 y pnpm 10 (para las pruebas y el
desarrollo fuera de Docker).

```bash
cp .env.example .env
docker compose up -d --build
```

Hay **un solo contenedor**. Cuando está `healthy`, la app está en **http://localhost/** y
el catálogo, que es parte del bundle, en `http://localhost/api/catalogo/recetas.json`.

Los puertos del lado del host salen del `.env` (`PUERTO_HTTP`, `PUERTO_HTTPS`): si la
máquina ya tiene otra aplicación en el 80 o el 443, se mueven ahí y nada más. Para
compartir la VM con otra aplicación, ver «Convivir con otra aplicación en la misma VM» en
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Para desarrollar con recarga en caliente, sin Docker:

```bash
cd microservices/frontend && pnpm install && pnpm dev
```

`pnpm dev` genera el catálogo desde `data/` y levanta Vite en el 5173. Si se toca una
receta o una ficha, hay que volver a correr `pnpm generar:catalogo`: el catálogo se arma
en el build, no en cada petición (ADR-015).

## Cómo se prueba

```bash
bash tests/utest.sh            # unitarias de todo, con compuerta del 100 % de cobertura
bash tests/itest.sh --rapido   # paridad de configuración, sin levantar nada
bash tests/itest.sh            # lo anterior más el camino de punta a punta (stack arriba)
bash tests/mutation.sh         # mutation testing: informa, no reprueba
```

El detalle de los niveles, las exclusiones de cobertura y el resultado del mutation
testing está en [docs/TESTING.md](docs/TESTING.md).

## Cómo se despliega

Al mergear a `main`, el CI publica la imagen y despliega solo a una VM de Oracle Cloud.
A mano, cuando hace falta volver atrás o probar:

```bash
python deployment/oracle-single/deploy.py          # el último commit verificado de main
python deployment/oracle-single/deploy.py <sha>    # un commit concreto, o volver atrás
```

Guía completa en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## El catálogo

**No hay backend.** El catálogo son archivos que se generan al compilar leyendo `data/`, y
que la app pide bajo `/api/catalogo/` como cualquier otro archivo del bundle. El prefijo
`/api/` se conserva a propósito: es por donde vuelve un backend el día que las cocinadas
tengan que salir del celular (ver [ADR-015](docs/adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)).

| Archivo | Qué tiene |
|---|---|
| `/api/catalogo/recetas.json` | Un resumen por plato: nombre, momento, porciones, nutrición, `foto` y sus `versiones` (número, clave, título, duración). |
| `/api/catalogo/recetas/<plato>/<version>.json` | La receta completa (`data/recetas/esquema-receta.md`) con la ruta de la foto de cada ingrediente y utensilio resuelta. `<version>` es la clave (`dos-etapas`) o el número (`2`); se escriben las dos. |
| `/api/catalogo/fotos/recetas/<plato>.<ext>` | La foto del plato terminado, con caché de un día. |
| `/api/catalogo/fotos/ingredientes/<id>.<ext>`, `/api/catalogo/fotos/utensilios/<id>.<ext>` | La primera imagen enlazada en la ficha. Solo se copian al bundle las que alguna receta usa. |

Las cocinadas, el tema y la cocinada en curso viven en el `localStorage` del teléfono
(`cocinadas.historial`, `cocinadas.tema`, `cocinadas.cocinando`). No salen de ahí.

## Dónde leer más

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): qué hace cada pieza, cómo se comunican y
  qué ADR respalda cada decisión.
- [docs/adr/README.md](docs/adr/README.md): el índice de decisiones de arquitectura.
- [docs/SECURITY.md](docs/SECURITY.md): amenazas, qué las mitiga y qué queda abierto.
- [docs/adr/ADR-015…](docs/adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md): por qué
  el proyecto pasó de cuatro servicios a uno, y qué hace falta para volver atrás.
- [data/recetas/README.md](data/recetas/README.md), [data/ingredientes/README.md](data/ingredientes/README.md),
  [data/utencillos/README.md](data/utencillos/README.md): las convenciones del catálogo.
