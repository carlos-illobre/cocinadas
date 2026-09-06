#!/usr/bin/env bash
#
# Respaldo de lo que no se puede reconstruir: la base de datos (usuarios y cocinadas) y
# los certificados de Caddy. Se corre EN LA VM, no desde la máquina de desarrollo.
#
#   bash respaldo.sh                 # a ~/respaldos
#   bash respaldo.sh /otra/carpeta   # a donde se le diga
#   bash respaldo.sh --dry-run       # dice qué haría, sin escribir nada
#
# Para que corra solo, en la VM:
#
#   crontab -e
#   17 3 * * * cd ~/templa && bash deployment/oracle-single/respaldo.sh >> ~/respaldos/registro.txt 2>&1
#
# Guarda los últimos DIAS_A_GUARDAR y borra los más viejos: un respaldo que llena el
# disco deja de ser un respaldo y se vuelve el problema.
set -uo pipefail

DIAS_A_GUARDAR=7
DRY_RUN=no
DESTINO=""

for argumento in "$@"; do
    case "$argumento" in
        --dry-run) DRY_RUN=si ;;
        -*) echo "opción desconocida: $argumento" >&2; exit 2 ;;
        *) DESTINO=$argumento ;;
    esac
done
DESTINO=${DESTINO:-$HOME/respaldos}

VERDE='\033[0;32m'; ROJO='\033[0;31m'; AMARILLO='\033[0;33m'; NC='\033[0m'
ok()    { printf "  ${VERDE}✓${NC} %s\n" "$1"; }
mal()   { printf "  ${ROJO}✗${NC} %s\n" "$1"; }
aviso() { printf "  ${AMARILLO}!${NC} %s\n" "$1"; }

correr() {
    if [ "$DRY_RUN" = si ]; then
        printf "    %s\n" "$*"
        return 0
    fi
    "$@"
}

command -v docker >/dev/null 2>&1 || { mal "no hay docker en esta máquina"; exit 1; }

FECHA=$(date +%Y-%m-%d)
printf "\n%s\n" "Respaldo del $FECHA en $DESTINO"
[ "$DRY_RUN" = si ] && aviso "modo --dry-run: no se escribe nada"

correr mkdir -p "$DESTINO" || { mal "no pude crear $DESTINO"; exit 1; }

fallos=0

# ── La base ──────────────────────────────────────────────────────────────────
# Volcado lógico y no copia del volumen: es más chico, se restaura en cualquier versión
# de PostgreSQL y se puede mirar con un editor.
ARCHIVO_BASE="$DESTINO/base-$FECHA.sql.gz"
if [ "$DRY_RUN" = si ]; then
    printf "    docker compose exec -T postgres pg_dump ... | gzip > %s\n" "$ARCHIVO_BASE"
elif docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' 2>/dev/null | gzip > "$ARCHIVO_BASE"; then
    # Un pg_dump que falla deja un .gz válido pero vacío: hay que mirar el tamaño.
    if [ "$(stat -c%s "$ARCHIVO_BASE" 2>/dev/null || echo 0)" -gt 100 ]; then
        ok "base → $ARCHIVO_BASE ($(du -h "$ARCHIVO_BASE" | cut -f1))"
    else
        mal "el volcado de la base salió vacío"; rm -f "$ARCHIVO_BASE"; fallos=$((fallos+1))
    fi
else
    mal "no pude volcar la base (¿está levantado el stack?)"; fallos=$((fallos+1))
fi

# ── Los certificados ─────────────────────────────────────────────────────────
# Perderlos no pierde datos, pero reemitirlos tiene límite de intentos en Let's Encrypt.
ARCHIVO_TLS="$DESTINO/certificados-$FECHA.tgz"
if correr docker run --rm -v templa_caddy-datos:/d:ro -v "$DESTINO:/b" alpine tar czf "/b/certificados-$FECHA.tgz" -C /d .; then
    [ "$DRY_RUN" = si ] || ok "certificados → $ARCHIVO_TLS"
else
    mal "no pude copiar los certificados"; fallos=$((fallos+1))
fi

# ── Limpieza ─────────────────────────────────────────────────────────────────
viejos=$(find "$DESTINO" -maxdepth 1 -name 'base-*.sql.gz' -o -maxdepth 1 -name 'certificados-*.tgz' 2>/dev/null | wc -l)
if [ "$DRY_RUN" = si ]; then
    printf "    find %s -name 'base-*.sql.gz' -mtime +%s -delete\n" "$DESTINO" "$DIAS_A_GUARDAR"
else
    find "$DESTINO" -maxdepth 1 -name 'base-*.sql.gz' -mtime +"$DIAS_A_GUARDAR" -delete 2>/dev/null
    find "$DESTINO" -maxdepth 1 -name 'certificados-*.tgz' -mtime +"$DIAS_A_GUARDAR" -delete 2>/dev/null
    ok "quedan los últimos $DIAS_A_GUARDAR días ($viejos archivos antes de limpiar)"
fi

printf "\n"
if [ "$fallos" -eq 0 ]; then
    printf "${VERDE}✓ respaldo terminado${NC}\n"
else
    printf "${ROJO}✗ %s parte(s) del respaldo fallaron${NC}\n" "$fallos"
fi
exit "$fallos"
