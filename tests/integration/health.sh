#!/usr/bin/env bash
#
# Camino de punta a punta: la SPA se sirve, el catálogo que se generó en el build está en
# el bundle y sus fotos salen como imágenes.
#
# Se prueba SIEMPRE contra la aplicación en su puerto (PUERTO_APP), que es lo que existe
# en cualquier ambiente, y ADEMÁS a través del proxy si está prendido (ADR-016). Así la
# prueba sirve igual con el proxy propio, detrás del de otra aplicación o detrás de un
# balanceador de la nube.
#
# Necesita el stack arriba (docker compose up -d).
set -uo pipefail
. "$(dirname "$0")/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

[ -f .env ] || morir "falta .env (copiar .env.example)"
set -a; . ./.env; set +a
: "${SITE_ADDRESS:?falta SITE_ADDRESS en .env}"
: "${PUERTO_APP:?falta PUERTO_APP en .env}"

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

BASE=http://localhost:${PUERTO_APP}

# El puerto del host donde escucha el proxy; adentro del contenedor siempre es el 80.
puerto_del_proxy() { printf '%s' "${PUERTO_HTTP:?falta PUERTO_HTTP en .env}"; }

titulo "La aplicación en $BASE"
if esperar_200 "$BASE/" && curl -sf "$BASE/" | grep -q '<div id="raiz">'; then
    ok "la SPA se sirve"
else
    mal "la SPA no se sirve en $BASE/"
    fallos=$((fallos+1))
fi

# Una ruta del navegador no existe como archivo: tiene que caer en el index.html.
if curl -sf "$BASE/cualquier/ruta/de/la/spa" | grep -q '<div id="raiz">'; then
    ok "las rutas del navegador caen en el index.html"
else
    mal "una ruta de la SPA no devolvió el index.html"
    fallos=$((fallos+1))
fi

titulo "El proxy de la máquina (ADR-016)"
# El proxy es optativo: si COMPOSE_PROFILES no lo prende, no hay nada que comprobar y eso
# no es un fallo. Lo que sí sería un fallo es que esté levantado y no reparta.
if docker compose ps --services 2>/dev/null | grep -qx proxy; then
    if esperar_200 "$SITE_ADDRESS/" && curl -sf "$SITE_ADDRESS/" | grep -q '<div id="raiz">'; then
        ok "el proxy sirve la aplicación en $SITE_ADDRESS/"
    else
        mal "el proxy está arriba pero no sirve la aplicación en $SITE_ADDRESS/"
        fallos=$((fallos+1))
    fi

    # Un dominio de nadie tiene que dar 404. Por omisión Caddy contesta un 200 con el
    # cuerpo vacío, y entonces un vecino mal escrito —o un dominio que quedó apuntando acá
    # después de desinstalar su aplicación— se ve como éxito desde afuera.
    ajeno=$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: dominio.de.nadie.invalido' "http://localhost:$(puerto_del_proxy)/")
    if [ "$ajeno" = 404 ]; then
        ok "un dominio que no es de ninguna aplicación da 404"
    else
        mal "un dominio ajeno contestó $ajeno en vez de 404"
        fallos=$((fallos+1))
    fi
else
    aviso "el proxy no está levantado (COMPOSE_PROFILES sin \`proxy\`): se comprueba solo la aplicación"
fi

titulo "El catálogo generado en el build (ADR-006, ADR-015)"
# El catálogo dejó de ser un servicio: son archivos del bundle. Que estén y que digan
# algo es lo que antes garantizaba el inventario de /health.
recetas=$(curl -sf "$BASE/api/catalogo/recetas.json")
plato=$(printf '%s' "$recetas" | sed -n 's/.*"plato":"\([a-z0-9-]*\)".*/\1/p' | head -1)
if [ -n "$plato" ]; then
    ok "recetas.json trae al menos un plato: $plato"
else
    mal "recetas.json no trae ninguna receta: ${recetas:-sin respuesta}"
    fallos=$((fallos+1))
fi

# Un JSON que no existe tiene que dar 404 y no el index.html: si el try_files se comiera
# /api/, api.ts intentaría leer la página como si fuera una receta.
codigo=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/catalogo/recetas/no-existe/1.json")
if [ "$codigo" = 404 ]; then
    ok "una receta inexistente da 404 y no el index.html"
else
    mal "una receta inexistente contestó $codigo en vez de 404"
    fallos=$((fallos+1))
fi

foto=$(printf '%s' "$recetas" | sed -n 's|.*"foto":"\(/fotos/[^"]*\)".*|\1|p' | head -1)
if [ -z "$foto" ]; then
    aviso "ninguna receta declara foto: no hay nada que comprobar"
elif curl -sfI "$BASE/api/catalogo$foto" | grep -qi '^content-type: image/'; then
    ok "las fotos se sirven con su tipo: $foto"
else
    mal "la foto $foto no se sirve como imagen"
    fallos=$((fallos+1))
fi

exit "$fallos"
