import type { Etapa, Paso, Proceso, Receta } from '../api';

/**
 * El modelo de una cocinada: qué etapa y paso van, cuánto llevan, qué procesos corren
 * solos y cuándo vencen. Es puro: recibe el reloj (`ahora`, en milisegundos) como
 * argumento y devuelve un estado nuevo. La pantalla solo lo dibuja.
 */

export interface PasoHecho {
  readonly id: string;
  readonly titulo: string;
  readonly previsto_s: number;
  readonly real_s: number;
  readonly critico: boolean;
}

interface ProcesoEnCurso {
  readonly proceso: Proceso;
  readonly inicio_ms: number;
  readonly duracion_s: number;
  /** Ya venció y ya se avisó (alarma atendida o aviso suave dado). */
  readonly avisado: boolean;
}

type Fase = 'cocinando' | 'alarma' | 'fin-etapa' | 'fin';

export interface EstadoCocina {
  readonly receta: Receta;
  readonly fase: Fase;
  readonly etapa: number;
  readonly paso: number;
  readonly inicioEtapa_ms: number;
  readonly inicioPaso_ms: number;
  /** Índices de los sub-pasos tildados del paso actual. */
  readonly subpasos: readonly number[];
  /** Pasos terminados, por etapa. */
  readonly hechos: readonly (readonly PasoHecho[])[];
  /** Duración real de cada etapa terminada. */
  readonly etapasReales_s: readonly number[];
  readonly procesos: readonly ProcesoEnCurso[];
  /** Id del proceso crítico que está sonando, o null. */
  readonly alarma: string | null;
  /** Id del último proceso no crítico que venció: la pantalla da un aviso suave al cambiar. */
  readonly ultimoAvisoSuave: string | null;
  /** Cuántos avisos suaves hubo, para distinguir dos seguidos del mismo proceso. */
  readonly avisosSuaves: number;
}

/** Faltan menos de esto para que un proceso venza: se marca como «por sonar». */
export const UMBRAL_ALERTA_S = 30;

export function etapaActual(estado: EstadoCocina): Etapa {
  return estado.receta.etapas[estado.etapa] as Etapa;
}

export function pasoActual(estado: EstadoCocina): Paso {
  return etapaActual(estado).pasos[estado.paso] as Paso;
}

export function empezar(receta: Receta, ahora: number): EstadoCocina {
  return {
    receta,
    fase: 'cocinando',
    etapa: 0,
    paso: 0,
    inicioEtapa_ms: ahora,
    inicioPaso_ms: ahora,
    subpasos: [],
    hechos: receta.etapas.map(() => []),
    etapasReales_s: [],
    procesos: [],
    alarma: null,
    ultimoAvisoSuave: null,
    avisosSuaves: 0,
  };
}

export function tildar(estado: EstadoCocina, indice: number): EstadoCocina {
  const subpasos = estado.subpasos.includes(indice) ? estado.subpasos.filter((i) => i !== indice) : [...estado.subpasos, indice];
  return { ...estado, subpasos };
}

function segundos(desde_ms: number, hasta_ms: number): number {
  return Math.max(0, Math.round((hasta_ms - desde_ms) / 1000));
}

/** Arranca los procesos que el paso terminado dispara; los que ya corren no se reinician. */
function arrancarProcesos(estado: EstadoCocina, paso: Paso, ahora: number): readonly ProcesoEnCurso[] {
  const nuevos = etapaActual(estado)
    .procesos.filter((p) => paso.inicia_procesos.includes(p.id) && !estado.procesos.some((e) => e.proceso.id === p.id))
    .map((proceso) => ({ proceso, inicio_ms: ahora, duracion_s: proceso.fin_s - proceso.inicio_s, avisado: false }));
  return [...estado.procesos, ...nuevos];
}

/** «Listo, siguiente»: cierra el paso actual con su tiempo real y pasa al siguiente, a la pausa entre etapas o al final. */
export function listo(estado: EstadoCocina, ahora: number): EstadoCocina {
  const etapa = etapaActual(estado);
  const paso = pasoActual(estado);
  const hecho: PasoHecho = {
    id: paso.id,
    titulo: paso.titulo,
    previsto_s: paso.duracion_s,
    real_s: segundos(estado.inicioPaso_ms, ahora),
    critico: paso.critico,
  };
  const hechos = estado.hechos.map((h, i) => (i === estado.etapa ? [...h, hecho] : h));
  const procesos = arrancarProcesos(estado, paso, ahora);
  const base = { ...estado, hechos, procesos, subpasos: [] };

  const siguiente = etapa.pasos[estado.paso + 1];
  if (siguiente !== undefined) {
    // La receta puede dejar un hueco entre un paso y el siguiente (por ejemplo, 30 s
    // mientras los champiñones doran solos). El paso siguiente «empieza» recién al final
    // del hueco: hasta entonces la pantalla muestra la cuenta regresiva para empezar.
    const hueco_s = Math.max(0, siguiente.inicio_s - (paso.inicio_s + paso.duracion_s));
    return { ...base, paso: estado.paso + 1, inicioPaso_ms: ahora + hueco_s * 1000 };
  }
  const etapasReales_s = [...estado.etapasReales_s, segundos(estado.inicioEtapa_ms, ahora)];
  const ultima = estado.etapa + 1 >= estado.receta.etapas.length;
  // Al cerrar una etapa, sus procesos dejan de contar: lo que no se atendió ya no importa.
  return { ...base, etapasReales_s, procesos: [], alarma: null, fase: ultima ? 'fin' : 'fin-etapa' };
}

