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

1. **Un solo `docker-compose.yml`.** Lo que cambia entre ambientes sale del `.env` y de
   ningún otro lado (ADR-001).
2. **Sin valores por omisión en la configuración.** El compose usa `${VAR:?}`, así que
   falta una variable y no arranca. Fallar al arrancar es el único momento en que un error
   de configuración todavía es barato.
3. **Cobertura del 100 %**, con compuerta. Lo que no se puede probar se extrae a un módulo
   medible y afuera queda solo la llamada al sistema externo (ver `docs/TESTING.md` para
   las exclusiones, que son tres y están justificadas).
4. **El mutation testing no se corre en local**: tarda minutos. Corre en el job `mutacion`
   del CI, que informa y no reprueba. Solo se corre a mano si Carlos lo pide.
5. **El script de despliegue no se prueba ejecutándolo.** Se verifica leyéndolo y con
   `--dry-run`, que imprime cada comando remoto sin correrlo.
6. **No se crean servicios «para después».** Un servicio se crea cuando tiene una ruta que
   hace algo. Es la lección de ADR-015: `usuarios` y `cocinadas` vivieron meses sin nada
   más que `/health`, y cuando se borraron no había nada que rescatar.
7. **La configuración de otra aplicación no vive en este repositorio.** El proxy importa
   `vecinos/*.caddy` y cada app de la máquina trae el suyo; acá no se acumula nada ajeno
   (ADR-016).

## Cómo está armado

**No hay backend.** La aplicación es un contenedor: Caddy sirviendo una SPA que se baja
entera al teléfono, con el catálogo adentro. Las cocinadas viven en el `localStorage`
(`cocinadas.historial`, `cocinadas.tema`, `cocinadas.cocinando`).

**Delante hay un proxy que no es de la aplicación** (`infrastructure/proxy/`, ADR-016). En
la VM corre más de una app y el 80 y el 443 son de una sola, así que los ata una pieza
aparte que reparte por dominio. Es **optativa**: se prende con `COMPOSE_PROFILES=proxy` en
el `.env`. `infrastructure/` es justamente eso —lo que no es la aplicación y en producción
puede estar reemplazado por un servicio de la nube—, así que lo que se agregue ahí también
va bajo un perfil.

La aplicación es **inquilina**: escucha en `:80`, contesta a cualquier `Host` y no sabe por
qué dominio la llamaron. Lo suyo (cabeceras, CSP, ruteo de la SPA, caché) se queda en su
imagen; al proxy solo se le va el TLS y el reparto. Las otras apps de la máquina dejan su
bloque en `infrastructure/proxy/vecinos/` **en la VM**, no en este repositorio.

El catálogo **se genera en el build**: `src/catalogo/catalogo.ts` lee `data/` y devuelve
el plan de archivos (puro, medido al 100 %); `generar.ts` lo escribe en
`public/api/catalogo/`, que no se versiona. Tocar una receta obliga a `pnpm
generar:catalogo` en desarrollo, y a redesplegar en producción.

El porqué de todo esto, y **qué hace falta el día que las cocinadas tengan que salir del
celular**, está en `docs/adr/ADR-015-de-cuatro-servicios-a-una-spa-estatica.md`. Los ADR
002, 003, 004, 005, 007, 008 y 012 describen microservicios, NATS, PostgreSQL, Fastify,
Drizzle y JWT que el proyecto tuvo declarados y nunca usó: están **superados**, no
vigentes. Leerlos como historia, no como estado actual.

## El producto

- Es una app **solo para celular**. Guía una receta como una línea de tiempo viva.
- Las recetas son POE: las cuatro restricciones fijas son **cero desperdicio, sin sal
  agregada, una porción y el reloj arranca al abrir el freezer**. El tiempo declarado
  incluye descongelar, lavar y cortar; nunca se esconde tiempo.
- **Está gamificada, pero premia la precisión, no la velocidad**: los puntos salen de lo
  cerca que estuvo la cocinada de los tiempos de la receta (`src/xp.ts`, `puntosDe`). El
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
bash tests/utest.sh            # unitarias de todo, con la compuerta del 100 %
bash tests/itest.sh --rapido   # paridad de .env, sin levantar nada
bash tests/itest.sh            # lo anterior más el camino de punta a punta (stack arriba)
docker compose up -d --build   # levantar la app y el proxy en local
python deployment/oracle-single/deploy.py --dry-run   # ver qué haría un despliegue
```

## Trampas conocidas

- **En Windows**, la carpeta del proyecto se llama `recetas` en minúscula aunque el
  explorador la muestre capitalizada. Instalar dependencias desde la ruta con otra
  capitalización deja los enlaces de pnpm apuntando a otro lado y React se carga dos
  veces, con un error que no dice la causa.
- **En la VM de Oracle corre otra aplicación** que usa el 80, el 443 y el 8080. Los
  puertos del host salen del `.env` (`PROXY_ADDR`, `PUERTO_HTTP`, `PUERTO_HTTPS`) y el 80
  y el 443 son de una sola aplicación: ver «Convivir con otra aplicación» en
  `docs/DEPLOYMENT.md`.
- Stryker necesita `"plugins": ["@stryker-mutator/vitest-runner"]` explícito con pnpm.
- **El `try_files` de la SPA deja `/api/` afuera** a propósito. Si lo tapara, un JSON que
  no existe devolvería el `index.html` con 200 y `api.ts` leería la página como si fuera
  una receta. Hay una prueba de integración que lo cuida.
- **La imagen se construye desde la raíz del repositorio** (`docker build -f
  microservices/frontend/Dockerfile .`), porque el build necesita `data/`. La imagen
  reproduce la ruta del repo (`/repo/microservices/frontend` con `/repo/data` al lado)
  para que `generar.ts` encuentre los datos por la misma ruta relativa que en desarrollo.
- **Cada merge a `main` despliega solo.** Si el entorno `produccion` de GitHub llegara a
  tener «required reviewers», el despliegue queda esperando aprobación y deja de ser
  automático.
- **`--remove-orphans` NO baja un servicio apagado por perfil.** Sacar `proxy` de
  `COMPOSE_PROFILES` no lo apaga: el contenedor viejo se queda con el 80 y el 443 justo
  cuando se los querías dar a otra aplicación. `deploy.py` compara `config --services`
  contra `ps --services` y baja la diferencia; a mano es `docker compose rm -sf proxy`.
- **Un vecino se alcanza por `host.docker.internal`, no por `127.0.0.1`**: el proxy corre
  en un contenedor y `127.0.0.1` es su propio loopback. Cocinadas no lo necesita porque
  comparte el compose con el proxy y se resuelve por nombre de servicio (`web:80`).
