#!/usr/bin/env bash
# Utilidades compartidas por los corredores. Se carga con `. tests/integration/comun.sh`.

VERDE='\033[0;32m'; ROJO='\033[0;31m'; AMARILLO='\033[0;33m'; NEGRITA='\033[1m'; NC='\033[0m'

ok()     { printf "  ${VERDE}✓${NC} %s\n" "$1"; }
mal()    { printf "  ${ROJO}✗${NC} %s\n" "$1"; }
aviso()  { printf "  ${AMARILLO}!${NC} %s\n" "$1"; }
nota()   { printf "      %s\n" "$1"; }
titulo() { printf "\n${NEGRITA}▶ %s${NC}\n" "$1"; }
morir()  { printf "\n${ROJO}✗ %s${NC}\n" "$1" >&2; exit 1; }

# La raíz se resuelve con git y no contando `..`: así los corredores funcionan desde
# cualquier directorio y siguen funcionando si algún día cambian de carpeta.
raiz_del_repositorio() {
    git -C "$(dirname "${BASH_SOURCE[1]}")" rev-parse --show-toplevel
}

# Los servicios que tienen suite propia: cada carpeta de microservices/ con package.json.
listar_servicios() {
    local raiz=$1
    for d in "$raiz"/microservices/*/; do
        [ -f "$d/package.json" ] && basename "$d"
    done
}