/** «Reiniciar»: el paso actual vuelve a empezar ahora, con los sub-pasos sin tildar. Los procesos siguen. */
export function reiniciarPaso(estado: EstadoCocina, ahora: number): EstadoCocina {
  return { ...estado, inicioPaso_ms: ahora, subpasos: [] };
}

/** Desde la pausa entre etapas: arranca el reloj de la siguiente. */
export function empezarEtapa(estado: EstadoCocina, ahora: number): EstadoCocina {
  return { ...estado, fase: 'cocinando', etapa: estado.etapa + 1, paso: 0, inicioEtapa_ms: ahora, inicioPaso_ms: ahora, subpasos: [] };
}

function vencimiento_ms(p: ProcesoEnCurso): number {
  return p.inicio_ms + p.duracion_s * 1000;
}

/**
 * Cada tic del reloj: si venció un proceso crítico, suena la alarma (una por vez, la más
 * antigua primero); si venció uno no crítico, se lo saca de la lista con un aviso suave.
 */
export function avanzarReloj(estado: EstadoCocina, ahora: number): EstadoCocina {
  if (estado.fase !== 'cocinando') {
    return estado;
  }
  const vencidos = estado.procesos.filter((p) => !p.avisado && ahora >= vencimiento_ms(p));
  if (vencidos.length === 0) {
    return estado;
  }
  const critico = vencidos.find((p) => p.proceso.critico);
  if (critico !== undefined) {
    return {
      ...estado,
      fase: 'alarma',
      alarma: critico.proceso.id,
      procesos: estado.procesos.map((p) => (p === critico ? { ...p, avisado: true } : p)),
    };
  }
  const suave = vencidos[0] as ProcesoEnCurso;
  return {
    ...estado,
    procesos: estado.procesos.filter((p) => p !== suave),
    ultimoAvisoSuave: suave.proceso.id,
    avisosSuaves: estado.avisosSuaves + 1,
  };
}

/**
 * Se tocó el botón de la alarma: el proceso sale de la lista y, si el paso actual era una
 * espera, se lo da por hecho y se sigue con el siguiente (que es lo que la alarma pedía).
 */
export function atenderAlarma(estado: EstadoCocina, ahora: number): EstadoCocina {
  const sinProceso: EstadoCocina = {
    ...estado,
    fase: 'cocinando',
    alarma: null,
    procesos: estado.procesos.filter((p) => p.proceso.id !== estado.alarma),
  };
  return pasoActual(estado).espera ? listo(sinProceso, ahora) : sinProceso;
}

// ─── Lo que la pantalla necesita leer ────────────────────────────────────────

export interface ProgresoPaso {
  readonly transcurrido_s: number;
  readonly previsto_s: number;
  /** Segundos por encima de lo previsto; 0 si todavía no se pasó. */
  readonly exceso_s: number;
  /** Ancho (0–100) del tramo previsto y del exceso, sobre una escala que crece con el exceso. */
  readonly previsto_pct: number;
  readonly exceso_pct: number;
}

export function progresoPaso(estado: EstadoCocina, ahora: number): ProgresoPaso {
  const previsto_s = pasoActual(estado).duracion_s;
  const transcurrido_s = segundos(estado.inicioPaso_ms, ahora);
  if (transcurrido_s <= previsto_s) {
    return { transcurrido_s, previsto_s, exceso_s: 0, previsto_pct: previsto_s === 0 ? 100 : (transcurrido_s / previsto_s) * 100, exceso_pct: 0 };
  }
  // Pasado de tiempo: la escala es lo transcurrido, lo previsto se comprime y el exceso crece.
  const previsto_pct = (previsto_s / transcurrido_s) * 100;
  return { transcurrido_s, previsto_s, exceso_s: transcurrido_s - previsto_s, previsto_pct, exceso_pct: 100 - previsto_pct };
}

export interface ProcesoVisible {
  readonly proceso: Proceso;
  readonly restante_s: number;
  readonly fraccion: number;
  readonly porSonar: boolean;
}

export function procesosVisibles(estado: EstadoCocina, ahora: number): readonly ProcesoVisible[] {
  return estado.procesos.map((p) => {
    const restante_s = Math.max(0, Math.round((vencimiento_ms(p) - ahora) / 1000));
    return {
      proceso: p.proceso,
      restante_s,
      fraccion: p.duracion_s === 0 ? 1 : Math.min(1, (p.duracion_s - restante_s) / p.duracion_s),
      porSonar: restante_s <= UMBRAL_ALERTA_S && p.proceso.critico,
    };
  });
}

/** Lo que falta para que venza el proceso que más pronto vence, para las esperas. */
export function proximoVencimiento_s(estado: EstadoCocina, ahora: number): number | null {
  const visibles = procesosVisibles(estado, ahora);
  return visibles.length === 0 ? null : Math.min(...visibles.map((v) => v.restante_s));
}

/** Segundos que faltan para que el paso actual empiece (el hueco previo); 0 si ya empezó. */
export function esperaPrevia_s(estado: EstadoCocina, ahora: number): number {
  return segundos(ahora, estado.inicioPaso_ms);
}

export function transcurridoEtapa_s(estado: EstadoCocina, ahora: number): number {
  return segundos(estado.inicioEtapa_ms, ahora);
}
