#!/usr/bin/env bash
#
# Camino de punta a punta: cada servicio contesta /health en su puerto publicado, y también
# a través del reverse proxy por /api/<servicio>/health, que es como llega el frontend.
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

comprobar() {
    local nombre=$1 url=$2 esperado=$3
    if esperar_200 "$url"; then
        cuerpo=$(curl -sf "$url")
        if printf '%s' "$cuerpo" | grep -q "\"servicio\":\"$esperado\""; then
            ok "$nombre → $url"
        else
            mal "$nombre contestó 200 pero no es $esperado: $cuerpo"
            fallos=$((fallos+1))
        fi
    else
        mal "$nombre no contestó 200 en 60 s: $url"
        fallos=$((fallos+1))
    fi
}

titulo "Puertos publicados"
# Los puertos del host salen del .env: si se mueven para convivir con otra aplicación,
# la prueba los sigue en vez de fallar contra el valor viejo.
puerto() { sed -n "s/^$1=//p" .env | tail -1; }
P_FRONTEND=$(puerto PUERTO_FRONTEND)

if esperar_200 "http://localhost:${P_FRONTEND}/health"; then ok "frontend → http://localhost:${P_FRONTEND}/health"; else mal "frontend no contestó"; fallos=$((fallos+1)); fi

titulo "A través del reverse proxy ($SITE_ADDRESS)"
if esperar_200 "$SITE_ADDRESS/" && curl -sf "$SITE_ADDRESS/" | grep -q '<div id="raiz">'; then
    ok "la SPA se sirve en $SITE_ADDRESS/"
else
    mal "la SPA no se sirve en $SITE_ADDRESS/"
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
