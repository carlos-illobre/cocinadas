/**
 * Escribe el catálogo en public/api/catalogo/ antes de `vite build` (ADR-015).
 *
 *   pnpm generar:catalogo          usa ../../data del repositorio
 *
 * Excluido de la cobertura (docs/TESTING.md): decide nada. `planificar` arma el plan y
 * acá solo se crean carpetas, se escriben archivos y se copian fotos. Si alguna vez
 * aparece un `if` con criterio propio, se muda a catalogo.ts.
 */
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planificar } from './catalogo.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const datos = resolve(aqui, '../../../../data');
const destino = resolve(aqui, '../../public/api/catalogo');

const plan = planificar(datos, (aviso) => {
  console.warn(`  ! ${aviso}`);
});

// Se borra y se rehace: un archivo que quedó de un build anterior con una receta que ya
// no está sería la única parte del bundle que no sale del commit.
rmSync(destino, { recursive: true, force: true });

for (const { ruta, contenido } of plan.json) {
  const salida = join(destino, ruta);
  mkdirSync(dirname(salida), { recursive: true });
  writeFileSync(salida, JSON.stringify(contenido));
}

for (const { ruta, origen } of plan.fotos) {
  const salida = join(destino, ruta);
  mkdirSync(dirname(salida), { recursive: true });
  copyFileSync(origen, salida);
}

console.log(`  catálogo: ${String(plan.json.length)} JSON y ${String(plan.fotos.length)} fotos en public/api/catalogo/`);
