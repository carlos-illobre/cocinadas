import { describe, expect, it } from 'vitest';
import { reloj } from '../api';
import { recetaDosEtapas, recetaUnaEtapa } from '../pruebas/datos';
import {
  atenderAlarma,
  avanzarReloj,
  carriles,
  desvio,
  empezar,
  empezarEtapa,
  esperaPrevia_s,
  listo,
  pasoActual,
  procesosVisibles,
  progresoPaso,
  proximoVencimiento_s,
  resumen,
  tildar,
  transcurridoEtapa_s,
  UMBRAL_ALERTA_S,
} from './modelo';

const T0 = 1_000_000;
const s = (n: number) => T0 + n * 1000;

describe('empezar', () => {
  it('arranca en la etapa 1, paso 1, con el reloj en cero y sin procesos', () => {
    const e = empezar(recetaDosEtapas, T0);
    expect(e.fase).toBe('cocinando');
    expect([e.etapa, e.paso]).toEqual([0, 0]);
    expect(pasoActual(e).id).toBe('e1-p1');
    expect(e.procesos).toEqual([]);
    expect(e.hechos).toEqual([[], []]);
    expect(transcurridoEtapa_s(e, s(90))).toBe(90);
  });
});

describe('tildar', () => {
  it('marca y desmarca sub-pasos', () => {
    let e = tildar(empezar(recetaDosEtapas, T0), 1);
    expect(e.subpasos).toEqual([1]);
    e = tildar(e, 0);
    expect(e.subpasos).toEqual([1, 0]);
    e = tildar(e, 1);
    expect(e.subpasos).toEqual([0]);
  });
});

describe('listo', () => {
  it('cierra el paso con su tiempo real, limpia los sub-pasos y pasa al siguiente', () => {
    let e = tildar(empezar(recetaDosEtapas, T0), 0);
    e = listo(e, s(34));
    expect(pasoActual(e).id).toBe('e1-p2');
    expect(e.subpasos).toEqual([]);
    expect(e.hechos[0]).toEqual([{ id: 'e1-p1', titulo: 'Pesar y poner a descongelar los camarones', previsto_s: 30, real_s: 34, critico: false }]);
    expect(e.inicioPaso_ms).toBe(s(34));
  });

  it('arranca los procesos que el paso dispara, con la duración del proceso', () => {
    const e = listo(empezar(recetaDosEtapas, T0), s(34));
    expect(e.procesos).toHaveLength(1);
    expect(e.procesos[0]?.proceso.id).toBe('e1-camarones');
    expect(e.procesos[0]?.inicio_ms).toBe(s(34));
    expect(e.procesos[0]?.duracion_s).toBe(600);
  });

  it('no reinicia un proceso que ya corre', () => {
    let e = listo(empezar(recetaDosEtapas, T0), s(34));
    // Se fuerza un paso que vuelve a disparar el mismo proceso.
    const receta = {
      ...recetaDosEtapas,
      etapas: recetaDosEtapas.etapas.map((et, i) =>
        i === 0 ? { ...et, pasos: et.pasos.map((p, j) => (j === 1 ? { ...p, inicia_procesos: ['e1-camarones'] } : p)) } : et,
      ),
    };
    e = listo({ ...e, receta }, s(100));
    expect(e.procesos).toHaveLength(1);
    expect(e.procesos[0]?.inicio_ms).toBe(s(34));
  });

  it('al terminar el último paso de una etapa que no es la última, pasa a la pausa y suelta los procesos', () => {
    let e = listo(empezar(recetaDosEtapas, T0), s(30));
    e = listo(e, s(180));
    e = listo(e, s(700));
    expect(e.fase).toBe('fin-etapa');
    expect(e.etapasReales_s).toEqual([700]);
    expect(e.procesos).toEqual([]);
    expect(e.hechos[0]).toHaveLength(3);
  });

  it('al terminar el último paso de la última etapa, termina', () => {
    let e = empezar(recetaUnaEtapa, T0);
    for (let i = 0; i < 3; i += 1) e = listo(e, s(100 * (i + 1)));
    expect(e.fase).toBe('fin');
    expect(e.etapasReales_s).toEqual([300]);
  });

  it('si la receta deja un hueco antes del paso siguiente, ese paso empieza al final del hueco', () => {
    // p2 previsto de 30 a 180; se lo hace terminar a los 40 s y se corre p3 a los 210 s: hueco de 30 s.
    const receta = {
      ...recetaDosEtapas,
      etapas: recetaDosEtapas.etapas.map((et, i) => (i === 0 ? { ...et, pasos: et.pasos.map((p, j) => (j === 2 ? { ...p, inicio_s: 210 } : p)) } : et)),
    };
    let e = listo(empezar(receta, T0), s(30));
    e = listo(e, s(180));
    expect(pasoActual(e).id).toBe('e1-p3');
    expect(e.inicioPaso_ms).toBe(s(210));
    expect(esperaPrevia_s(e, s(190))).toBe(20);
    expect(esperaPrevia_s(e, s(210))).toBe(0);
    expect(esperaPrevia_s(e, s(300))).toBe(0);
    // Durante el hueco el cronómetro del paso está en cero.
    expect(progresoPaso(e, s(190)).transcurrido_s).toBe(0);
    // Y si se lo da por hecho durante el hueco, el tiempo real es cero, no negativo.
    expect(listo(e, s(190)).hechos[0]?.[2]?.real_s).toBe(0);
  });

  it('el tiempo real nunca es negativo aunque el reloj retroceda', () => {
    const e = listo(empezar(recetaDosEtapas, T0), T0 - 5000);
    expect(e.hechos[0]?.[0]?.real_s).toBe(0);
  });
});

