#!/usr/bin/env bash
#
# PLANTILLA. Adaptar antes de entregar:
#   - PUERTOS y MEMORIA_NECESARIA_MB salen del docker-compose.yml y del .env del proyecto
#   - borrar este encabezado de plantilla
#
# ─────────────────────────────────────────────────────────────────────────────
#
# Verificación previa de la instancia. NO MODIFICA NADA: sólo informa.
#
# Comprueba lo que puede estar mal antes de instalar, con el remedio de cada caso.
#
# Conviene correrlo ANTES del primer `docker compose up`: una vez que el sistema está
# arriba, la comprobación de puertos libres marca como ocupados los que usa el stack.
#
# Dos formas:
#   en la instancia    bash deployment/oracle-single/preflight.sh
#   desde tu máquina   ssh <destino> 'bash -s' < deployment/oracle-single/preflight.sh
#
# La segunda no copia nada —el script viaja por stdin— así que sirve incluso antes de
# clonar el repositorio en la instancia.
#
# En esa forma `sudo` no puede pedir contraseña: stdin está ocupado por el propio script.
# En las imágenes Ubuntu de Oracle el usuario `ubuntu` tiene sudo sin contraseña, así que
# las comprobaciones que lo necesitan funcionan igual. Agregar `-t` no ayuda: fuerza un
# pseudo terminal que compite con la redirección de stdin.
set -uo pipefail

PUERTOS=(80 443)               # los que el compose publica hacia afuera
MEMORIA_NECESARIA_MB=2048      # suma de los límites de memoria del stack

VERDE='\033[0;32m'; ROJO='\033[0;31m'; AMARILLO='\033[0;33m'; NC='\033[0m'
fallos=0

ok()    { printf "  ${VERDE}✓${NC} %s\n" "$1"; }
mal()   { printf "  ${ROJO}✗${NC} %s\n" "$1"; printf "      %s\n" "$2"; fallos=$((fallos+1)); }
aviso() { printf "  ${AMARILLO}!${NC} %s\n" "$1"; }
nota()  { printf "      %s\n" "$1"; }
titulo(){ printf "\n\033[1m▶ %s\033[0m\n" "$1"; }

printf '\033[1m═══ Verificación previa de la instancia ═══\033[0m\n'

# ── La máquina ───────────────────────────────────────────────────────────────

titulo "La máquina"

printf "  arquitectura: %s\n" "$(uname -m)"
nota "aarch64 = Ampere (arm64) · x86_64 = AMD/Intel (amd64)"
nota "las imágenes tienen que estar construidas para ESTA arquitectura"

# Lo que importa no es la memoria NOMINAL sino la DISPONIBLE: en una VM de cloud siempre
# hay agentes del proveedor corriendo, y los límites del stack se reparten sobre lo que
# sobra, no sobre lo del folleto.
disponible=$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo)
if [ "$disponible" -ge "$MEMORIA_NECESARIA_MB" ]; then
    ok "memoria disponible: ${disponible} MB (hacen falta ${MEMORIA_NECESARIA_MB})"
else
    mal "memoria disponible: ${disponible} MB, hacen falta ${MEMORIA_NECESARIA_MB}" \
        "bajá los límites de memoria del .env, o usá un shape más grande"
fi

libre_kb=$(df -k / | awk 'NR==2 {print $4}')
libre_gb=$((libre_kb / 1024 / 1024))
if [ "$libre_gb" -ge 10 ]; then
    ok "espacio libre en /: ${libre_gb} GB"
else
    mal "espacio libre en /: ${libre_gb} GB" \
        "liberá con: docker image prune -af --filter until=24h"
fi

# ── Docker ───────────────────────────────────────────────────────────────────

titulo "Docker"

if command -v docker >/dev/null 2>&1; then
    ok "instalado: $(docker --version)"
    if docker info >/dev/null 2>&1; then
        ok "el demonio responde y el usuario puede hablarle"
    else
        mal "el usuario no puede hablar con el demonio" \
            "sudo usermod -aG docker \$USER  y volvé a entrar por SSH"
    fi
    docker compose version >/dev/null 2>&1 \
        && ok "el plugin compose está" \
        || mal "falta el plugin compose" "instalá docker-compose-plugin"
else
    mal "Docker no está instalado" "seguí la guía oficial para esta distribución"
fi

# ── Los puertos ──────────────────────────────────────────────────────────────

titulo "Los puertos que el stack necesita"

for puerto in "${PUERTOS[@]}"; do
    if ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${puerto}\$"; then
        aviso "el $puerto ya está ocupado"
        nota "si el stack ya está corriendo, es esperable"
    else
        ok "el $puerto está libre"
    fi
done

# ── El firewall del host ─────────────────────────────────────────────────────

titulo "El firewall del host"

# Los puertos publicados por Docker NO pasan por INPUT: el DNAT los enruta y recorren
# FORWARD → DOCKER-USER → DOCKER. Se comprueba igual porque las imágenes de Ubuntu de
# Oracle traen reglas que descartan tráfico entrante, y eso sí rompe el acceso.
if sudo -n iptables -L INPUT -n 2>/dev/null | grep -qE '^(REJECT|DROP)'; then
    aviso "hay reglas REJECT/DROP en INPUT"
    nota "no afectan a los puertos publicados por Docker, pero sí a lo que escuche en el host"
    nota "mirá la lista completa con: sudo iptables -L INPUT -n --line-numbers"
else
    ok "sin reglas de descarte en INPUT, o no se pudo consultar"
fi

if command -v ufw >/dev/null 2>&1 && sudo -n ufw status 2>/dev/null | grep -q "Status: active"; then
    aviso "ufw está activo"
    nota "sus reglas van a INPUT y NO filtran los puertos publicados por Docker:"
    nota "dan sensación de protección sin protegerte. El firewall efectivo es la"
    nota "Security List de la VCN."
fi

nota "recordá: lo que decide qué está abierto desde internet es la Security List de la VCN"

# ── Resultado ────────────────────────────────────────────────────────────────

printf '\n\033[1m═══════════════════════════════════════════\033[0m\n'
if [ "$fallos" -eq 0 ]; then
    printf "${VERDE}✓ la instancia está lista${NC}\n"
else
    printf "${ROJO}✗ %s comprobación(es) fallaron${NC}\n" "$fallos"
    printf "  Resolvelas antes del primer despliegue.\n"
fi
exit "$fallos"
