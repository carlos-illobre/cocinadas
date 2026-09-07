import type { Cocinada } from '../historial/almacen';
import { enTiempo } from './xp';

/**
 * Los logros, como en el prototipo de Figma pero medidos con lo que la app realmente
 * guarda: se calculan a partir de las cocinadas, no se almacenan. Así no hay un estado
 * paralelo que pueda quedar desincronizado, y cambiar una regla no invalida nada.
 *
 * Ninguno premia la velocidad: premian llegar cerca de los tiempos de la receta y
 * volver a cocinar.
 */
export interface Logro {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly icono: string;
  readonly conseguido: boolean;
}

// La regla de «en tiempo» es la misma que puntúa (xp.ts): un logro y un bonus no
// pueden discrepar sobre si la cocinada estuvo en tiempo.
export { MARGEN_EN_TIEMPO } from './xp';

/** El día de la cocinada en la zona del teléfono, como `2026-09-06`. */
function dia(c: Cocinada): string {
  const d = new Date(c.fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hayRachaDe(cocinadas: readonly Cocinada[], largo: number): boolean {
  const dias = [...new Set(cocinadas.map(dia))].sort();
  let seguidos = 1;
  for (let i = 1; i < dias.length; i += 1) {
    const anterior = new Date(`${dias[i - 1] as string}T12:00:00Z`).getTime();
    const actual = new Date(`${dias[i] as string}T12:00:00Z`).getTime();
    seguidos = Math.round((actual - anterior) / 86_400_000) === 1 ? seguidos + 1 : 1;
    if (seguidos >= largo) {
      return true;
    }
  }
  return dias.length >= largo && seguidos >= largo;
}

export function logros(cocinadas: readonly Cocinada[]): readonly Logro[] {
  return [
    {
      id: 'primera-receta',
      nombre: 'Primera receta',
      descripcion: 'Cociná una receta de punta a punta.',
      icono: '🍳',
      conseguido: cocinadas.length > 0,
    },
    {
      id: 'en-tiempo',
      nombre: 'En tiempo',
      descripcion: 'Terminá a menos del 10 % del tiempo previsto.',
      icono: '⏱️',
      conseguido: cocinadas.some(enTiempo),
    },
    {
      id: 'criticos',
      nombre: 'Sin pasarse',
      descripcion: 'Hacé todos los pasos críticos a tiempo en una misma cocinada.',
      icono: '🎯',
      conseguido: cocinadas.some((c) => c.criticos > 0 && c.criticosATiempo === c.criticos),
    },
    {
      id: 'racha-3',
      nombre: 'Racha de 3',
      descripcion: 'Cociná tres días seguidos.',
      icono: '🔥',
      conseguido: hayRachaDe(cocinadas, 3),
    },
  ];
}

/** Los que pasan de no conseguidos a conseguidos al sumar una cocinada. */
export function logrosNuevos(previas: readonly Cocinada[], cocinada: Cocinada): readonly Logro[] {
  const antes = new Set(logros(previas).filter((l) => l.conseguido).map((l) => l.id));
  return logros([...previas, cocinada]).filter((l) => l.conseguido && !antes.has(l.id));
}
