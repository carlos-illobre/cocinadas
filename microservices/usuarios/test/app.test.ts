import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app.js';

describe('la app', () => {
  let app: FastifyInstance;

  // Una app por prueba: Fastify no se puede reabrir después de close().
  beforeEach(() => {
    app = crearApp({ nombre: 'usuarios', version: '0.1.0', logLevel: 'silent' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('configura el logger con el nivel pedido', () => {
    expect(app.log.level).toBe('silent');
  });

  it('no responde en la raíz: la única ruta es /health', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/' });
    expect(respuesta.statusCode).toBe(404);
  });

  it('GET /health responde 200 con el servicio y la versión', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/health' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual({ estado: 'ok', servicio: 'usuarios', version: '0.1.0' });
  });
});
