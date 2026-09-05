#!/usr/bin/env bash
#
# PLANTILLA. Adaptar al proyecto antes de entregar:
#   - los nombres de servicio y sus puertos de health salen del docker-compose.yml
#   - RAMA_PRINCIPAL y el prefijo del registro, de lo que respondió el usuario
#   - borrar este encabezado de plantilla
#
# ─────────────────────────────────────────────────────────────────────────────
#
# Actualiza la instancia con lo que hay en la rama principal.
#
# Se ejecuta DESDE ESTA MÁQUINA, no desde la instancia.
#
#   bash deployment/oracle-single/deploy.sh          # el último commit verificado
#   bash deployment/oracle-single/deploy.sh <sha>    # un commit concreto, o volver atrás
#
# Todo sale de deployment/oracle-single/.env, así que este archivo no contiene ningún
# dato del despliegue y se puede versionar sin filtrar nada.
#
# ── Por qué por SHA y no por `latest` ──
#
# `latest` es una etiqueta móvil: sirve para «dame lo último», no para saber qué está
# corriendo. Con el SHA fijado, `docker compose ps` dice exactamente qué versión hay, la
# reversión es determinística, y dos despliegues del mismo commit no traen cosas distintas.
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

CONFIG=deployment/oracle-single/.env
[ -f "$CONFIG" ] || morir "falta $PWD/$CONFIG — de ahí salen el destino SSH y la ruta remota"
set -a; . "$CONFIG"; set +a

: "${SSH:?falta SSH en $CONFIG}"                    # usuario@ip
: "${RUTA_REMOTA:?falta RUTA_REMOTA en $CONFIG}"    # dónde vive el proyecto en la instancia

RAMA_PRINCIPAL=main
SERVICIOS_CON_HEALTH=()   # p. ej. ("api:8080" "worker:8081"); salen del compose

# ── Qué versión desplegar ────────────────────────────────────────────────────

paso "Resolviendo la versión"

git fetch origin "$RAMA_PRINCIPAL" --quiet || morir "no se pudo consultar el remoto"

if [ $# -gt 0 ]; then
    SHA=$(git rev-parse --verify "$1^{commit}" 2>/dev/null) \
        || morir "'$1' no es un commit de este repositorio"
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

ANTERIOR=$(ssh "$SSH" "grep -m1 '^TAG=' '$RUTA_REMOTA/.env' 2>/dev/null | cut -d= -f2" || true)
if [ -n "$ANTERIOR" ]; then
    ok "corriendo ahora: ${ANTERIOR:0:7}"
    info "para volver acá:  bash ${BASH_SOURCE[0]} $ANTERIOR"
    [ "$ANTERIOR" = "$SHA" ] && info "(es la misma versión: el despliegue va a ser un no-op)"
else
    info "no hay despliegue previo, o no se pudo leer"
fi

# ── La configuración ─────────────────────────────────────────────────────────

paso "Copiando la configuración"

# El .env de la APLICACIÓN en la instancia NO se pisa: tiene los valores de producción y
# no está en el repositorio. Sólo se actualiza la etiqueta de versión.
scp -q docker-compose.yml "$SSH:$RUTA_REMOTA/docker-compose.yml" \
    || morir "no se pudo copiar el compose"
ok "docker-compose.yml"

ssh "$SSH" "cd '$RUTA_REMOTA' \
    && touch .env \
    && sed -i '/^TAG=/d' .env \
    && printf 'TAG=%s\n' '$SHA' >> .env" \
    || morir "no se pudo fijar la versión en la instancia"
ok "TAG=${SHA:0:7} fijado en el .env remoto"

# ── Las imágenes ─────────────────────────────────────────────────────────────

paso "Trayendo las imágenes"

ssh "$SSH" "cd '$RUTA_REMOTA' && docker compose pull --quiet" \
    || morir "no se pudieron traer las imágenes de ${SHA:0:7} — ¿el CI terminó de publicarlas?"
ok "imágenes de ${SHA:0:7} en la instancia"

# ── El reemplazo ─────────────────────────────────────────────────────────────

paso "Reemplazando los contenedores"

# `up -d` reemplaza SÓLO los contenedores cuya imagen cambió. No hace falta bajar todo.
ssh "$SSH" "cd '$RUTA_REMOTA' && docker compose up -d --remove-orphans" \
    || morir "el reemplazo falló — la versión anterior puede haber quedado a medias"
ok "contenedores actualizados"

# ── La comprobación que importa ──────────────────────────────────────────────

paso "Comprobando que quedó arriba"

# `docker compose ps` muestra «Up» un contenedor que se está reiniciando en bucle. Lo que
# dice que el despliegue salió bien es que los servicios CONTESTEN.
for entrada in "${SERVICIOS_CON_HEALTH[@]}"; do
    servicio=${entrada%%:*}
    puerto=${entrada##*:}
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
        morir "$servicio no respondió en 2 minutos. Para volver: bash ${BASH_SOURCE[0]} $ANTERIOR"
    fi
done

# ── Limpieza ─────────────────────────────────────────────────────────────────

paso "Liberando disco"

# `-a` no es opcional: sin ella se borran sólo las imágenes COLGADAS, y las etiquetadas por
# SHA nunca lo están —cada una conserva su etiqueta—. El comando corre, dice que liberó
# cero, y el disco sigue creciendo.
#
# `until=24h` conserva las recientes para que revertir no tenga que volver a bajar todo.
liberado=$(ssh "$SSH" "docker image prune -af --filter until=24h" | tail -1)
info "${liberado:-sin imágenes para borrar}"
ssh "$SSH" "df -h / | awk 'NR==2 {print \"    libre en /: \" \$4 \" de \" \$2}'"

printf '\n\033[0;32m✓ desplegado %s\033[0m\n' "${SHA:0:7}"
