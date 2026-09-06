#!/usr/bin/env bash
#
# Camino de punta a punta contra el único contenedor: la SPA se sirve, el catálogo que se
# generó en el build está en el bundle y sus fotos salen como imágenes.
# Necesita el stack arriba (docker compose up -d).
set -uo pipefail
. "$(dirname "$0")/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

[ -f .env ] || morir "falta .env (copiar .env.example)"
set -a; . ./.env; set +a
: "${SITE_ADDRESS:?falta SITE_ADDRESS en .env}"

fallos=0

# Espera hasta 60 s a que una URL conteste 200; el healthcheck del compose ya lo hace por
# contenedor, pero acá se comprueba desde afuera, que es lo que ve el usuario.
esperar_200() {
    local url=$1
    for _ in $(seq 1 30); do
        if curl -sf -o /dev/null "$url"; then return 0; fi
        sleep 2
    done
    return 1
}

titulo "La aplicación en $SITE_ADDRESS"
if esperar_200 "$SITE_ADDRESS/" && curl -sf "$SITE_ADDRESS/" | grep -q '<div id="raiz">'; then
    ok "la SPA se sirve en $SITE_ADDRESS/"
else
    mal "la SPA no se sirve en $SITE_ADDRESS/"
    fallos=$((fallos+1))
fi

# Una ruta del navegador no existe como archivo: tiene que caer en el index.html.
if curl -sf "$SITE_ADDRESS/cualquier/ruta/de/la/spa" | grep -q '<div id="raiz">'; then
    ok "las rutas del navegador caen en el index.html"
else
    mal "una ruta de la SPA no devolvió el index.html"
    fallos=$((fallos+1))
fi

titulo "El catálogo generado en el build (ADR-006, ADR-015)"
# El catálogo dejó de ser un servicio: son archivos del bundle. Que estén y que digan
# algo es lo que antes garantizaba el inventario de /health.
recetas=$(curl -sf "$SITE_ADDRESS/api/catalogo/recetas.json")
plato=$(printf '%s' "$recetas" | sed -n 's/.*"plato":"\([a-z0-9-]*\)".*/\1/p' | head -1)
if [ -n "$plato" ]; then
    ok "recetas.json trae al menos un plato: $plato"
else
    mal "recetas.json no trae ninguna receta: ${recetas:-sin respuesta}"
    fallos=$((fallos+1))
fi

# Un JSON que no existe tiene que dar 404 y no el index.html: si el try_files se comiera
# /api/, api.ts intentaría leer la página como si fuera una receta.
codigo=$(curl -s -o /dev/null -w '%{http_code}' "$SITE_ADDRESS/api/catalogo/recetas/no-existe/1.json")
if [ "$codigo" = 404 ]; then
    ok "una receta inexistente da 404 y no el index.html"
else
    mal "una receta inexistente contestó $codigo en vez de 404"
    fallos=$((fallos+1))
fi

foto=$(printf '%s' "$recetas" | sed -n 's|.*"foto":"\(/fotos/[^"]*\)".*|\1|p' | head -1)
if [ -z "$foto" ]; then
    aviso "ninguna receta declara foto: no hay nada que comprobar"
elif curl -sfI "$SITE_ADDRESS/api/catalogo$foto" | grep -qi '^content-type: image/'; then
    ok "las fotos se sirven con su tipo: $foto"
else
    mal "la foto $foto no se sirve como imagen"
    fallos=$((fallos+1))
fi

exit "$fallos"
