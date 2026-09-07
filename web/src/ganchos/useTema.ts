import { useEffect, useState } from 'react';
import type { Almacen } from '../historial/almacen';
import { aplicarTema, elOtro, guardarTema, leerTema, type Tema } from '../tema';

/** El tema guardado, aplicado al documento, y cómo cambiarlo. */
export function useTema(almacen: Almacen): { readonly tema: Tema; readonly cambiarTema: () => void } {
  const [tema, setTema] = useState<Tema>(() => leerTema(almacen));
  useEffect(() => {
    aplicarTema(document.documentElement, tema);
  }, [tema]);
  const cambiarTema = () => {
    const otro = elOtro(tema);
    guardarTema(almacen, otro);
    setTema(otro);
  };
  return { tema, cambiarTema };
}
