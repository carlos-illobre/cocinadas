import { useState } from 'react';
import type { Almacen } from '../historial/almacen';
import { guardarSilencio, leerSilencio } from '../silencio';

/** Si los sonidos están apagados, y cómo alternarlo. */
export function useSilencio(almacen: Almacen): { readonly silencio: boolean; readonly cambiarSilencio: () => void } {
  const [silencio, setSilencio] = useState(() => leerSilencio(almacen));
  const cambiarSilencio = () => {
    guardarSilencio(almacen, !silencio);
    setSilencio(!silencio);
  };
  return { silencio, cambiarSilencio };
}
