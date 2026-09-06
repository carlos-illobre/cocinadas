#!/usr/bin/env bash
#
# Actualiza la instancia de Oracle con lo que hay en la rama principal (ADR-011).
#
# Se ejecuta DESDE ESTA MÁQUINA, no desde la instancia.
#
#   bash deployment/oracle-single/deploy.sh            el último commit verificado de main
#   bash deployment/oracle-single/deploy.sh <sha>      un commit concreto, o volver atrás
#   bash deployment/oracle-single/deploy.sh --dry-run  imprime los comandos sin ejecutarlos
#
# Todo sale de deployment/oracle-single/.env, así que este archivo no contiene ningún
# dato del despliegue y se puede versionar sin filtrar nada.
#
# ── Por qué por SHA y no por `latest` ──
#
# `latest` es una etiqueta móvil: sirve para «dame lo último», no para saber qué está
# corriendo. Con el SHA fijado, `docker compose ps` dice exactamente qué versión hay, la
# reversión es determinística, y dos despliegues del mismo commit no traen cosas distintas.
#
# NO se prueba ejecutándolo: se verifica leyéndolo, con `bash -n`, y con --dry-run.
set -euo pipefail

# La raíz se resuelve con git y no contando `..`: así el script funciona desde cualquier
# directorio y sigue funcionando si algún día cambia de carpeta. Un `cd ../..` es correcto
# exactamente a la profundidad de hoy y falla en silencio a cualquier otra.
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" \
    || { printf '\n\033[0;31m✗ no encuentro la raíz del repositorio\033[0m\n' >&2; exit 1; }

ok()    { printf '  \033[0;32m✓\033[0m %s\n' "$1"; }
info()  { printf '    %s\n' "$1"; }
paso()  { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }
morir() { printf '\n\033[0;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

DRY_RUN=no
ARGS=()
for a in "$@"; do
    case "$a" in
        --dry-run) DRY_RUN=si ;;
        *) ARGS+=("$a") ;;
    esac
done

# En --dry-run los comandos que tocan la instancia se imprimen en vez de correrse. Escrito
# desde el principio, no improvisado con un pipe: la forma de probar un script que
# despliega no es desplegando.
remoto() {
    if [ "$DRY_RUN" = si ]; then printf '    $ ssh %s %q\n' "$SSH" "$*"; else ssh "$SSH" "$@"; fi
}
copiar() {
    if [ "$DRY_RUN" = si ]; then printf '    $ scp %s %s\n' "$1" "$2"; else scp -q "$1" "$2"; fi
}

CONFIG=deployment/oracle-single/.env
[ -f "$CONFIG" ] || morir "falta $PWD/$CONFIG — copiar .env.deploy.example y completarlo"
set -a; . "$CONFIG"; set +a

: "${SSH:?falta SSH en $CONFIG}"                    # usuario@ip
: "${RUTA_REMOTA:?falta RUTA_REMOTA en $CONFIG}"    # dónde vive el proyecto en la instancia

RAMA_PRINCIPAL=main
# Puertos de /health publicados en 127.0.0.1 de la instancia. Los define el .env de la
# VM, no este script: en una máquina compartida con otra aplicación se mueven ahí. Los
# valores de acá son el respaldo para --dry-run, que no llega a leer el .env remoto.
PUERTOS_POR_OMISION=("catalogo:3101" "usuarios:3102" "cocinadas:3103" "frontend:8180")

# Los puertos reales salen del .env de la instancia; si no se puede leer, los de arriba.
leer_puertos_remotos() {
    local salida
    salida=$(ssh "$SSH" "sed -n 's/^PUERTO_\(CATALOGO\|USUARIOS\|COCINADAS\|FRONTEND\)=//p' '$RUTA_REMOTA/.env'" 2>/dev/null) || return 1
    [ "$(echo "$salida" | grep -c .)" -eq 4 ] || return 1
    local puertos=()
    local i=0
    for servicio in catalogo usuarios cocinadas frontend; do
        i=$((i+1))
        puertos+=("$servicio:$(echo "$salida" | sed -n "${i}p")")
    done
    SERVICIOS_CON_HEALTH=("${puertos[@]}")
}

SERVICIOS_CON_HEALTH=("${PUERTOS_POR_OMISION[@]}")
if [ "$DRY_RUN" = si ]; then
    info "(modo --dry-run: nada de lo que sigue toca la instancia)"
else
    leer_puertos_remotos || info "no pude leer los PUERTO_* del .env remoto: uso los de por omisión"
fi

# ── Qué versión desplegar ────────────────────────────────────────────────────

paso "Resolviendo la versión"

if ! git fetch origin "$RAMA_PRINCIPAL" --quiet 2>/dev/null; then
    # Sin remoto no hay «último commit verificado»: en --dry-run se sigue con HEAD para
    # poder leer los comandos; en un despliegue real es un error.
    [ "$DRY_RUN" = si ] || morir "no se pudo consultar el remoto"
    info "(sin remoto: --dry-run usa HEAD local en vez de origin/$RAMA_PRINCIPAL)"
    git update-ref "refs/remotes/origin/$RAMA_PRINCIPAL" HEAD 2>/dev/null || true
fi

