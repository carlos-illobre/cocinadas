# Autocontenido (invariante 7): el contexto es esta carpeta y nada más.
#   docker build microservices/frontend
#
# La SPA se compila con Node y se sirve con Caddy en modo file server (ADR-013): la
# imagen final no lleva Node ni node_modules, solo los archivos estáticos.

# ── 1. Dependencias ──────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── 2. Compilación ───────────────────────────────────────────────────────────
FROM deps AS build
COPY tsconfig.json tsconfig.build.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
RUN pnpm build

# ── 3. Imagen final ──────────────────────────────────────────────────────────
FROM caddy:2-alpine AS runtime
# uid literal por la misma razón que en los servicios Node: los volúmenes guardan el
# número. Caddy necesita escribir su configuración derivada en /config y /data.
RUN addgroup -g 10001 -S app && adduser -u 10001 -G app -S -D -H app \
  && mkdir -p /config /data && chown -R app:app /config /data
COPY --chown=app:app Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=app:app /app/dist /srv
USER app
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
