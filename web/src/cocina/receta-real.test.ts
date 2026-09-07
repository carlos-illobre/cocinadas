import { describe, expect, it } from 'vitest';
import type { Receta } from '../api';
import v1 from '../../../data/recetas/spaghetti-integral-brocoli-camarones/spaghetti-integral-brocoli-camarones-v1-linea-de-tiempo.json';
import v2 from '../../../data/recetas/spaghetti-integral-brocoli-camarones/spaghetti-integral-brocoli-camarones-v2-dos-etapas.json';
import { atenderAlarma, avanzarReloj, empezar, empezarEtapa, listo, pasoActual } from './modelo';
import { ALTO_MINIMO_FILA, gantt } from './gantt';
import { resumen } from './resumen';

/**
 * La receta real del repositorio, tal como la sirve el catálogo (menos las fotos, que el
 * catálogo agrega): recorrerla entera con el modelo es la prueba de que el JSON de
 * data/recetas/ y la pantalla de cocina hablan el mismo idioma.
 */
function comoServida(json: unknown): Receta {
  const r = json as Receta;
  return { ...r, foto: null, ingredientes: r.ingredientes.map((i) => ({ ...i, foto: null })) };
}

describe.each([
  ['versión 1', comoServida(v1)],
  ['versión 2', comoServida(v2)],
])('la receta real, %s', (_nombre, receta) => {
  it('arma un gantt donde las filas van en orden y los procesos caen dentro de la etapa', () => {
    for (const etapa of receta.etapas) {
      const g = gantt(etapa);
      expect(g.filas).toHaveLength(etapa.pasos.length);
      let esperado = 0;
      for (const f of g.filas) {
        expect(f.top).toBe(esperado);
        expect(f.alto).toBeGreaterThanOrEqual(ALTO_MINIMO_FILA);
        expect(f.altoBarra).toBeGreaterThan(0);
        expect(f.altoBarra).toBeLessThanOrEqual(f.alto);
        esperado += f.alto;
      }
      expect(g.alto).toBe(esperado);
      expect(g.carriles).toHaveLength(etapa.procesos.length);
      for (const c of g.carriles) {
        expect(c.top).toBeGreaterThanOrEqual(0);
        expect(c.top + c.alto).toBeLessThanOrEqual(g.alto);
      }
    }
  });

  it('se cocina entera exactamente a tiempo: cada paso a su duración, cada alarma atendida', () => {
    let t = 0;
    let e = empezar(receta, t);
    for (const etapaReceta of receta.etapas) {
      const inicioEtapa = t;
      for (const paso of etapaReceta.pasos) {
        expect(pasoActual(e).id).toBe(paso.id);
        // Cada paso termina exactamente cuando la receta lo prevé, huecos incluidos.
        t = inicioEtapa + (paso.inicio_s + paso.duracion_s) * 1000;
        e = avanzarReloj(e, t);
        if (e.fase === 'alarma') {
          e = atenderAlarma(e, t);
          // Si la alarma cerró una espera, el bucle ya está en el paso siguiente.
          if (pasoActual(e).id !== paso.id) continue;
        }
        e = listo(e, t);
      }
      if (e.fase === 'fin-etapa') {
        t += 60_000; // una pausa de un minuto entre etapas
        e = empezarEtapa(e, t);
      }
    }
    expect(e.fase).toBe('fin');
    const r = resumen(e);
    expect(r.total_real_s).toBe(receta.tiempo_total_s);
    expect(r.criticosATiempo).toBe(r.criticos);
    expect(r.etapas.map((x) => x.pasos.length)).toEqual(receta.etapas.map((x) => x.pasos.length));
  });
});
