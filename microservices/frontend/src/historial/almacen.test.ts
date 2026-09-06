import { describe, expect, it } from 'vitest';
import { almacenSeguro, CLAVE_COCINADAS, fechaCorta, guardarCocinada, listarCocinadas, progresoPorReceta, type Almacen, type Cocinada } from './almacen';

function memoria(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

function cocinada(id: string, fecha: string, real: number, plato = 'pasta', extra: Partial<Cocinada> = {}): Cocinada {
  return {
    id,
    plato,
    nombre: `Plato ${plato}`,
    version: { clave: 'dos-etapas', titulo: 'Mise en place primero' },
    fecha,
    total_previsto_s: 1260,
    total_real_s: real,
    etapas: [],
    pasos: [],
    criticos: 6,
    criticosATiempo: 5,
    ...extra,
  };
}

describe('listarCocinadas', () => {
  it('sin nada guardado devuelve una lista vacía', () => {
    expect(listarCocinadas(memoria())).toEqual([]);
  });

  it('devuelve de la más reciente a la más antigua', () => {
    const a = memoria({ [CLAVE_COCINADAS]: JSON.stringify([cocinada('1', '2026-09-01T10:00:00Z', 1300), cocinada('2', '2026-09-05T10:00:00Z', 1200)]) });
    expect(listarCocinadas(a).map((c) => c.id)).toEqual(['2', '1']);
  });

  it.each(['{no es json', '"texto"', '42', '{}'])('con basura guardada (%s) devuelve vacío en vez de romper', (basura) => {
    expect(listarCocinadas(memoria({ [CLAVE_COCINADAS]: basura }))).toEqual([]);
  });

  it('ignora los elementos que no tienen forma de cocinada', () => {
    const a = memoria({ [CLAVE_COCINADAS]: JSON.stringify([cocinada('1', '2026-09-01T10:00:00Z', 1300), { id: 5 }, null, 'x']) });
    expect(listarCocinadas(a).map((c) => c.id)).toEqual(['1']);
  });
});

describe('guardarCocinada', () => {
  it('agrega al frente y persiste', () => {
    const a = memoria();
    guardarCocinada(a, cocinada('1', '2026-09-01T10:00:00Z', 1300));
    const todas = guardarCocinada(a, cocinada('2', '2026-09-05T10:00:00Z', 1200));
    expect(todas.map((c) => c.id)).toEqual(['2', '1']);
    expect(listarCocinadas(a).map((c) => c.id)).toEqual(['2', '1']);
  });

  it('reemplaza una cocinada con el mismo id en vez de duplicarla', () => {
    const a = memoria();
    guardarCocinada(a, cocinada('1', '2026-09-01T10:00:00Z', 1300));
    const todas = guardarCocinada(a, cocinada('1', '2026-09-01T10:00:00Z', 1250));
    expect(todas).toHaveLength(1);
    expect(todas[0]?.total_real_s).toBe(1250);
  });
});

describe('progresoPorReceta', () => {
  it('agrupa por plato, ordena los intentos del más antiguo al más reciente y calcula mejor, promedio y objetivo', () => {
    const lista = [
      cocinada('3', '2026-09-05T10:00:00Z', 1200, 'pasta', { total_previsto_s: 1260 }),
      cocinada('1', '2026-09-01T10:00:00Z', 1400, 'pasta', { total_previsto_s: 960 }),
      cocinada('2', '2026-09-03T10:00:00Z', 1300, 'pasta'),
      cocinada('9', '2026-09-02T10:00:00Z', 900, 'merluza', { total_previsto_s: 1000 }),
    ];
    const p = progresoPorReceta(lista);
    expect(p.map((r) => r.plato)).toEqual(['pasta', 'merluza']);
    const pasta = p[0];
    expect(pasta?.intentos.map((i) => i.id)).toEqual(['1', '2', '3']);
    expect(pasta?.mejor_s).toBe(1200);
    expect(pasta?.promedio_s).toBe(1300);
    // El objetivo es el de la versión del último intento.
    expect(pasta?.objetivo_s).toBe(1260);
    expect(pasta?.nombre).toBe('Plato pasta');
    expect(p[1]).toMatchObject({ mejor_s: 900, promedio_s: 900, objetivo_s: 1000 });
  });

  it('sin cocinadas no hay recetas', () => {
    expect(progresoPorReceta([])).toEqual([]);
  });
});

describe('fechaCorta', () => {
  it('muestra día, mes corto, año y hora en el idioma pedido', () => {
    const texto = fechaCorta('2026-09-05T19:40:00Z', 'es-AR');
    expect(texto).toMatch(/2026/);
    expect(texto).toMatch(/·/);
    expect(texto).toMatch(/\d{2}:\d{2}/);
  });

  it('usa es-AR por omisión', () => {
    expect(fechaCorta('2026-09-05T19:40:00Z')).toBe(fechaCorta('2026-09-05T19:40:00Z', 'es-AR'));
  });
});

describe('almacenSeguro', () => {
  it('sin almacenamiento del navegador, recuerda en memoria', () => {
    const a = almacenSeguro(undefined);
    expect(a.getItem('x')).toBeNull();
    a.setItem('x', '1');
    expect(a.getItem('x')).toBe('1');
  });

  it('con almacenamiento, lee y escribe en el', () => {
    const real = memoria({ y: '2' });
    const a = almacenSeguro(real);
    expect(a.getItem('y')).toBe('2');
    a.setItem('z', '3');
    expect(real.datos.get('z')).toBe('3');
  });

  it('si el almacenamiento lanza, sigue en memoria sin romper', () => {
    const roto: Almacen = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    };
    const a = almacenSeguro(roto);
    expect(a.getItem('x')).toBeNull();
    a.setItem('x', '1');
    expect(a.getItem('x')).toBe('1');
  });
});
