# Se construye con contexto en la RAÍZ del repositorio: el build genera el catálogo
# leyendo data/recetas/, data/ingredientes/ y data/utencillos/ (ADR-006, ADR-015), así que
# la versión del catálogo es la del commit desplegado y una reversión también revierte las
# recetas. Es la excepción a que cada imagen se construya desde su propia carpeta.
#
#   docker build -f microservices/frontend/Dockerfile .
#
# La SPA se compila con Node y se sirve con Caddy en modo file server (ADR-013): la
# imagen final no lleva Node ni node_modules, solo los archivos estáticos.

# ── 1. Dependencias ──────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
# La imagen reproduce la ruta del repositorio (/repo/microservices/frontend con
# /repo/data al lado) en vez de aplanar todo en /app: generar.ts encuentra data/ por una
# ruta relativa a su propio archivo, y así esa ruta es la misma acá que en desarrollo.
WORKDIR /repo/microservices/frontend
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY microservices/frontend/package.json microservices/frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── 2. Compilación ───────────────────────────────────────────────────────────
FROM deps AS build
COPY microservices/frontend/tsconfig.json microservices/frontend/tsconfig.build.json ./
COPY microservices/frontend/vite.config.ts microservices/frontend/index.html ./
COPY microservices/frontend/public ./public
COPY microservices/frontend/src ./src
# Los datos al final: son lo que más cambia entre commits.
COPY data/recetas /repo/data/recetas
COPY data/ingredientes /repo/data/ingredientes
COPY data/utencillos /repo/data/utencillos
RUN pnpm build

# ── 3. Imagen final ──────────────────────────────────────────────────────────
FROM caddy:2-alpine AS runtime
# uid literal por la misma razón que en los servicios Node: los volúmenes guardan el
# número. Caddy necesita escribir su configuración derivada en /config y /data.
RUN addgroup -g 10001 -S app && adduser -u 10001 -G app -S -D -H app \
  && mkdir -p /config /data && chown -R app:app /config /data
COPY --chown=app:app microservices/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=app:app /repo/microservices/frontend/dist /srv
USER app
EXPOSE 80 443
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8081/salud || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
