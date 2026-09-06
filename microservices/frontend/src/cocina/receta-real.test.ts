import { describe, expect, it } from 'vitest';
import type { Receta } from '../api';
import v1 from '../../../../data/recetas/spaghetti-integral-brocoli-camarones/spaghetti-integral-brocoli-camarones-v1-linea-de-tiempo.json';
import v2 from '../../../../data/recetas/spaghetti-integral-brocoli-camarones/spaghetti-integral-brocoli-camarones-v2-dos-etapas.json';
import { atenderAlarma, avanzarReloj, carriles, empezar, empezarEtapa, listo, pasoActual, resumen } from './modelo';

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
  it('tiene carriles para cada proceso que algún paso arranca, dentro de las filas de su etapa', () => {
    for (const etapa of receta.etapas) {
      const lanes = carriles(etapa);
      const arrancados = etapa.procesos.filter((p) => etapa.pasos.some((paso) => paso.inicia_procesos.includes(p.id)));
      expect(lanes).toHaveLength(arrancados.length);
      for (const c of lanes) {
        expect(c.desde).toBeGreaterThanOrEqual(1);
        expect(c.hasta).toBeLessThanOrEqual(etapa.pasos.length);
        expect(c.hasta).toBeGreaterThanOrEqual(c.desde);
      }
    }
  });

  it('se cocina entera exactamente a tiempo: cada paso a su duración, cada alarma atendida', () => {
    let t = 0;
    let e = empezar(receta, t);
    for (let etapa = 0; etapa < receta.etapas.length; etapa += 1) {
      const pasos = receta.etapas[etapa]?.pasos ?? [];
      const inicioEtapa = t;
      for (let i = 0; i < pasos.length; i += 1) {
        expect(pasoActual(e).id).toBe(pasos[i]?.id);
        // Cada paso termina exactamente cuando la receta lo prevé, huecos incluidos.
        t = inicioEtapa + ((pasos[i]?.inicio_s ?? 0) + (pasos[i]?.duracion_s ?? 0)) * 1000;
        e = avanzarReloj(e, t);
        if (e.fase === 'alarma') {
          e = atenderAlarma(e, t);
          // Si la alarma cerró una espera, el bucle ya está en el paso siguiente.
          if (pasoActual(e).id !== pasos[i]?.id) continue;
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
