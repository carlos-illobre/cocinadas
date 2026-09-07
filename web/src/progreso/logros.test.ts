import { describe, expect, it } from 'vitest';
import type { Cocinada } from '../historial/almacen';
import { logros, logrosNuevos } from './logros';

function cocinada(fecha: string, extra: Partial<Cocinada> = {}): Cocinada {
  return {
    id: fecha,
    plato: 'pasta',
    nombre: 'Spaghetti',
    version: { clave: 'dos-etapas', titulo: 'Mise en place primero' },
    fecha,
    total_previsto_s: 1000,
    total_real_s: 1500,
    etapas: [],
    pasos: [],
    criticos: 3,
    criticosATiempo: 1,
    ...extra,
  };
}

const conseguidos = (cs: readonly Cocinada[]) =>
  logros(cs)
    .filter((l) => l.conseguido)
    .map((l) => l.id);

describe('logros', () => {
  it('sin cocinadas no hay ninguno, pero están los cuatro con su nombre y su ícono', () => {
    const todos = logros([]);
    expect(todos.map((l) => l.id)).toEqual(['primera-receta', 'en-tiempo', 'criticos', 'racha-3']);
    expect(todos.every((l) => l.nombre.length > 0 && l.descripcion.length > 0 && l.icono.length > 0)).toBe(true);
    expect(conseguidos([])).toEqual([]);
  });

  it('la primera receta se consigue con cualquier cocinada', () => {
    expect(conseguidos([cocinada('2026-09-01T10:00:00')])).toEqual(['primera-receta']);
  });

  it('«en tiempo» acepta hasta un 10 % de desvío, para arriba o para abajo', () => {
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { total_real_s: 1100 })])).toContain('en-tiempo');
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { total_real_s: 900 })])).toContain('en-tiempo');
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { total_real_s: 1101 })])).not.toContain('en-tiempo');
  });

  it('sin tiempo previsto no se puede estar «en tiempo»', () => {
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { total_previsto_s: 0, total_real_s: 0 })])).not.toContain('en-tiempo');
  });

  it('«sin pasarse» pide todos los críticos a tiempo, y que haya críticos', () => {
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { criticosATiempo: 3 })])).toContain('criticos');
    expect(conseguidos([cocinada('2026-09-01T10:00:00', { criticos: 0, criticosATiempo: 0 })])).not.toContain('criticos');
  });

  it('la racha pide tres días seguidos, y dos cocinadas del mismo día cuentan una vez', () => {
    const tres = ['2026-09-01T10:00:00', '2026-09-02T20:00:00', '2026-09-03T10:00:00'].map((f) => cocinada(f));
    expect(conseguidos(tres)).toContain('racha-3');

    const conHueco = ['2026-09-01T10:00:00', '2026-09-02T10:00:00', '2026-09-04T10:00:00'].map((f) => cocinada(f));
    expect(conseguidos(conHueco)).not.toContain('racha-3');

    const mismoDia = ['2026-09-01T10:00:00', '2026-09-01T20:00:00', '2026-09-02T10:00:00'].map((f) => cocinada(f));
    expect(conseguidos(mismoDia)).not.toContain('racha-3');
  });

  it('la racha se corta y vuelve a empezar sin perder una racha posterior', () => {
    const fechas = ['2026-09-01T10:00:00', '2026-09-05T10:00:00', '2026-09-06T10:00:00', '2026-09-07T10:00:00'];
    expect(conseguidos(fechas.map((f) => cocinada(f)))).toContain('racha-3');
  });
});

describe('logrosNuevos', () => {
  it('devuelve solo los que se consiguen con esta cocinada', () => {
    const primera = cocinada('2026-09-01T10:00:00');
    expect(logrosNuevos([], primera).map((l) => l.id)).toEqual(['primera-receta']);

    const segunda = cocinada('2026-09-02T10:00:00', { total_real_s: 1000, criticosATiempo: 3 });
    expect(logrosNuevos([primera], segunda).map((l) => l.id)).toEqual(['en-tiempo', 'criticos']);
  });

  it('si no se consigue nada nuevo, no devuelve nada', () => {
    const primera = cocinada('2026-09-01T10:00:00');
    expect(logrosNuevos([primera], cocinada('2026-09-03T10:00:00'))).toEqual([]);
  });
});
