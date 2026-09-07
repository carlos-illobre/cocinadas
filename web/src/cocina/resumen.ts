import type { Cocinada } from '../historial/almacen';
import type { EstadoCocina, PasoHecho } from './modelo';

interface Resumen {
  readonly total_previsto_s: number;
  readonly total_real_s: number;
  readonly etapas: readonly { readonly nombre: string; readonly previsto_s: number; readonly real_s: number; readonly pasos: readonly PasoHecho[] }[];
  readonly criticos: number;
  readonly criticosATiempo: number;
}

export function resumen(estado: EstadoCocina): Resumen {
  const etapas = estado.receta.etapas.map((e, i) => ({
    nombre: e.nombre,
    previsto_s: e.duracion_s,
    real_s: estado.etapasReales_s[i] ?? 0,
    pasos: estado.hechos[i] as readonly PasoHecho[],
  }));
  const criticos = etapas.flatMap((e) => e.pasos).filter((p) => p.critico);
  return {
    total_previsto_s: estado.receta.tiempo_total_s,
    total_real_s: etapas.reduce((t, e) => t + e.real_s, 0),
    etapas,
    criticos: criticos.length,
    criticosATiempo: criticos.filter((p) => p.real_s <= p.previsto_s).length,
  };
}

/** La cocinada tal como se guarda, sin el id, que lo pone quien guarda. */
export function cocinadaDe(estado: EstadoCocina, fecha: string): Omit<Cocinada, 'id'> {
  const r = resumen(estado);
  return {
    plato: estado.receta.plato,
    nombre: estado.receta.nombre,
    version: { clave: estado.receta.version.clave, titulo: estado.receta.version.titulo },
    fecha,
    total_previsto_s: r.total_previsto_s,
    total_real_s: r.total_real_s,
    etapas: r.etapas.map((e) => ({ nombre: e.nombre, previsto_s: e.previsto_s, real_s: e.real_s })),
    pasos: r.etapas.flatMap((e) => e.pasos),
    criticos: r.criticos,
    criticosATiempo: r.criticosATiempo,
  };
}

type Signo = 'mas' | 'menos' | 'igual';

/** «+0:12», «−0:06» o «0:00», para las columnas de desvío. */
export function desvio(previsto_s: number, real_s: number, reloj: (s: number) => string): { readonly texto: string; readonly signo: Signo } {
  const d = real_s - previsto_s;
  const signo: Signo = d > 0 ? 'mas' : d < 0 ? 'menos' : 'igual';
  const texto = { mas: `+${reloj(d)}`, menos: `−${reloj(-d)}`, igual: reloj(0) }[signo];
  return { texto, signo };
}

/** La clase CSS de un desvío: `plus`, `minus` o ninguna. */
export const CLASE_DESVIO: Readonly<Record<Signo, string>> = { mas: 'plus', menos: 'minus', igual: '' };
