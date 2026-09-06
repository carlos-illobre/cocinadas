#!/usr/bin/env bash
#
# Pruebas unitarias con la compuerta de cobertura (docs/TESTING.md).
#
#   bash tests/utest.sh
#
# Corre la suite de web/ con cobertura y vuelve a comprobar el umbral leyendo
# coverage/coverage-summary.json: así el fallo se ve en una tabla que dice qué archivo
# bajó y en qué métrica, en vez de en un error de la herramienta.
#
# La compuerta está en dos lugares a propósito: los `thresholds` de vite.config.ts hacen
# fallar `pnpm test:cov`, y esto lo vuelve a comprobar sobre el JSON que produjo la
# herramienta. Los números no se escriben a mano: se desfasan.
set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "no encuentro la raíz del repositorio"; exit 1; }

UMBRAL=100
PROYECTO=web

VERDE='\033[0;32m'; ROJO='\033[0;31m'; AMARILLO='\033[0;33m'; NC='\033[0m'
ok()   { printf "  ${VERDE}✓${NC} %s\n" "$1"; }
mal()  { printf "  ${ROJO}✗${NC} %s\n" "$1"; }
nota() { printf "      %s\n" "$1"; }

printf "\033[1m▶ %s\033[0m\n" "$PROYECTO"
[ -f "$PROYECTO/package.json" ] || { mal "no existe $PROYECTO/package.json"; exit 1; }

if [ ! -d "$PROYECTO/node_modules" ]; then
    nota "instalando dependencias (pnpm install --frozen-lockfile)"
    (cd "$PROYECTO" && pnpm install --frozen-lockfile --silent) || { mal "falló la instalación"; exit 1; }
fi

salida=$(cd "$PROYECTO" && pnpm test:cov 2>&1)
estado=$?
# Vitest colorea la salida: se quitan las secuencias ANSI antes de leer los números.
plano=$(printf '%s\n' "$salida" | sed 's/\x1b\[[0-9;]*m//g')
pasaron=$(printf '%s\n' "$plano" | sed -n 's/.*Tests *\([0-9]*\) passed.*/\1/p' | tail -1)
fallaron=$(printf '%s\n' "$plano" | sed -n 's/.*Tests *\([0-9]*\) failed.*/\1/p' | tail -1)

if [ "$estado" -ne 0 ]; then
    printf '%s\n' "$salida" | tail -40
    mal "la suite falló (${fallaron:-?} pruebas fallidas)"
    exit 1
fi
ok "${pasaron:-0} pruebas pasaron"

resumen=$PROYECTO/coverage/coverage-summary.json
[ -f "$resumen" ] || { mal "no se generó $resumen"; exit 1; }

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
if [ $? -ne 0 ]; then
    mal "cobertura por debajo del umbral"
    exit 1
fi
ok "cobertura ≥ ${UMBRAL} % en las cuatro métricas"

printf "\n${VERDE}✓ todo en verde${NC}\n"
