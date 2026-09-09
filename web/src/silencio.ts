import type { Almacen } from './historial/almacen';

/** Si los sonidos están apagados. Se guarda en el teléfono, como el tema. */
export const CLAVE_SILENCIO = 'cocinadas.silencio';

export function leerSilencio(almacen: Almacen): boolean {
  return almacen.getItem(CLAVE_SILENCIO) === 'si';
}

export function guardarSilencio(almacen: Almacen, silencio: boolean): void {
  almacen.setItem(CLAVE_SILENCIO, silencio ? 'si' : 'no');
}
