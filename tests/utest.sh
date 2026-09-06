#!/usr/bin/env bash
#
# Pruebas unitarias con la compuerta de cobertura (docs/TESTING.md).
#
#   bash tests/utest.sh
#
# Es el único punto de entrada: lo usan el CI, el README y CLAUDE.md. Corre la suite de
# web/ con cobertura y deja pasar la salida de vitest tal cual, que es la que dice qué
# líneas quedaron sin cubrir.
#
# El umbral vive en los `thresholds` de vite.config.ts, que son los que hacen fallar
# `pnpm test:cov`. Acá solo se comprueba que el resumen en JSON exista y esté al día: si
# alguien saca el reporter `json-summary`, la compuerta se quedaría muda y nadie se
# enteraría.
set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "no encuentro la raíz del repositorio"; exit 1; }

UMBRAL=100
PROYECTO=web
RESUMEN=$PROYECTO/coverage/coverage-summary.json

VERDE='\033[0;32m'; ROJO='\033[0;31m'; NC='\033[0m'
ok()  { printf "  ${VERDE}✓${NC} %s\n" "$1"; }
mal() { printf "  ${ROJO}✗${NC} %s\n" "$1"; }

printf "\033[1m▶ %s\033[0m\n" "$PROYECTO"
command -v pnpm > /dev/null || { mal "no encuentro pnpm en el PATH"; exit 1; }
[ -f "$PROYECTO/package.json" ] || { mal "no existe $PROYECTO/package.json"; exit 1; }

if [ ! -d "$PROYECTO/node_modules" ]; then
    printf "      instalando dependencias (pnpm install --frozen-lockfile)\n"
    (cd "$PROYECTO" && pnpm install --frozen-lockfile) || { mal "falló la instalación"; exit 1; }
fi

# Se borra antes de correr para que un resumen viejo no haga pasar una corrida que ni
# llegó a medir.
rm -f "$RESUMEN"

(cd "$PROYECTO" && pnpm test:cov) || { mal "la suite falló"; exit 1; }

[ -f "$RESUMEN" ] || { mal "no se generó $RESUMEN: revisá el reporter json-summary de vite.config.ts"; exit 1; }

node - "$RESUMEN" "$UMBRAL" <<'EOF' || exit 1
const [ruta, umbral] = process.argv.slice(2);
const total = require(require('path').resolve(ruta)).total;
const bajas = ['statements', 'branches', 'functions', 'lines'].filter((m) => total[m].pct < Number(umbral));
if (bajas.length > 0) {
  console.error(`    por debajo del ${umbral} % en: ${bajas.map((m) => `${m} (${total[m].pct} %)`).join(', ')}`);
  process.exit(1);
}
EOF

ok "cobertura ≥ ${UMBRAL} % en las cuatro métricas"
printf "\n${VERDE}✓ todo en verde${NC}\n"
