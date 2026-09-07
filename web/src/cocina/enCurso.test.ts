import { describe, expect, it } from 'vitest';
import type { Almacen } from '../historial/almacen';
import { recetaDosEtapas, recetaUnaEtapa } from '../pruebas/datos';
import { borrarEnCurso, CLAVE_EN_CURSO, guardarEnCurso, leerEnCurso, MAXIMA_ANTIGUEDAD_MS, recetaEnCurso } from './enCurso';
import { empezar, listo, type EstadoCocina } from './modelo';

const T0 = 1_700_000_000_000;

function memoria(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

describe('la cocinada en curso', () => {
  it('sin nada guardado no hay nada que retomar', () => {
    expect(leerEnCurso(memoria(), recetaDosEtapas, T0)).toBeNull();
  });

  it('guarda y retoma el estado tal cual, con sus marcas de tiempo', () => {
    const almacen = memoria();
    const estado = listo(empezar(recetaDosEtapas, T0), T0 + 30_000);
    guardarEnCurso(almacen, estado, T0 + 30_000);

    const retomado = leerEnCurso(almacen, recetaDosEtapas, T0 + 60_000);

    expect(retomado).toEqual(estado);
    // Las marcas son absolutas: al volver, el cronómetro sigue desde donde iba de verdad.
    expect(retomado?.inicioEtapa_ms).toBe(T0);
    expect(retomado?.paso).toBe(1);
  });

  it('borrar deja de ofrecerla', () => {
    const almacen = memoria();
    guardarEnCurso(almacen, empezar(recetaDosEtapas, T0), T0);
    borrarEnCurso(almacen);
    expect(leerEnCurso(almacen, recetaDosEtapas, T0)).toBeNull();
  });

  it('una cocinada vieja se descarta: retomarla mostraría tiempos absurdos', () => {
    const almacen = memoria();
    guardarEnCurso(almacen, empezar(recetaDosEtapas, T0), T0);

    expect(leerEnCurso(almacen, recetaDosEtapas, T0 + MAXIMA_ANTIGUEDAD_MS)).not.toBeNull();
    expect(leerEnCurso(almacen, recetaDosEtapas, T0 + MAXIMA_ANTIGUEDAD_MS + 1)).toBeNull();
  });

  it('no se retoma la de otra receta ni la de otro modo de preparación', () => {
    const almacen = memoria();
    guardarEnCurso(almacen, empezar(recetaDosEtapas, T0), T0);

    expect(leerEnCurso(almacen, { ...recetaDosEtapas, plato: 'otro-plato' }, T0)).toBeNull();
    // Mismo plato, otro modo: los índices apuntarían a pasos que no son los mismos.
    expect(leerEnCurso(almacen, recetaUnaEtapa, T0)).toBeNull();
  });

  it.each([
    ['basura que no es JSON', 'esto no es json'],
    ['un JSON sin estado', '{"guardadoEn_ms":1}'],
    ['un JSON sin la marca de tiempo', '{"estado":{"receta":{"plato":"spaghetti-integral-brocoli-camarones"}}}'],
    ['una cadena vacía', ''],
  ])('%s no se retoma', (_caso, guardado) => {
    expect(leerEnCurso(memoria({ [CLAVE_EN_CURSO]: guardado }), recetaDosEtapas, T0)).toBeNull();
  });

  it('la receta en curso es la del estado guardado, y nada si no hay o está vieja', () => {
    const almacen = memoria();
    expect(recetaEnCurso(almacen, T0)).toBeNull();

    guardarEnCurso(almacen, empezar(recetaDosEtapas, T0), T0);
    expect(recetaEnCurso(almacen, T0)?.plato).toBe(recetaDosEtapas.plato);
    expect(recetaEnCurso(almacen, T0 + MAXIMA_ANTIGUEDAD_MS + 1)).toBeNull();
  });

  it.each([
    ['sin marca de tiempo', { estado: { receta: recetaDosEtapas } }],
    ['con el estado que no es un objeto', { guardadoEn_ms: T0, estado: 'cocinando' }],
    ['con una receta que no es un objeto', { guardadoEn_ms: T0, estado: { receta: 'pasta' } }],
    ['con una receta sin plato', { guardadoEn_ms: T0, estado: { receta: { version: { clave: 'x' } } } }],
    ['con una receta sin modo', { guardadoEn_ms: T0, estado: { receta: { plato: 'pasta', version: 'x' } } }],
    ['con un modo sin clave', { guardadoEn_ms: T0, estado: { receta: { plato: 'pasta', version: {} } } }],
  ])('un guardado %s se descarta entero: no se castea, se comprueba', (_caso, guardado) => {
    const almacen = memoria({ [CLAVE_EN_CURSO]: JSON.stringify(guardado) });
    expect(recetaEnCurso(almacen, T0)).toBeNull();
    expect(leerEnCurso(almacen, recetaDosEtapas, T0)).toBeNull();
  });

  it('un guardado sin receta no ofrece ninguna', () => {
    const almacen = memoria();
    almacen.setItem(CLAVE_EN_CURSO, JSON.stringify({ guardadoEn_ms: T0, estado: {} }));
    expect(recetaEnCurso(almacen, T0)).toBeNull();
  });

  it('un estado sin receta tampoco rompe', () => {
    const almacen = memoria();
    almacen.setItem(CLAVE_EN_CURSO, JSON.stringify({ guardadoEn_ms: T0, estado: {} as EstadoCocina }));
    expect(leerEnCurso(almacen, recetaDosEtapas, T0)).toBeNull();
  });
});