describe('empezarEtapa', () => {
  it('arranca la etapa siguiente con relojes nuevos', () => {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(900));
    expect(e.fase).toBe('cocinando');
    expect([e.etapa, e.paso]).toEqual([1, 0]);
    expect(e.inicioEtapa_ms).toBe(s(900));
    expect(e.inicioPaso_ms).toBe(s(900));
    expect(transcurridoEtapa_s(e, s(910))).toBe(10);
  });
});

describe('avanzarReloj', () => {
  function enEtapa2(): ReturnType<typeof empezar> {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(700));
    return e;
  }

  it('no hace nada si ningún proceso venció', () => {
    const e = listo(empezar(recetaDosEtapas, T0), s(30));
    expect(avanzarReloj(e, s(100))).toBe(e);
  });

  it('un proceso no crítico que vence sale de la lista con un aviso suave', () => {
    let e = listo(empezar(recetaDosEtapas, T0), s(30));
    e = avanzarReloj(e, s(630));
    expect(e.fase).toBe('cocinando');
    expect(e.procesos).toEqual([]);
    expect(e.ultimoAvisoSuave).toBe('e1-camarones');
    expect(e.avisosSuaves).toBe(1);
  });

  it('un proceso crítico que vence dispara la alarma y queda marcado como avisado', () => {
    let e = enEtapa2();
    e = listo(e, s(730)); // Wok al fuego
    e = listo(e, s(775)); // Champiñones → arranca brócoli tapado (180 s)
    e = avanzarReloj(e, s(900));
    expect(e.fase).toBe('cocinando');
    e = avanzarReloj(e, s(955));
    expect(e.fase).toBe('alarma');
    expect(e.alarma).toBe('e2-brocoli');
    expect(e.procesos[0]?.avisado).toBe(true);
    // Un tic más no vuelve a disparar la misma alarma.
    expect(avanzarReloj(e, s(960))).toBe(e);
  });

  it('con un crítico y uno no crítico vencidos a la vez, manda el crítico', () => {
    let e = enEtapa2();
    e = listo(e, s(730));
    e = listo(e, s(775)); // brócoli (180 s, crítico)
    e = listo(e, s(820)); // pasta (420 s, crítico)
    const receta = {
      ...e.receta,
      etapas: e.receta.etapas.map((et, i) => (i === 1 ? { ...et, procesos: et.procesos.map((p) => (p.id === 'e2-pasta' ? { ...p, critico: false } : p)) } : et)),
    };
    e = { ...e, receta, procesos: e.procesos.map((p) => (p.proceso.id === 'e2-pasta' ? { ...p, proceso: { ...p.proceso, critico: false }, duracion_s: 100 } : p)) };
    e = avanzarReloj(e, s(2000));
    expect(e.fase).toBe('alarma');
    expect(e.alarma).toBe('e2-brocoli');
  });

  it('en cualquier fase que no sea cocinando, el reloj no cambia nada', () => {
    let e = enEtapa2();
    e = listo(e, s(730));
    e = listo(e, s(775));
    e = avanzarReloj(e, s(955));
    const enAlarma = e;
    expect(avanzarReloj(enAlarma, s(3000))).toBe(enAlarma);
  });
});

