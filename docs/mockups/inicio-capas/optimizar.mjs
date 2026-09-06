// Convierte las capas de la pantalla de inicio a formatos livianos usando el canvas de
// Chrome: el fondo (opaco) a JPEG y los vegetales (con transparencia) a WebP.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ORIGEN = process.argv[2];
const DESTINO = process.argv[3];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9335;
const perfil = mkdtempSync(join(tmpdir(), 'cocinadas-opt-'));
const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, '--headless=new', '--no-first-run', '--allow-file-access-from-files', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i += 1) {
  try {
    const lista = await (await fetch(`http://localhost:${PUERTO}/json`)).json();
    wsUrl = lista.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {
    await dormir(200);
  }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pendientes = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pendientes.has(d.id)) {
    pendientes.get(d.id)(d);
    pendientes.delete(d.id);
  }
};
const cdp = (method, params = {}) =>
  new Promise((resolve, reject) => {
    id += 1;
    pendientes.set(id, (d) => (d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluar = async (expresion) => {
  const r = await cdp('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Page.navigate', { url: `file:///${ORIGEN}/marco.html` });
await dormir(1500);

// El ancho de trabajo: el lienzo original es 1414x2000; con 1000 px de ancho alcanza para
// una pantalla de teléfono a 3x sin que se note.
const convertir = async (nombre, tipo, calidad, ancho) => {
  const datos = await evaluar(`(async () => {
    const img = new Image();
    img.src = '${nombre}.png';
    await img.decode();
    const escala = ${ancho} / img.naturalWidth;
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('${tipo}', ${calidad}).split(',')[1];
  })()`);
  const buf = Buffer.from(datos, 'base64');
  const ext = tipo === 'image/jpeg' ? 'jpg' : 'webp';
  writeFileSync(join(DESTINO, `${nombre}.${ext}`), buf);
  console.log(`${nombre}.${ext}`, (buf.length / 1024).toFixed(0) + ' KB');
};

await convertir('1', 'image/jpeg', 0.84, 1000);
for (let n = 2; n <= 10; n += 1) await convertir(String(n), 'image/webp', 0.86, 1000);

ws.close();
chrome.kill();
