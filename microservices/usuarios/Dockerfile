# Autocontenido (invariante 7): el contexto es esta carpeta y nada más.
#   docker build microservices/usuarios
# Las capas van de lo que menos cambia a lo que más: dependencias, luego código.

# ── 1. Dependencias ──────────────────────────────────────────────────────────
FROM node:26-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── 2. Compilación ───────────────────────────────────────────────────────────
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build && pnpm prune --prod

# ── 3. Imagen final ──────────────────────────────────────────────────────────
FROM node:26-alpine AS runtime
# uid literal (no asignado por el sistema): los volúmenes guardan el número, y si cambia
# entre versiones el contenedor deja de poder escribir sin ninguna explicación.
RUN addgroup -g 10001 -S app && adduser -u 10001 -G app -S -D -H app
WORKDIR /app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./
USER app
EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3002/health || exit 1
CMD ["node", "dist/server.js"]
