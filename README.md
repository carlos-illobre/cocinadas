# Templa

La receta como línea de tiempo viva: una app de celular que guía la preparación de un
plato paso a paso, cronometra cada paso, muestra los procesos que corren en paralelo
(descongelado, agua, pasta, brócoli tapado) con alarmas, y guarda los tiempos de cada
cocinada para ver cómo va mejorando cada receta.

El repositorio tiene dos mitades que se alimentan entre sí:

| Carpeta | Qué es |
|---|---|
| `data/recetas/`, `data/ingredientes/`, `data/utencillos/` | **El catálogo**: recetas como POE (HTML + PDF imprimible + JSON de datos), fichas de ingredientes con foto y fichas de utensilios. Es contenido, no código; la app lo lee tal cual. |
| `microservices/`, `infrastructure/`, `tests/`, `deployment/`, `docs/` | **La aplicación**: tres microservicios Node + TypeScript, una SPA React, un reverse proxy, y todo lo necesario para probarla, desplegarla y entenderla. |
| `docs/mockups/` | El diseño visual aprobado de la app (`app-cocina-mockup.html`), del que sale el sistema de diseño del frontend. |

## Cómo levantarlo

Hace falta Docker con el plugin Compose, Node 22 y pnpm 10 (para las pruebas y el
desarrollo fuera de Docker).

```bash
cp .env.example .env            # y cambiar POSTGRES_PASSWORD y JWT_SECRET
docker compose up -d --build
```

Cuando los ocho contenedores están `healthy`:

| URL | Qué hay |
|---|---|
| http://localhost/ | La SPA, a través del reverse proxy |
| http://localhost/api/catalogo/health | `catalogo`, con el inventario de recetas, ingredientes y utensilios que lleva la imagen |
| http://localhost/api/usuarios/health | `usuarios` |
| http://localhost/api/cocinadas/health | `cocinadas` |
| http://localhost:3001 · 3002 · 3003 · 8080 | Los mismos servicios sin pasar por el proxy |

Para desarrollar un servicio con recarga en caliente contra el resto del stack en Docker:

```bash
cd microservices/catalogo && pnpm install && pnpm dev
```

Para el frontend, `pnpm dev` en `microservices/frontend` levanta Vite en el puerto 5173 con
las llamadas a `/api/...` reenviadas a los servicios publicados por el compose.

## Cómo se prueba

```bash
bash tests/utest.sh            # unitarias de todo, con compuerta del 100 % de cobertura
bash tests/itest.sh --rapido   # paridad de configuración y contratos, sin levantar nada
bash tests/itest.sh            # lo anterior más el camino de punta a punta (stack arriba)
bash tests/mutation.sh         # mutation testing: informa, no reprueba
```

El detalle de los niveles, las exclusiones de cobertura y el resultado del mutation
testing está en [docs/TESTING.md](docs/TESTING.md).

## Cómo se despliega

En una VM de Oracle Cloud con Docker, por SHA de commit y con reversión:

```bash
bash deployment/oracle-single/deploy.sh          # el último commit verificado de main
bash deployment/oracle-single/deploy.sh <sha>    # un commit concreto, o volver atrás
```

Guía completa en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## La API

Todos los servicios exponen `GET /health`. El catálogo, además (a través del proxy, con el
prefijo `/api/catalogo`):

| Método y ruta | Devuelve |
|---|---|
| `GET /recetas` | Un resumen por plato: nombre, momento, porciones, nutrición, `foto` y sus `versiones` (número, clave, título, duración). |
| `GET /recetas/:plato/:version` | La receta completa (`data/recetas/esquema-receta.md`) con la ruta de la foto de cada ingrediente y utensilio resuelta. `version` es la clave (`dos-etapas`) o el número (`2`). 404 si no existe. |
| `GET /recetas/:plato/foto` | La foto del plato terminado (JPEG), con caché de un día. |
| `GET /ingredientes/:id/foto`, `GET /utensilios/:id/foto` | La primera imagen enlazada en la ficha del ingrediente o utensilio. 404 si no tiene. |

Los identificadores son los nombres de archivo de las fichas; cualquier otra cosa (mayúsculas,
puntos, barras) responde 400 sin llegar al catálogo. Usuarios y cocinadas todavía no tienen
endpoints de dominio.

## Dónde leer más

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): qué hace cada pieza, cómo se comunican y
  qué ADR respalda cada decisión.
- [docs/adr/README.md](docs/adr/README.md): el índice de decisiones de arquitectura.
- [docs/SECURITY.md](docs/SECURITY.md): amenazas, qué las mitiga y qué queda abierto.
- [data/recetas/README.md](data/recetas/README.md), [data/ingredientes/README.md](data/ingredientes/README.md),
  [data/utencillos/README.md](data/utencillos/README.md): las convenciones del catálogo.
