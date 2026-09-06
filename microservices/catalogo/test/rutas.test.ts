import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Catalogo, RecetaResumen, RecetaServida } from '../src/catalogo.js';
import { registrarRutas, tipoDeImagen } from '../src/rutas.js';

const resumen: RecetaResumen = {
  plato: 'pasta-brocoli',
  nombre: 'Pasta con brócoli',
  momento: 'cena',
  porciones: 1,
  nutricion: { kcal: 700 },
  foto: '/recetas/pasta-brocoli/foto',
  versiones: [{ numero: 1, clave: 'linea-de-tiempo', titulo: 'Línea', resumen: 'r', icono: '⚡', tiempo_total_s: 960, tiempo_total_texto: '16 min' }],
};

let carpeta: string;
let fotoJpg: string;
let fotoPng: string;
let sinExtension: string;

beforeAll(() => {
  carpeta = mkdtempSync(join(tmpdir(), 'rutas-'));
  fotoJpg = join(carpeta, 'plato.jpg');
  fotoPng = join(carpeta, 'brocoli.png');
  sinExtension = join(carpeta, 'raro.bin');
  writeFileSync(fotoJpg, Buffer.from([0xff, 0xd8, 0xff]));
  writeFileSync(fotoPng, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  writeFileSync(sinExtension, 'x');
});

afterAll(() => {
  rmSync(carpeta, { recursive: true, force: true });
});

function catalogoFalso(): Catalogo {
  const servida = { ...resumen, esquema: 1, version: resumen.versiones[0], ingredientes: [], utensilios: [] } as unknown as RecetaServida;
  return {
    recetas: () => [resumen],
    receta: (plato, version) => (plato === 'pasta-brocoli' && (version === 'linea-de-tiempo' || version === '1') ? servida : null),
    fotoReceta: (plato) => (plato === 'pasta-brocoli' ? fotoJpg : null),
    fotoIngrediente: (id) => (id === 'brocoli-entero' ? fotoPng : id === 'raro' ? sinExtension : null),
    fotoUtensilio: (id) => (id === 'wok-30cm' ? fotoJpg : null),
  };
}

describe('tipoDeImagen', () => {
  it.each([
    ['a.jpg', 'image/jpeg'],
    ['a.JPEG', 'image/jpeg'],
    ['a.png', 'image/png'],
    ['a.webp', 'image/webp'],
  ])('%s → %s', (ruta, tipo) => {
    expect(tipoDeImagen(ruta)).toBe(tipo);
  });

  it('no sirve lo que no es una imagen conocida', () => {
    expect(tipoDeImagen('a.bin')).toBeNull();
    expect(tipoDeImagen('sin-extension')).toBeNull();
  });
});

describe('las rutas del catálogo', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = Fastify({ logger: false });
    registrarRutas(app, catalogoFalso());
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /recetas lista los resúmenes', async () => {
    const r = await app.inject({ method: 'GET', url: '/recetas' });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual([resumen]);
  });

  it.each(['linea-de-tiempo', '1'])('GET /recetas/:plato/%s devuelve la receta', async (version) => {
    const r = await app.inject({ method: 'GET', url: `/recetas/pasta-brocoli/${version}` });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({ plato: 'pasta-brocoli', esquema: 1 });
  });

  it('GET /recetas/:plato/:version responde 404 con el motivo si no existe', async () => {
    const r = await app.inject({ method: 'GET', url: '/recetas/pasta-brocoli/v9' });
    expect(r.statusCode).toBe(404);
    expect(r.json()).toEqual({ error: 'no existe la receta pasta-brocoli en la versión v9' });
  });

  it.each([
    '/recetas/..%2Fsecreto/foto',
    '/recetas/Pasta/foto',
    '/recetas/pasta-brocoli/Version%20Rara',
    '/recetas/..%2Fsecreto/1',
    '/ingredientes/..%2F..%2Fetc/foto',
    '/ingredientes/brocoli_entero/foto',
    '/utensilios/..%2Fsecreto/foto',
  ])('rechaza con 400 un identificador que no es un slug: %s', async (url) => {
    const r = await app.inject({ method: 'GET', url });
    expect(r.statusCode).toBe(400);
  });

  it('con 400 no consulta el catálogo', async () => {
    const catalogo = catalogoFalso();
    let consultas = 0;
    const espia: Catalogo = { ...catalogo, fotoReceta: (p) => { consultas += 1; return catalogo.fotoReceta(p); } };
    const propia = Fastify({ logger: false });
    registrarRutas(propia, espia);
    await propia.inject({ method: 'GET', url: '/recetas/..%2Fsecreto/foto' });
    await propia.close();
    expect(consultas).toBe(0);
  });

  it('GET /recetas/:plato/foto envía el JPEG con caché de un día', async () => {
    const r = await app.inject({ method: 'GET', url: '/recetas/pasta-brocoli/foto' });
    expect(r.statusCode).toBe(200);
    expect(r.headers['content-type']).toBe('image/jpeg');
    expect(r.headers['cache-control']).toBe('public, max-age=86400');
    expect(r.rawPayload).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });

  it('GET /recetas/:plato/foto responde 404 si el plato no tiene foto', async () => {
    const r = await app.inject({ method: 'GET', url: '/recetas/otro-plato/foto' });
    expect(r.statusCode).toBe(404);
    expect(r.json()).toEqual({ error: 'sin foto' });
  });

  it('GET /ingredientes/:id/foto envía el PNG', async () => {
    const r = await app.inject({ method: 'GET', url: '/ingredientes/brocoli-entero/foto' });
    expect(r.statusCode).toBe(200);
    expect(r.headers['content-type']).toBe('image/png');
  });

  it('GET /ingredientes/:id/foto responde 404 si el archivo no es una imagen conocida', async () => {
    const r = await app.inject({ method: 'GET', url: '/ingredientes/raro/foto' });
    expect(r.statusCode).toBe(404);
    expect(r.json()).toEqual({ error: 'sin foto' });
  });

  it('GET /utensilios/:id/foto envía la foto del utensilio', async () => {
    const r = await app.inject({ method: 'GET', url: '/utensilios/wok-30cm/foto' });
    expect(r.statusCode).toBe(200);
    expect(r.headers['content-type']).toBe('image/jpeg');
  });

  it('GET /utensilios/:id/foto responde 404 si no hay foto', async () => {
    const r = await app.inject({ method: 'GET', url: '/utensilios/cuchara/foto' });
    expect(r.statusCode).toBe(404);
  });
});
