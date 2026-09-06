import { describe, expect, it } from 'vitest';
import { BASE_CATALOGO, listarRecetas, minutos, obtenerReceta, reloj, urlFoto, type Fetch } from './api';

function fetchQueDevuelve(cuerpo: unknown, ok = true, status = 200): { fetchImpl: Fetch; urls: string[] } {
  const urls: string[] = [];
  const fetchImpl: Fetch = (url) => {
    urls.push(url);
    return Promise.resolve({ ok, status, json: () => Promise.resolve(cuerpo) });
  };
  return { fetchImpl, urls };
}

describe('listarRecetas', () => {
  it('pide el JSON del catálogo y devuelve el cuerpo', async () => {
    const { fetchImpl, urls } = fetchQueDevuelve([{ plato: 'a' }]);
    await expect(listarRecetas(fetchImpl)).resolves.toEqual([{ plato: 'a' }]);
    expect(urls).toEqual([`${BASE_CATALOGO}/recetas.json`]);
  });

  it('falla con el código HTTP y la ruta si el catálogo no responde ok', async () => {
    const { fetchImpl } = fetchQueDevuelve({}, false, 502);
    await expect(listarRecetas(fetchImpl)).rejects.toThrow('el catálogo respondió HTTP 502 a /recetas');
  });
});

describe('obtenerReceta', () => {
  it('pide la receta por plato y versión', async () => {
    const { fetchImpl, urls } = fetchQueDevuelve({ plato: 'pasta' });
    await expect(obtenerReceta(fetchImpl, 'pasta', 'dos-etapas')).resolves.toEqual({ plato: 'pasta' });
    expect(urls).toEqual([`${BASE_CATALOGO}/recetas/pasta/dos-etapas.json`]);
  });

  it('falla con el código HTTP si no existe', async () => {
    const { fetchImpl } = fetchQueDevuelve({}, false, 404);
    await expect(obtenerReceta(fetchImpl, 'pasta', 'v9')).rejects.toThrow('HTTP 404 a /recetas/pasta/v9');
  });
});

describe('urlFoto', () => {
  it('antepone el prefijo del proxy a la ruta relativa', () => {
    expect(urlFoto('/fotos/recetas/pasta.jpg')).toBe('api/catalogo/fotos/recetas/pasta.jpg');
  });

  it('deja null en null', () => {
    expect(urlFoto(null)).toBeNull();
  });
});

describe('minutos', () => {
  it.each([
    [1260, '21 min'],
    [960, '16 min'],
    [90, '2 min'],
    [0, '0 min'],
  ])('%i s → %s', (s, texto) => {
    expect(minutos(s)).toBe(texto);
  });
});

describe('reloj', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [70, '1:10'],
    [75, '1:15'],
    [600, '10:00'],
    [1260, '21:00'],
  ])('%i s → %s', (s, texto) => {
    expect(reloj(s)).toBe(texto);
  });
});
