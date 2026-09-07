import { describe, expect, it } from 'vitest';
import { desgloseDe, enTiempo, experienciaDe, NIVELES, nivelDe, progresoNivel, puntosDe } from './xp';

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
  const paso = (previsto_s: number, real_s: number) => ({ id: 'p', titulo: 'p', previsto_s, real_s, critico: false });

  it('desglosa: fijo por completar, bonus si el total está en tiempo, y un tanto por paso a tiempo', () => {
    expect(desgloseDe({ total_previsto_s: 1260, total_real_s: 1260, pasos: [paso(30, 30), paso(60, 90)] })).toEqual({
      completada: 200,
      bonusEnTiempo: 100,
      pasosATiempo: 10,
      total: 310,
      enTiempo: true,
      pasosEnTiempo: 1,
      pasos: 2,
      precision: 50,
    });
  });

  it.each([
    ['justo', 1260, 1260, true],
    ['10 % por arriba', 1260, 1386, true],
    ['10 % por abajo', 1260, 1134, true],
    ['más de 10 % por arriba', 1260, 1400, false],
    ['más de 10 % por abajo: ir rápido no es precisión', 1260, 1000, false],
    ['sin tiempo previsto', 0, 100, false],
  ])('el total %s (%i contra %i previstos): en tiempo = %s', (_caso, previsto, real, dentro) => {
    expect(enTiempo({ total_previsto_s: previsto, total_real_s: real })).toBe(dentro);
    expect(puntosDe({ total_previsto_s: previsto, total_real_s: real, pasos: [] })).toBe(dentro ? 300 : 200);
  });

  it('sin pasos la precisión es 0, no una división por cero', () => {
    expect(desgloseDe({ total_previsto_s: 100, total_real_s: 100, pasos: [] }).precision).toBe(0);
  });

  it('la experiencia suma todas las cocinadas', () => {
    expect(experienciaDe([])).toBe(0);
    expect(
      experienciaDe([
        { total_previsto_s: 1260, total_real_s: 1260, pasos: [paso(10, 10)] },
        { total_previsto_s: 1260, total_real_s: 2000, pasos: [] },
      ]),
    ).toBe(310 + 200);
  });
});