describe('atenderAlarma', () => {
  function conAlarma(): ReturnType<typeof empezar> {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(700));
    e = listo(e, s(730));
    e = listo(e, s(775)); // brócoli 180 s
    e = listo(e, s(820)); // pasta 420 s; ahora en e2-p4 (espera)
    return avanzarReloj(e, s(955));
  }

  it('si el paso actual es una espera, la da por hecha y sigue con el siguiente', () => {
    const e = atenderAlarma(conAlarma(), s(960));
    expect(e.fase).toBe('cocinando');
    expect(e.alarma).toBeNull();
    expect(pasoActual(e).id).toBe('e2-p5');
    expect(e.procesos.map((p) => p.proceso.id)).toEqual(['e2-pasta']);
    expect(e.hechos[1]?.at(-1)).toMatchObject({ id: 'e2-p4', real_s: 140 });
  });

  it('si el paso actual no es una espera, solo apaga la alarma y saca el proceso', () => {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(700));
    e = listo(e, s(730));
    e = listo(e, s(775)); // en e2-p3 (no espera), brócoli corriendo
    e = avanzarReloj(e, s(955));
    e = atenderAlarma(e, s(960));
    expect(e.fase).toBe('cocinando');
    expect(pasoActual(e).id).toBe('e2-p3');
    expect(e.procesos).toEqual([]);
  });
});

describe('progresoPaso', () => {
  it('antes de lo previsto: transcurrido sobre previsto, sin exceso', () => {
    const e = empezar(recetaDosEtapas, T0);
    expect(progresoPaso(e, s(15))).toEqual({ transcurrido_s: 15, previsto_s: 30, exceso_s: 0, previsto_pct: 50, exceso_pct: 0 });
  });

  it('justo a tiempo: 100 % sin exceso', () => {
    const e = empezar(recetaDosEtapas, T0);
    expect(progresoPaso(e, s(30))).toMatchObject({ previsto_pct: 100, exceso_s: 0, exceso_pct: 0 });
  });

  it('pasado de tiempo: la escala crece, lo previsto se comprime y el exceso ocupa el resto', () => {
    const e = empezar(recetaDosEtapas, T0);
    const p = progresoPaso(e, s(40));
    expect(p.exceso_s).toBe(10);
    expect(p.previsto_pct).toBe(75);
    expect(p.exceso_pct).toBe(25);
  });

  it('un paso de duración cero se muestra completo desde el principio', () => {
    const receta = { ...recetaDosEtapas, etapas: recetaDosEtapas.etapas.map((et, i) => (i === 0 ? { ...et, pasos: et.pasos.map((p, j) => (j === 0 ? { ...p, duracion_s: 0 } : p)) } : et)) };
    const e = empezar(receta, T0);
    expect(progresoPaso(e, T0)).toMatchObject({ previsto_pct: 100, exceso_pct: 0 });
    expect(progresoPaso(e, s(5))).toMatchObject({ exceso_s: 5, previsto_pct: 0, exceso_pct: 100 });
  });
});

