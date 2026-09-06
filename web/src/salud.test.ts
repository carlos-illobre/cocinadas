import { describe, expect, it } from 'vitest';
import { consultarSalud, consultarTodos, type Fetch } from './salud';

function respuesta(ok: boolean, status: number, cuerpo: unknown): ReturnType<Fetch> {
  return Promise.resolve({ ok, status, json: () => Promise.resolve(cuerpo) });
}

describe('consultarSalud', () => {
  it('devuelve ok con la versión cuando el servicio responde 200', async () => {
    const fetchImpl: Fetch = () => respuesta(true, 200, { estado: 'ok', servicio: 'catalogo', version: '0.1.0' });
    await expect(consultarSalud('catalogo', fetchImpl)).resolves.toEqual({
      servicio: 'catalogo',
      estado: 'ok',
      version: '0.1.0',
    });
  });

  it('pide la ruta del servicio a través del proxy', async () => {
    const urls: string[] = [];
    const fetchImpl: Fetch = (url) => {
      urls.push(url);
      return respuesta(true, 200, { version: '1' });
    };
    await consultarSalud('usuarios', fetchImpl);
    expect(urls).toEqual(['/api/usuarios/health']);
  });

  it('marca caído con el código HTTP cuando la respuesta no es ok', async () => {
    const fetchImpl: Fetch = () => respuesta(false, 502, {});
    await expect(consultarSalud('cocinadas', fetchImpl)).resolves.toEqual({
      servicio: 'cocinadas',
      estado: 'caido',
      detalle: 'HTTP 502',
    });
  });

  it.each([null, 'texto', {}, { version: 3 }])('marca caído si el cuerpo no trae versión: %j', async (cuerpo) => {
    const fetchImpl: Fetch = () => respuesta(true, 200, cuerpo);
    await expect(consultarSalud('catalogo', fetchImpl)).resolves.toEqual({
      servicio: 'catalogo',
      estado: 'caido',
      detalle: 'respuesta sin versión',
    });
  });

  it('marca caído con el mensaje cuando fetch lanza un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject(new Error('Failed to fetch'));
    await expect(consultarSalud('catalogo', fetchImpl)).resolves.toEqual({
      servicio: 'catalogo',
      estado: 'caido',
      detalle: 'Failed to fetch',
    });
  });

  it('marca caído convirtiendo a texto lo que no es un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject('se cortó');
    await expect(consultarSalud('catalogo', fetchImpl)).resolves.toMatchObject({
      estado: 'caido',
      detalle: 'se cortó',
    });
  });
});

describe('consultarTodos', () => {
  it('consulta los tres servicios en orden', async () => {
    const fetchImpl: Fetch = (url) => respuesta(true, 200, { version: url });
    const estados = await consultarTodos(fetchImpl);
    expect(estados.map((e) => e.servicio)).toEqual(['catalogo', 'usuarios', 'cocinadas']);
    expect(estados.every((e) => e.estado === 'ok')).toBe(true);
  });
});
