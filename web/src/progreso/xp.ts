import type { Cocinada } from '../historial/almacen';

/**
 * La experiencia (XP) y los niveles.
 *
 * El criterio, adoptado con la pantalla de resultados: una
 * cocinada suma un fijo por completarla, un bonus si el total quedó dentro del margen
 * del tiempo previsto, y un tanto por cada paso que no se pasó de su tiempo. Está
 * confirmado por Carlos (CLAUDE.md); cambiarlo no tocaría nada guardado, porque la
 * experiencia se recalcula a partir de las cocinadas.
 */
export interface Nivel {
  readonly numero: number;
  readonly nombre: string;
  readonly desde_xp: number;
  readonly hasta_xp: number;
}

export const NIVELES: readonly Nivel[] = [
  { numero: 1, nombre: 'Aprendiz', desde_xp: 0, hasta_xp: 500 },
  { numero: 2, nombre: 'Cocinero', desde_xp: 500, hasta_xp: 1500 },
  { numero: 3, nombre: 'Sous Chef', desde_xp: 1500, hasta_xp: 3000 },
  { numero: 4, nombre: 'Chef', desde_xp: 3000, hasta_xp: 5000 },
  { numero: 5, nombre: 'Chef Maestro', desde_xp: 5000, hasta_xp: 9999 },
];

/** El nivel al que corresponde una cantidad de XP; el último no se supera. */
export function nivelDe(xp: number): Nivel {
  return NIVELES.find((n) => xp >= n.desde_xp && xp < n.hasta_xp) ?? (NIVELES[NIVELES.length - 1] as Nivel);
}

/** Cuánto del nivel actual está recorrido, de 0 a 100. */
export function progresoNivel(xp: number): number {
  const nivel = nivelDe(xp);
  const recorrido = (xp - nivel.desde_xp) / (nivel.hasta_xp - nivel.desde_xp);
  return Math.min(100, Math.max(0, Math.round(recorrido * 100)));
}

export const PUNTOS_POR_COMPLETAR = 200;
export const BONUS_EN_TIEMPO = 100;
export const PUNTOS_POR_PASO_A_TIEMPO = 10;

/**
 * Dentro de este margen del tiempo previsto, por arriba o por abajo, el total se
 * considera «en tiempo». Es simétrico a propósito: se premia la precisión, no la
 * velocidad, y terminar en la mitad del tiempo es tan poco preciso como tardar el doble.
 */
export const MARGEN_EN_TIEMPO = 0.1;

export function enTiempo(c: Pick<Cocinada, 'total_previsto_s' | 'total_real_s'>): boolean {
  if (c.total_previsto_s <= 0) {
    return false;
  }
  return Math.abs(c.total_real_s - c.total_previsto_s) / c.total_previsto_s <= MARGEN_EN_TIEMPO;
}

export interface DesgloseXp {
  readonly completada: number;
  readonly bonusEnTiempo: number;
  readonly pasosATiempo: number;
  readonly total: number;
  readonly enTiempo: boolean;
  readonly pasosEnTiempo: number;
  readonly pasos: number;
  /** Pasos en tiempo sobre el total, de 0 a 100. */
  readonly precision: number;
}

type Puntuable = Pick<Cocinada, 'total_previsto_s' | 'total_real_s' | 'pasos'>;

/** Un paso está a tiempo si no se pasó del suyo: en un paso, ir más rápido no es un error. */
export function desgloseDe(c: Puntuable): DesgloseXp {
  const pasosEnTiempo = c.pasos.filter((p) => p.real_s <= p.previsto_s).length;
  const dentro = enTiempo(c);
  const bonusEnTiempo = dentro ? BONUS_EN_TIEMPO : 0;
  const pasosATiempo = pasosEnTiempo * PUNTOS_POR_PASO_A_TIEMPO;
  return {
    completada: PUNTOS_POR_COMPLETAR,
    bonusEnTiempo,
    pasosATiempo,
    total: PUNTOS_POR_COMPLETAR + bonusEnTiempo + pasosATiempo,
    enTiempo: dentro,
    pasosEnTiempo,
    pasos: c.pasos.length,
    precision: c.pasos.length === 0 ? 0 : Math.round((pasosEnTiempo / c.pasos.length) * 100),
  };
}

export function puntosDe(c: Puntuable): number {
  return desgloseDe(c).total;
}

/** La experiencia total es la suma de todas las cocinadas guardadas. */
export function experienciaDe(cocinadas: readonly Puntuable[]): number {
  return cocinadas.reduce((suma, c) => suma + puntosDe(c), 0);
}
