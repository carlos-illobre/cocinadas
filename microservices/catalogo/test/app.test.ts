import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app.js';
import type { Catalogo } from '../src/catalogo.js';

const inventario = { recetas: 2, ingredientes: 27, utensilios: 22 };

export const catalogoVacio: Catalogo = {
  recetas: () => [],
  receta: () => null,
  fotoReceta: () => null,
  fotoIngrediente: () => null,
  fotoUtensilio: () => null,
};

describe('la app', () => {
  let app: FastifyInstance;

  // Una app por prueba: Fastify no se puede reabrir después de close().
  beforeEach(async () => {
    app = await crearApp({
      nombre: 'catalogo',
      version: '0.1.0',
      logLevel: 'silent',
      limitePorMinuto: 1000,
      inventariar: () => inventario,
      catalogo: catalogoVacio,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('corta con 429 al pasarse del límite de peticiones, contando por cliente', async () => {
    const limitada = await crearApp({ nombre: 'catalogo', version: '0.1.0', logLevel: 'silent', inventariar: () => inventario, catalogo: catalogoVacio, limitePorMinuto: 2 });
    const pedir = (ip: string) => limitada.inject({ method: 'GET', url: '/health', remoteAddress: ip });

    expect((await pedir('203.0.113.7')).statusCode).toBe(200);
    expect((await pedir('203.0.113.7')).statusCode).toBe(200);
    const tercera = await pedir('203.0.113.7');
    expect(tercera.statusCode).toBe(429);
    expect(tercera.headers['retry-after']).toBeDefined();

    // Otro cliente tiene su propio cupo: uno que se pasa no deja a los demás afuera.
    expect((await pedir('203.0.113.8')).statusCode).toBe(200);
    await limitada.close();
  });

  it('configura el logger con el nivel pedido', () => {
    expect(app.log.level).toBe('silent');
  });

  it('no responde en la raíz', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/' });
    expect(respuesta.statusCode).toBe(404);
  });

  it('GET /health responde 200 con el servicio, la versión y el inventario del catálogo', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/health' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual({
      estado: 'ok',
      servicio: 'catalogo',
      version: '0.1.0',
      catalogo: inventario,
    });
  });

  it('registra las rutas del catálogo', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/recetas' });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual([]);
  });
});