if [ ${#ARGS[@]} -gt 0 ]; then
    SHA=$(git rev-parse --verify "${ARGS[0]}^{commit}" 2>/dev/null) \
        || morir "'${ARGS[0]}' no es un commit de este repositorio"
    info "SHA pedido a mano: ${SHA:0:7}"
else
    # El último commit del remoto, no el de la copia local: desplegar lo que hay en el
    # disco es cómo termina en producción un commit que nunca pasó por el CI.
    SHA=$(git rev-parse "origin/$RAMA_PRINCIPAL")
    info "último de origin/$RAMA_PRINCIPAL: ${SHA:0:7}"
fi
ok "versión a desplegar: ${SHA:0:7}"

# ── Qué había antes, para poder volver ───────────────────────────────────────

paso "Estado actual de la instancia"

ANTERIOR=""
if [ "$DRY_RUN" = no ]; then
    ANTERIOR=$(ssh "$SSH" "grep -m1 '^TAG=' '$RUTA_REMOTA/.env' 2>/dev/null | cut -d= -f2" || true)
fi
if [ -n "$ANTERIOR" ]; then
    ok "corriendo ahora: ${ANTERIOR:0:7}"
    info "para volver acá:  bash ${BASH_SOURCE[0]} $ANTERIOR"
    [ "$ANTERIOR" = "$SHA" ] && info "(es la misma versión: el despliegue va a ser un no-op)"
else
    info "no hay despliegue previo, no se pudo leer, o es --dry-run"
fi

# ── La configuración ─────────────────────────────────────────────────────────

paso "Copiando la configuración"

# El .env de la APLICACIÓN en la instancia NO se pisa: tiene los valores de producción y
# no está en el repositorio. Solo se actualiza la etiqueta de versión.
copiar docker-compose.yml "$SSH:$RUTA_REMOTA/docker-compose.yml"
ok "docker-compose.yml"
remoto "mkdir -p '$RUTA_REMOTA/infrastructure/reverse-proxy'"
copiar infrastructure/reverse-proxy/Caddyfile "$SSH:$RUTA_REMOTA/infrastructure/reverse-proxy/Caddyfile"
ok "infrastructure/reverse-proxy/Caddyfile"

remoto "cd '$RUTA_REMOTA' \
    && test -f .env \
    && sed -i '/^TAG=/d' .env \
    && printf 'TAG=%s\n' '$SHA' >> .env" \
    || morir "no se pudo fijar la versión: ¿existe $RUTA_REMOTA/.env en la instancia? (sale de .env.oracle)"
ok "TAG=${SHA:0:7} fijado en el .env remoto"

# ── Las imágenes ─────────────────────────────────────────────────────────────

paso "Trayendo las imágenes"

# GHCR público no necesita login; si el paquete es privado, el `docker login ghcr.io` se
# hace una vez en la instancia con un token de solo lectura.
remoto "cd '$RUTA_REMOTA' && docker compose pull --quiet" \
    || morir "no se pudieron traer las imágenes de ${SHA:0:7} — ¿el CI terminó de publicarlas?"
ok "imágenes de ${SHA:0:7} en la instancia"

# ── El reemplazo ─────────────────────────────────────────────────────────────

paso "Reemplazando los contenedores"

# `up -d` reemplaza SOLO los contenedores cuya imagen cambió. No hace falta bajar todo.
remoto "cd '$RUTA_REMOTA' && docker compose up -d --remove-orphans" \
    || morir "el reemplazo falló — la versión anterior puede haber quedado a medias"
ok "contenedores actualizados"

# ── La comprobación que importa ──────────────────────────────────────────────

paso "Comprobando que quedó arriba"

# `docker compose ps` muestra «Up» un contenedor que se está reiniciando en bucle. Lo que
# dice que el despliegue salió bien es que los servicios CONTESTEN.
for entrada in "${SERVICIOS_CON_HEALTH[@]}"; do
    servicio=${entrada%%:*}
    puerto=${entrada##*:}
    if [ "$DRY_RUN" = si ]; then
        info "\$ ssh $SSH curl -sf http://localhost:$puerto/health  (hasta 30 intentos)"
        continue
    fi
    listo=no
    for _ in $(seq 1 30); do
        if ssh "$SSH" "curl -sf -o /dev/null http://localhost:$puerto/health"; then
            listo=si; break
        fi
        sleep 4
    done
    if [ "$listo" = si ]; then
        ok "$servicio responde"
    else
        ssh "$SSH" "cd '$RUTA_REMOTA' && docker compose logs --tail 40 '$servicio'" || true
        morir "$servicio no respondió en 2 minutos. Para volver: bash ${BASH_SOURCE[0]} ${ANTERIOR:-<sha-anterior>}"
    fi
done

# ── Limpieza ─────────────────────────────────────────────────────────────────

paso "Liberando disco"

# `-a` no es opcional: sin ella se borran solo las imágenes COLGADAS, y las etiquetadas por
# SHA nunca lo están —cada una conserva su etiqueta—. El comando corre, dice que liberó
# cero, y el disco sigue creciendo.
#
# `until=24h` conserva las recientes para que revertir no tenga que volver a bajar todo.
if [ "$DRY_RUN" = si ]; then
    info "\$ ssh $SSH docker image prune -af --filter until=24h"
else
    liberado=$(ssh "$SSH" "docker image prune -af --filter until=24h" | tail -1)
    info "${liberado:-sin imágenes para borrar}"
    ssh "$SSH" "df -h / | awk 'NR==2 {print \"    libre en /: \" \$4 \" de \" \$2}'"
fi

printf '\n\033[0;32m✓ desplegado %s\033[0m\n' "${SHA:0:7}"
