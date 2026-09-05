# Se construye con contexto en la RAÍZ del repositorio (ADR-006): la imagen empaqueta las
# carpetas data/recetas/, data/ingredientes/ y data/utencillos/, así que la versión del catálogo es la
# del commit desplegado y una reversión también revierte las recetas.
#
#   docker build -f microservices/catalogo/Dockerfile .
#
# Las capas van de lo que menos cambia a lo que más: dependencias, código, datos.

# ── 1. Dependencias ──────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY microservices/catalogo/package.json microservices/catalogo/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── 2. Compilación ───────────────────────────────────────────────────────────
FROM deps AS build
COPY microservices/catalogo/tsconfig.json ./
COPY microservices/catalogo/src ./src
RUN pnpm build && pnpm prune --prod

# ── 3. Imagen final ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
# uid literal (no asignado por el sistema): los volúmenes guardan el número, y si cambia
# entre versiones el contenedor deja de poder escribir sin ninguna explicación.
RUN addgroup -g 10001 -S app && adduser -u 10001 -G app -S -D -H app
WORKDIR /app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app microservices/catalogo/package.json ./
# Los datos van al final porque son lo que más cambia entre commits.
COPY --chown=app:app data/recetas /datos/recetas
COPY --chown=app:app data/ingredientes /datos/ingredientes
COPY --chown=app:app data/utencillos /datos/utencillos
USER app
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/server.js"]
