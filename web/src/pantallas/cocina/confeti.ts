

interface Papelito {
  readonly id: number;
  readonly color: string;
  readonly izquierda: number;
  readonly demora: number;
  readonly duracion: number;
  readonly tamano: number;
  readonly redondo: boolean;
}

// Los siete del prototipo. El último es el blanco roto del fondo: casi no se ve en tema
// claro y en oscuro es el que más resalta.
const COLORES_CONFETI = ['#FF6B35', '#FFD166', '#06D6A0', '#4ECDC4', '#FF6B9D', '#C77DFF', '#FAFAF7'];

/** Los papelitos del festejo, sorteados una sola vez al llegar a la pantalla. */
export function confeti(cuantos: number): readonly Papelito[] {
  return Array.from({ length: cuantos }, (_, id) => ({
    id,
    color: COLORES_CONFETI[id % COLORES_CONFETI.length] as string,
    izquierda: Math.random() * 100,
    demora: Math.random() * 1.5,
    duracion: 2.5 + Math.random() * 2,
    tamano: 6 + Math.random() * 8,
    redondo: id % 2 === 0,
  }));
}
