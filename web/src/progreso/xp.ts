import type { Cocinada } from '../historial/almacen';

/**
 * La experiencia (XP) y los niveles. Se premia la precisión, no la velocidad: una
 * cocinada suma más puntos cuanto más se parecen sus tiempos a los que estipula la
 * receta. El criterio exacto es provisional y está en `puntosDe`; cambiarlo no toca
 * nada guardado, porque la experiencia se recalcula a partir de las cocinadas.
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

export const PUNTOS_MAXIMOS_POR_COCINADA = 100;

/**
 * Criterio provisional: 100 puntos por una cocinada clavada en el tiempo previsto, que
 * bajan en proporción al desvío (por arriba o por abajo) hasta 0 cuando el desvío iguala
 * al tiempo previsto. Los pasos críticos a tiempo no suman aparte todavía.
 */
export function puntosDe(cocinada: Pick<Cocinada, 'total_previsto_s' | 'total_real_s'>): number {
  if (cocinada.total_previsto_s <= 0) {
    return 0;
  }
  const desvio = Math.abs(cocinada.total_real_s - cocinada.total_previsto_s) / cocinada.total_previsto_s;
  return Math.round(PUNTOS_MAXIMOS_POR_COCINADA * Math.max(0, 1 - desvio));
}

/** La experiencia total es la suma de todas las cocinadas guardadas. */
export function experienciaDe(cocinadas: readonly Pick<Cocinada, 'total_previsto_s' | 'total_real_s'>[]): number {
  return cocinadas.reduce((suma, c) => suma + puntosDe(c), 0);
}