describe('procesosVisibles y proximoVencimiento_s', () => {
  it('sin procesos no hay vencimiento', () => {
    expect(procesosVisibles(empezar(recetaDosEtapas, T0), T0)).toEqual([]);
    expect(proximoVencimiento_s(empezar(recetaDosEtapas, T0), T0)).toBeNull();
  });

  it('calcula restante y fracción, y marca «por sonar» solo a los críticos cerca de vencer', () => {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    const [c] = procesosVisibles(e, s(330));
    expect(c).toMatchObject({ restante_s: 300, fraccion: 0.5, porSonar: false });
    // A 20 s de vencer, no crítico: no late.
    expect(procesosVisibles(e, s(610))[0]?.porSonar).toBe(false);
    expect(proximoVencimiento_s(e, s(610))).toBe(20);

    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(700));
    e = listo(e, s(730));
    e = listo(e, s(775)); // brócoli crítico 180 s
    expect(procesosVisibles(e, s(775 + 180 - UMBRAL_ALERTA_S))[0]?.porSonar).toBe(true);
    expect(procesosVisibles(e, s(775 + 180 - UMBRAL_ALERTA_S - 1))[0]?.porSonar).toBe(false);
    // Vencido y sin atender: restante 0, fracción 1.
    expect(procesosVisibles(e, s(2000))[0]).toMatchObject({ restante_s: 0, fraccion: 1 });
  });

  it('un proceso de duración cero está completo', () => {
    let e = listo(empezar(recetaDosEtapas, T0), s(30));
    e = { ...e, procesos: e.procesos.map((p) => ({ ...p, duracion_s: 0 })) };
    expect(procesosVisibles(e, s(30))[0]?.fraccion).toBe(1);
  });
});

describe('carriles', () => {
  it('abarca desde la fila siguiente al paso que arranca el proceso hasta el paso que lo atiende', () => {
    const [c] = carriles(recetaDosEtapas.etapas[0] as (typeof recetaDosEtapas.etapas)[number]);
    expect(c).toMatchObject({ desde: 1, hasta: 2 });
    expect(c?.proceso.id).toBe('e1-camarones');
  });

  it('sin paso que lo atienda llega hasta el final; sin paso que lo arranque no se dibuja', () => {
    const etapa = recetaDosEtapas.etapas[1] as (typeof recetaDosEtapas.etapas)[number];
    const sinFin = { ...etapa, procesos: etapa.procesos.map((p) => ({ ...p, al_terminar: null })) };
    expect(carriles(sinFin).map((c) => [c.proceso.id, c.desde, c.hasta])).toEqual([
      ['e2-pasta', 3, 5],
      ['e2-brocoli', 2, 5],
    ]);
    const sinInicio = { ...etapa, pasos: etapa.pasos.map((p) => ({ ...p, inicia_procesos: [] })) };
    expect(carriles(sinInicio)).toEqual([]);
  });
});

describe('resumen y desvio', () => {
  it('suma las etapas y cuenta los críticos a tiempo', () => {
    let e = empezar(recetaUnaEtapa, T0);
    e = listo(e, s(40)); // 30 previsto → +10
    e = listo(e, s(180)); // 150 previsto → 140, −10
    e = listo(e, s(300)); // espera 120 → 120
    const r = resumen(e);
    expect(r.total_previsto_s).toBe(960);
    expect(r.total_real_s).toBe(300);
    expect(r.etapas[0]?.pasos.map((p) => p.real_s)).toEqual([40, 140, 120]);
    expect(r.criticos).toBe(0);
    expect(r.criticosATiempo).toBe(0);
  });

  it('las etapas no terminadas cuentan cero', () => {
    const r = resumen(empezar(recetaDosEtapas, T0));
    expect(r.etapas.map((e) => e.real_s)).toEqual([0, 0]);
    expect(r.total_real_s).toBe(0);
  });

  it('cuenta los críticos a tiempo', () => {
    let e = empezar(recetaDosEtapas, T0);
    e = listo(e, s(30));
    e = listo(e, s(180));
    e = listo(e, s(660));
    e = empezarEtapa(e, s(700));
    e = listo(e, s(730));
    e = listo(e, s(775)); // crítico, 45 previsto, 45 real: a tiempo
    e = listo(e, s(830)); // crítico, 45 previsto, 55 real: pasado
    const r = resumen(e);
    expect(r.criticos).toBe(2);
    expect(r.criticosATiempo).toBe(1);
  });

  it('formatea el desvío con signo', () => {
    expect(desvio(30, 34, reloj)).toEqual({ texto: '+0:04', signo: 'mas' });
    expect(desvio(30, 24, reloj)).toEqual({ texto: '−0:06', signo: 'menos' });
    expect(desvio(30, 30, reloj)).toEqual({ texto: '0:00', signo: 'igual' });
  });
});
