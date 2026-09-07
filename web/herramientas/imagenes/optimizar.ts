/**
 * Genera las versiones chicas de `web/assets/` a partir de los originales.
 *
 *   pnpm optimizar            todas las que falten o hayan cambiado
 *   pnpm optimizar --todas    rehace todas, aunque estén al día
 *
 * Excluido de la cobertura (docs/TESTING.md): no decide nada. Qué imagen, a qué ancho y
 * con qué nombre lo resuelve `plan.ts`, que sí se mide; acá solo se maneja el navegador y
 * se escriben archivos.
 *
 * Convierte con el canvas de Chrome y no con una librería de imágenes para no agregar una
 * dependencia al proyecto por un comando que se corre a mano cada tanto. Es la misma
 * técnica que ya usaba data/inicio-capas/optimizar.mjs, que este script reemplaza.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planificarImagenes, type Imagen } from './plan.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const rehacerTodo = process.argv.includes('--todas');
const PUERTO = 9335;
const NAVEGADORES = ['chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome'];

const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const kb = (n: number): string => `${(n / 1024).toFixed(0)} KB`;

/** Está al día si ya existe y es más nueva que su original. */
function alDia(imagen: Imagen): boolean {
  try {
    return statSync(join(raiz, imagen.destino)).mtimeMs >= statSync(join(raiz, imagen.origen)).mtimeMs;
  } catch {
    return false;
  }
}

const todas = planificarImagenes(raiz);
const pendientes = rehacerTodo ? todas : todas.filter((i) => !alDia(i));
if (pendientes.length === 0) {
  console.log(`nada que hacer: las ${String(todas.length)} imágenes están al día`);
  process.exit(0);
}

const cual = NAVEGADORES.find((n) => spawnSync('sh', ['-c', `command -v ${n}`]).status === 0);
if (cual === undefined) {
  console.error(`no encontré ningún navegador. Instalá alguno de: ${NAVEGADORES.join(', ')}`);
  process.exit(1);
}

const perfil = mkdtempSync(join(tmpdir(), 'cocinadas-img-'));
const navegador = spawn(
  cual,
  [`--remote-debugging-port=${String(PUERTO)}`, '--headless=new', '--no-sandbox', '--no-first-run', `--user-data-dir=${perfil}`, 'about:blank'],
  { stdio: 'ignore' },
);

let wsUrl: string | undefined;
for (let i = 0; i < 60 && wsUrl === undefined; i += 1) {
  try {
    const lista = (await (await fetch(`http://localhost:${String(PUERTO)}/json`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
    wsUrl = lista.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {
    await dormir(250);
  }
}
if (wsUrl === undefined) {
  console.error('el navegador arrancó pero no expuso su puerto de depuración');
  navegador.kill();
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pendientesCdp = new Map<number, (d: { error?: unknown; result?: unknown }) => void>();
ws.onmessage = (m) => {
  const d = JSON.parse(String(m.data)) as { id?: number; error?: unknown; result?: unknown };
  if (d.id !== undefined && pendientesCdp.has(d.id)) {
    (pendientesCdp.get(d.id) as (x: typeof d) => void)(d);
    pendientesCdp.delete(d.id);
  }
};
const cdp = (method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> =>
  new Promise((resolve_, reject) => {
    id += 1;
    pendientesCdp.set(id, (d) => (d.error !== undefined ? reject(new Error(JSON.stringify(d.error))) : resolve_(d.result as Record<string, unknown>)));
    ws.send(JSON.stringify({ id, method, params }));
  });

await cdp('Runtime.enable');

/**
 * La imagen entra como data URL en vez de por archivo: así el navegador no necesita
 * permiso para leer el disco y no importa dónde esté el original.
 */
async function convertir(imagen: Imagen): Promise<number> {
  const original = readFileSync(join(raiz, imagen.origen));
  const tipoEntrada = imagen.origen.endsWith('.png') ? 'image/png' : imagen.origen.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const expresion = `(async () => {
    const img = new Image();
    img.src = 'data:${tipoEntrada};base64,${original.toString('base64')}';
    await img.decode();
    // Nunca agrandar: si el original ya es más chico que el destino, se deja como está.
    const escala = Math.min(1, ${String(imagen.ancho)} / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', ${String(imagen.calidad)}).split(',')[1];
  })()`;
  const r = (await cdp('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true })) as {
    exceptionDetails?: { text: string };
    result: { value: string };
  };
  if (r.exceptionDetails !== undefined) {
    throw new Error(`${imagen.origen}: ${r.exceptionDetails.text}`);
  }
  const salida = Buffer.from(r.result.value, 'base64');
  const destino = join(raiz, imagen.destino);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, salida);
  return salida.length;
}

let antes = 0;
let despues = 0;
for (const imagen of pendientes) {
  const original = statSync(join(raiz, imagen.origen)).size;
  const nueva = await convertir(imagen);
  antes += original;
  despues += nueva;
  console.log(`  ${imagen.destino}  ${kb(original)} → ${kb(nueva)}`);
}

console.log(`\n${String(pendientes.length)} imagen(es): ${kb(antes)} → ${kb(despues)} (${((1 - despues / antes) * 100).toFixed(0)} % menos)`);

ws.close();
navegador.kill();
rmSync(perfil, { recursive: true, force: true });
