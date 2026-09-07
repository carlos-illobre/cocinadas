import type { Etapa, Paso, Proceso } from '../api';
import { progresoPaso, type EstadoCocina } from './modelo';

/** Una fila del gantt: un paso, con su lugar y su alto en píxeles. */
export interface FilaGantt {
  readonly paso: Paso;
  readonly top: number;
  readonly alto: number;
  /**
   * Alto de la barra de manos dentro de la fila. Es menor que `alto` cuando la receta
   * deja un hueco entre este paso y el siguiente: ese hueco es tiempo de la etapa en el
   * que las manos están libres.
   */
  readonly altoBarra: number;
}

/** Un proceso dibujado como barra paralela, en el mismo eje de tiempo que las filas. */
interface CarrilGantt {
  readonly proceso: Proceso;
  readonly top: number;
  readonly alto: number;
}

interface Gantt {
  readonly filas: readonly FilaGantt[];
  readonly carriles: readonly CarrilGantt[];
  readonly alto: number;
}

/** Un paso corto igual tiene que dejar leer su título: por debajo de esto no se achica. */
export const ALTO_MINIMO_FILA = 46;
const PIXELES_POR_SEGUNDO = 0.62;

/** Hasta qué segundo de la etapa abarca un paso: hasta que empieza el siguiente, o hasta que termina él. */
function finDe(etapa: Etapa, i: number): number {
  const paso = etapa.pasos[i] as Paso;
  return etapa.pasos[i + 1]?.inicio_s ?? paso.inicio_s + paso.duracion_s;
}

/**
 * El gantt de la etapa, en vertical: el tiempo corre hacia abajo, cada paso es una barra
 * de manos y cada proceso una barra paralela. La escala es proporcional al tiempo salvo
 * en los pasos muy cortos, que se estiran hasta el mínimo legible; por eso los procesos
 * se ubican con la misma regla que las filas y no con una regla lineal aparte.
 */
export function gantt(etapa: Etapa): Gantt {
  // Cada fila empieza donde terminó la anterior: el acumulado es el `top`.
  const filas = etapa.pasos.reduce<readonly FilaGantt[]>((previas, paso, i) => {
    const abarca_s = Math.max(1, finDe(etapa, i) - paso.inicio_s);
    const alto = Math.max(ALTO_MINIMO_FILA, Math.round(abarca_s * PIXELES_POR_SEGUNDO));
    const top = previas.reduce((suma, f) => suma + f.alto, 0);
    return [...previas, { paso, top, alto, altoBarra: Math.max(12, Math.round((alto * paso.duracion_s) / abarca_s)) }];
  }, []);
  const alto = filas.reduce((suma, f) => suma + f.alto, 0);

  /** Un segundo de la etapa, llevado a píxeles con la misma escala que las filas. */
  const y = (s: number): number => {
    const i = filas.findIndex((_, n) => s <= finDe(etapa, n));
    const fila = filas[i];
    if (fila === undefined) {
      return alto;
    }
    const abarca_s = Math.max(1, finDe(etapa, i) - fila.paso.inicio_s);
    return fila.top + Math.max(0, Math.min(1, (s - fila.paso.inicio_s) / abarca_s)) * fila.alto;
  };

  const carriles = etapa.procesos.map((proceso) => ({ proceso, top: y(proceso.inicio_s), alto: Math.max(12, y(proceso.fin_s) - y(proceso.inicio_s)) }));
  return { filas, carriles, alto };
}

/**
 * Hasta dónde llegó la cocinada dentro del gantt, en píxeles. Es lo que se pinta de
 * verde: todo lo de arriba está hecho y el paso actual va llenándose con su cronómetro.
 */
export function frenteGantt(estado: EstadoCocina, ahora: number, g: Gantt): number {
  const fila = g.filas[estado.paso];
  if (fila === undefined) {
    return g.alto;
  }
  const p = progresoPaso(estado, ahora);
  const avance = p.previsto_s === 0 ? 1 : Math.min(1, p.transcurrido_s / p.previsto_s);
  return fila.top + avance * fila.altoBarra;
}
