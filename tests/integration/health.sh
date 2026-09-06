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
P_CATALOGO=$(puerto PUERTO_CATALOGO); P_USUARIOS=$(puerto PUERTO_USUARIOS)
P_COCINADAS=$(puerto PUERTO_COCINADAS); P_FRONTEND=$(puerto PUERTO_FRONTEND)

comprobar catalogo  "http://localhost:${P_CATALOGO}/health" catalogo
comprobar usuarios  "http://localhost:${P_USUARIOS}/health" usuarios
comprobar cocinadas "http://localhost:${P_COCINADAS}/health" cocinadas
if esperar_200 "http://localhost:${P_FRONTEND}/health"; then ok "frontend → http://localhost:${P_FRONTEND}/health"; else mal "frontend no contestó"; fallos=$((fallos+1)); fi

titulo "A través del reverse proxy ($SITE_ADDRESS)"
comprobar catalogo  "$SITE_ADDRESS/api/catalogo/health" catalogo
comprobar usuarios  "$SITE_ADDRESS/api/usuarios/health" usuarios
comprobar cocinadas "$SITE_ADDRESS/api/cocinadas/health" cocinadas
if esperar_200 "$SITE_ADDRESS/" && curl -sf "$SITE_ADDRESS/" | grep -q '<div id="raiz">'; then
    ok "la SPA se sirve en $SITE_ADDRESS/"
else
    mal "la SPA no se sirve en $SITE_ADDRESS/"
    fallos=$((fallos+1))
fi

titulo "El catálogo empaquetado en la imagen (ADR-006)"
inventario=$(curl -sf "http://localhost:${P_CATALOGO}/health" | sed -n 's/.*"catalogo":\({[^}]*}\).*/\1/p')
if printf '%s' "$inventario" | grep -qE '"recetas":[1-9]'; then
    ok "la imagen trae el catálogo: $inventario"
else
    mal "la imagen no trae recetas: ${inventario:-sin inventario}"
    fallos=$((fallos+1))
fi

exit "$fallos"
