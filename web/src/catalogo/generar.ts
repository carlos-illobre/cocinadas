/**
 * Escribe el catálogo en public/api/catalogo/ antes de `vite build` (ADR-015).
 *
 *   pnpm generar:catalogo          usa ../../data del repositorio
 *
 * Excluido de la cobertura (docs/TESTING.md): decide nada. `planificar` arma el plan y
 * acá solo se crean carpetas, se escriben archivos y se copian fotos. Si alguna vez
 * aparece un `if` con criterio propio, se muda a catalogo.ts.
 */
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planificar } from './catalogo.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const datos = resolve(aqui, '../../../data');
const assets = resolve(aqui, '../../assets');
const destino = resolve(aqui, '../../public/api/catalogo');
const inicio = resolve(aqui, '../../public/inicio');

const plan = planificar(datos, assets, (aviso) => {
  console.warn(`  ! ${aviso}`);
});

// Publicar una receta sin sus fotos es peor que no publicar: si falta alguna versión
// chica, el build corta y dice qué comando la genera.
if (plan.faltantes.length > 0) {
  console.error(`faltan las versiones chicas de:\n  ${plan.faltantes.join('\n  ')}\n\nCorré: pnpm optimizar`);
  process.exit(1);
}

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

// Las capas de la pantalla de inicio también salen de web/assets/: se copian tal cual
// porque no dependen de ninguna receta, solo de que existan.
rmSync(inicio, { recursive: true, force: true });
mkdirSync(inicio, { recursive: true });
let capas = 0;
for (const capa of readdirSync(join(assets, 'inicio'))) {
  copyFileSync(join(assets, 'inicio', capa), join(inicio, capa));
  capas += 1;
}

console.log(`  catálogo: ${String(plan.json.length)} JSON y ${String(plan.fotos.length)} fotos, y ${String(capas)} capas de inicio`);
