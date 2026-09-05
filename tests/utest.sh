#!/usr/bin/env bash
#
# Pruebas unitarias de todos los servicios, con la compuerta de cobertura (docs/TESTING.md).
#
#   bash tests/utest.sh              todos
#   bash tests/utest.sh catalogo     uno solo
#
# Recorre microservices/*, corre la suite de cada uno con cobertura y vuelve a comprobar
# el umbral leyendo coverage/coverage-summary.json: así el fallo se ve en una tabla que
# dice qué archivo bajó y en qué métrica, en vez de en un error de la herramienta.
# Sale con 1 si alguna suite falla o algún servicio baja del 100 %.
set -uo pipefail
. "$(dirname "$0")/integration/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

UMBRAL=100
fallos=0

if [ $# -gt 0 ]; then
    servicios=("$@")
else
    mapfile -t servicios < <(listar_servicios "$PWD")
fi

for servicio in "${servicios[@]}"; do
    titulo "$servicio"
    dir=microservices/$servicio
    [ -f "$dir/package.json" ] || { mal "no existe $dir/package.json"; fallos=$((fallos+1)); continue; }

    if [ ! -d "$dir/node_modules" ]; then
        nota "instalando dependencias (pnpm install --frozen-lockfile)"
        (cd "$dir" && pnpm install --frozen-lockfile --silent) || { mal "falló la instalación"; fallos=$((fallos+1)); continue; }
    fi

    salida=$(cd "$dir" && pnpm test:cov 2>&1)
    estado=$?
    # Vitest colorea la salida: se quitan las secuencias ANSI antes de leer los números.
    plano=$(printf '%s\n' "$salida" | sed 's/\x1b\[[0-9;]*m//g')
    pasaron=$(printf '%s\n' "$plano" | sed -n 's/.*Tests *\([0-9]*\) passed.*/\1/p' | tail -1)
    fallaron=$(printf '%s\n' "$plano" | sed -n 's/.*Tests *\([0-9]*\) failed.*/\1/p' | tail -1)

    if [ "$estado" -ne 0 ]; then
        printf '%s\n' "$salida" | tail -40
        mal "la suite falló (${fallaron:-?} pruebas fallidas)"
        fallos=$((fallos+1))
        continue
    fi
    ok "${pasaron:-0} pruebas pasaron"

    resumen=$dir/coverage/coverage-summary.json
    [ -f "$resumen" ] || { mal "no se generó $resumen"; fallos=$((fallos+1)); continue; }

    # Tabla por archivo y verificación del umbral, leyendo el JSON que produjo la
    # herramienta: los números no se escriben a mano, se desfasan.
    node - "$resumen" "$UMBRAL" <<'EOF'
const [ruta, umbral] = process.argv.slice(2);
const datos = require(require('path').resolve(ruta));
const metricas = ['statements', 'branches', 'functions', 'lines'];
const fila = (nombre, c) => `    ${nombre.padEnd(28)} ${metricas.map((m) => String(c[m].pct).padStart(7)).join('')}`;
console.log(`    ${'archivo'.padEnd(28)} ${metricas.map((m) => m.padStart(7)).join('')}`);
for (const [archivo, c] of Object.entries(datos)) {
  if (archivo === 'total') continue;
  console.log(fila(archivo.split(/[\\/]/).slice(-2).join('/'), c));
}
console.log(fila('TOTAL', datos.total));
const bajas = metricas.filter((m) => datos.total[m].pct < Number(umbral));
if (bajas.length > 0) {
  console.error(`    ✗ por debajo del ${umbral} % en: ${bajas.map((m) => `${m} (${datos.total[m].pct} %)`).join(', ')}`);
  process.exit(1);
}
EOF
    if [ $? -eq 0 ]; then
        ok "cobertura ≥ ${UMBRAL} % en las cuatro métricas"
    else
        mal "cobertura por debajo del umbral"
        fallos=$((fallos+1))
    fi
done

printf '\n'
if [ "$fallos" -eq 0 ]; then
    printf "${VERDE}✓ %s servicio(s), todos en verde${NC}\n" "${#servicios[@]}"
else
    printf "${ROJO}✗ %s de %s servicio(s) fallaron${NC}\n" "$fallos" "${#servicios[@]}"
fi
exit "$fallos"
