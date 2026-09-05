#!/usr/bin/env bash
#
# Los esquemas de eventos que cada servicio copia en src/contratos/ tienen que ser
# idénticos al original de contratos/eventos/ (contratos/eventos/README.md). Si divergen,
# el error nombra el archivo. No necesita el stack arriba.
set -uo pipefail
. "$(dirname "$0")/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

fallos=0
copias=0

titulo "Copias de los esquemas de eventos"
for original in contratos/eventos/*.schema.json; do
    nombre=$(basename "$original")
    for copia in microservices/*/src/contratos/"$nombre"; do
        [ -f "$copia" ] || continue
        copias=$((copias+1))
        if cmp -s "$original" "$copia"; then
            ok "$copia"
        else
            mal "$copia difiere de $original"
            fallos=$((fallos+1))
        fi
    done
done

if [ "$copias" -eq 0 ]; then
    aviso "ningún servicio copia esquemas todavía (el esqueleto no emite eventos)"
fi

exit "$fallos"
