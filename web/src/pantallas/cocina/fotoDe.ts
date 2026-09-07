import { BASE_CATALOGO, type Receta } from '../../api';

/** La foto del ingrediente de un paso o proceso, si la tiene: la muestran la cocina, la alarma y los procesos. */
export function fotoDe(receta: Receta, id: string | null): string | null {
  const ingrediente = receta.ingredientes.find((i) => i.id === id && i.foto !== null);
  return ingrediente === undefined ? null : `${BASE_CATALOGO}${ingrediente.foto}`;
}
