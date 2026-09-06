// Saca el fondo blanco de una capa y la deja lista para la app.
//
//   node quitar-fondo.mjs <carpeta-origen> <archivo.png> <carpeta-salida>
//
// El fondo se detecta por relleno desde los bordes, no por color plano: así los brillos
// claros de adentro del ingrediente (que también son casi blancos) no se vuelven
// transparentes. El borde se suaviza y se le devuelve su color quitándole el blanco que
// tenía mezclado, que es lo que produce el halo claro sobre fondo oscuro.
//
// Nunca toca el archivo de entrada: escribe `<nombre>-sin-fondo.png` (tamaño original,
// para revisar el recorte) y el `<nombre>.webp` de 1000 px de ancho que usa la app.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [ORIGEN, ARCHIVO, DESTINO] = process.argv.slice(2);
const NOMBRE = ARCHIVO.replace(/\.png$/i, '');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9338;
const perfil = mkdtempSync(join(tmpdir(), 'templa-fondo-'));
writeFileSync(join(ORIGEN, 'marco.html'), '<!doctype html><meta charset="utf-8"><title>fondo</title>');
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + JSON.stringify(r.exceptionDetails.exception));
  return r.result.value;
};

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Page.navigate', { url: `file:///${ORIGEN}/marco.html` });
await dormir(1200);

const salida = await evaluar(`(async () => {
  const img = new Image();
  img.src = '${ARCHIVO}';
  await img.decode();
  const A = img.naturalWidth, B = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = A; c.height = B;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  // Primero sobre blanco: así el mismo procedimiento sirve para una foto con fondo blanco
  // y para una capa que ya tenga transparencia y haya que retocar.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, A, B);
  ctx.drawImage(img, 0, 0);
  const datos = ctx.getImageData(0, 0, A, B);
  const d = datos.data;

  // Un píxel es fondo si es claro y sin color. El umbral es flojo a propósito: la foto
  // trae una sombra gris debajo del ingrediente, y sobre la pizarra oscura esa sombra se
  // vería como un halo claro. Al ser gris neutro, la prueba de saturación la separa bien
  // del ingrediente, que siempre tiene algo de color.
  const esFondo = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    return min > 168 && max - min < 26;
  };

  // Relleno desde los bordes: lo blanco de adentro del ingrediente no se toca.
  const fuera = new Uint8Array(A * B);
  const cola = [];
  for (let x = 0; x < A; x++) { cola.push(x); cola.push((B - 1) * A + x); }
  for (let y = 0; y < B; y++) { cola.push(y * A); cola.push(y * A + A - 1); }
  while (cola.length) {
    const p = cola.pop();
    if (fuera[p] || !esFondo(p * 4)) continue;
    fuera[p] = 1;
    const x = p % A, y = (p / A) | 0;
    if (x > 0) cola.push(p - 1);
    if (x < A - 1) cola.push(p + 1);
    if (y > 0) cola.push(p - A);
    if (y < B - 1) cola.push(p + A);
  }

  // Alfa suave: promedio en una ventana chica, para que el borde no quede dentado.
  const R = 3;
  const alfa = new Float32Array(A * B);
  const acum = new Float32Array((A + 1) * (B + 1));
  for (let y = 0; y < B; y++) for (let x = 0; x < A; x++) {
    acum[(y + 1) * (A + 1) + x + 1] = (fuera[y * A + x] ? 0 : 1) + acum[y * (A + 1) + x + 1] + acum[(y + 1) * (A + 1) + x] - acum[y * (A + 1) + x];
  }
  for (let y = 0; y < B; y++) for (let x = 0; x < A; x++) {
    const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(A - 1, x + R), y1 = Math.min(B - 1, y + R);
    const suma = acum[(y1 + 1) * (A + 1) + x1 + 1] - acum[y0 * (A + 1) + x1 + 1] - acum[(y1 + 1) * (A + 1) + x0] + acum[y0 * (A + 1) + x0];
    // El corte encoge el borde un par de píxeles: se lleva lo que quede de sombra
    // pegada al ingrediente, sin que se note en la pantalla.
    const promedio = suma / ((x1 - x0 + 1) * (y1 - y0 + 1));
    alfa[y * A + x] = Math.max(0, Math.min(1, (promedio - 0.4) / 0.6));
  }

  // Al borde se le saca el blanco que traía mezclado; si no, queda un halo claro.
  for (let p = 0; p < A * B; p++) {
    const a = alfa[p];
    const i = p * 4;
    if (a <= 0.004) { d[i + 3] = 0; continue; }
    if (a < 0.999) {
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - 255 * (1 - a)) / a));
    }
    d[i + 3] = Math.round(a * 255);
  }
  ctx.putImageData(datos, 0, 0);
  const png = c.toDataURL('image/png').split(',')[1];

  const chico = document.createElement('canvas');
  const escala = 1000 / A;
  chico.width = Math.round(A * escala); chico.height = Math.round(B * escala);
  const ctx2 = chico.getContext('2d');
  ctx2.imageSmoothingQuality = 'high';
  ctx2.drawImage(c, 0, 0, chico.width, chico.height);
  return { png, webp: chico.toDataURL('image/webp', 0.86).split(',')[1] };
})()`);

const png = Buffer.from(salida.png, 'base64');
const webp = Buffer.from(salida.webp, 'base64');
writeFileSync(join(ORIGEN, `${NOMBRE}-sin-fondo.png`), png);
writeFileSync(join(DESTINO, `${NOMBRE}.webp`), webp);
console.log(`${NOMBRE}-sin-fondo.png`, (png.length / 1024).toFixed(0) + ' KB');
console.log(`${NOMBRE}.webp`, (webp.length / 1024).toFixed(0) + ' KB');

ws.close();
chrome.kill();
