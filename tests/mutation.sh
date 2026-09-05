#!/usr/bin/env bash
#
# Mutation testing de todos los servicios (docs/TESTING.md). INFORMA, NO REPRUEBA: hay
# mutantes equivalentes que ninguna prueba puede matar, y un umbral obligaría a pelear con
# eso en vez de leer los sobrevivientes que importan. El objetivo no es un porcentaje: es
# que no quede ningún sobreviviente sin explicar.
#
#   bash tests/mutation.sh              todos
#   bash tests/mutation.sh catalogo     uno solo
#
# El informe de cada servicio queda en microservices/<servicio>/reports/mutation/.
set -uo pipefail
. "$(dirname "$0")/integration/comun.sh"
cd "$(raiz_del_repositorio)" || morir "no encuentro la raíz del repositorio"

if [ $# -gt 0 ]; then
    servicios=("$@")
else
    mapfile -t servicios < <(listar_servicios "$PWD")
fi

for servicio in "${servicios[@]}"; do
    titulo "$servicio"
    dir=microservices/$servicio
    [ -f "$dir/stryker.config.json" ] || { aviso "sin stryker.config.json, se saltea"; continue; }
    (cd "$dir" && pnpm mutation 2>&1 | grep -vE '^\s*$' | tail -25)

    informe=$dir/reports/mutation/mutation.json
    if [ -f "$informe" ]; then
        node - "$informe" <<'EOF'
const datos = require(require('path').resolve(process.argv[2]));
const cuenta = {};
for (const archivo of Object.values(datos.files)) {
  for (const m of archivo.mutants) cuenta[m.status] = (cuenta[m.status] ?? 0) + 1;
}
const total = Object.values(cuenta).reduce((a, b) => a + b, 0);
const muertos = (cuenta.Killed ?? 0) + (cuenta.Timeout ?? 0) + (cuenta.RuntimeError ?? 0) + (cuenta.CompileError ?? 0);
const vivos = (cuenta.Survived ?? 0) + (cuenta.NoCoverage ?? 0);
console.log(`    mutantes: ${total} · muertos: ${muertos} · sobrevivieron: ${vivos} · puntaje: ${total ? ((muertos / total) * 100).toFixed(1) : '0'} %`);
if (vivos > 0) {
  console.log('    sobrevivientes a explicar (docs/TESTING.md):');
  for (const [ruta, archivo] of Object.entries(datos.files)) {
    for (const m of archivo.mutants) {
      if (m.status === 'Survived' || m.status === 'NoCoverage') {
        console.log(`      ${ruta}:${m.location.start.line}  ${m.mutatorName}  ${m.replacement ?? ''}`.trimEnd());
      }
    }
  }
}
EOF
    else
        aviso "no se generó $informe"
    fi
done
exit 0
