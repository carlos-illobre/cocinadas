#!/usr/bin/env bash
#
# Pruebas de integración (docs/TESTING.md). Sin compuerta de cobertura: verifican lo que
# ninguna prueba unitaria puede.
#
#   bash tests/itest.sh              todas (necesita el stack arriba: docker compose up -d)
#   bash tests/itest.sh --rapido     solo las que no necesitan el stack, y dice cuáles saltea
#
# Un script por asunto en tests/integration/. Cada uno sale con el número de fallos.
set -uo pipefail
. "$(dirname "$0")/integration/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

rapido=no
[ "${1:-}" = "--rapido" ] && rapido=si

fallos=0
correr() {
    local script=$1
    printf "\n${NEGRITA}═══ %s ═══${NC}\n" "$script"
    bash "tests/integration/$script"
    local r=$?
    [ "$r" -ne 0 ] && fallos=$((fallos+r))
}

# Sin stack
correr paridad-env.sh
correr contratos.sh

# Con stack
if [ "$rapido" = si ]; then
    printf "\n${AMARILLO}! salteadas por --rapido: health.sh (necesita docker compose up -d)${NC}\n"
else
    correr health.sh
fi

printf '\n'
if [ "$fallos" -eq 0 ]; then
    printf "${VERDE}✓ integración en verde${NC}\n"
else
    printf "${ROJO}✗ %s fallo(s) de integración${NC}\n" "$fallos"
fi
exit "$fallos"
