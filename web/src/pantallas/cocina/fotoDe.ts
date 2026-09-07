import { BASE_CATALOGO, urlFoto, type Receta } from '../../api';

/** Las fotos del ingrediente de un paso o proceso, si las tiene: la chica para las listas y la grande para ampliar. */
export function fotoDe(receta: Receta, id: string | null): { readonly chica: string; readonly grande: string | null } | null {
  const ingrediente = receta.ingredientes.find((i) => i.id === id && i.foto !== null);
  return ingrediente === undefined ? null : { chica: `${BASE_CATALOGO}${ingrediente.foto}`, grande: urlFoto(ingrediente.foto_grande) };
}
