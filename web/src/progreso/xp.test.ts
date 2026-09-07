import { describe, expect, it } from 'vitest';
import { experienciaDe, NIVELES, nivelDe, progresoNivel, puntosDe } from './xp';

describe('niveles', () => {
  it('son cinco, contiguos y en orden', () => {
    expect(NIVELES.map((n) => n.numero)).toEqual([1, 2, 3, 4, 5]);
    for (let i = 1; i < NIVELES.length; i += 1) {
      expect(NIVELES[i]?.desde_xp).toBe(NIVELES[i - 1]?.hasta_xp);
    }
  });

  it.each([
    [0, 1, 'Aprendiz'],
    [499, 1, 'Aprendiz'],
    [500, 2, 'Cocinero'],
    [1500, 3, 'Sous Chef'],
    [3000, 4, 'Chef'],
    [5000, 5, 'Chef Maestro'],
    [99999, 5, 'Chef Maestro'],
  ])('%i XP es nivel %i (%s)', (xp, numero, nombre) => {
    expect(nivelDe(xp)).toMatchObject({ numero, nombre });
  });

  it('el progreso dentro del nivel va de 0 a 100', () => {
    expect(progresoNivel(0)).toBe(0);
    expect(progresoNivel(250)).toBe(50);
    expect(progresoNivel(499)).toBe(100);
    expect(progresoNivel(500)).toBe(0);
    expect(progresoNivel(1000)).toBe(50);
    expect(progresoNivel(99999)).toBe(100);
  });
});

describe('puntos por cocinada', () => {
  it.each([
    [1260, 1260, 100],
    [1260, 1386, 90],
    [1260, 1134, 90],
    [1260, 2520, 0],
    [1260, 5000, 0],
    [0, 100, 0],
  ])('previsto %i, real %i da %i puntos', (previsto, real, puntos) => {
    expect(puntosDe({ total_previsto_s: previsto, total_real_s: real })).toBe(puntos);
  });

  it('la experiencia suma todas las cocinadas', () => {
    expect(experienciaDe([])).toBe(0);
    expect(
      experienciaDe([
        { total_previsto_s: 1260, total_real_s: 1260 },
        { total_previsto_s: 1260, total_real_s: 1386 },
      ]),
    ).toBe(190);
  });
});
