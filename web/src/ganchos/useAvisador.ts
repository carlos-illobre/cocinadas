import { useEffect, useState } from 'react';
import { SIN_AVISADOR, type Avisador } from '../cocina/sonido';

/**
 * El avisador, creado recién después de un gesto: el navegador no deja sonar antes. Al
 * retomar una cocinada no se pasa por «Entrar», así que si nadie lo creó se crea con el
 * primer toque, sea el que sea: sin esto, una cocinada retomada se queda sin alarmas.
 */
export function useAvisador(crearAvisador: () => Avisador): { readonly avisador: Avisador; readonly despertar: () => void } {
  const [avisador, setAvisador] = useState<Avisador>(SIN_AVISADOR);
  useEffect(() => {
    if (avisador !== SIN_AVISADOR) {
      return undefined;
    }
    const crear = () => setAvisador(crearAvisador());
    document.addEventListener('pointerdown', crear, { once: true });
    return () => document.removeEventListener('pointerdown', crear);
  }, [avisador, crearAvisador]);
  return { avisador, despertar: () => setAvisador(crearAvisador()) };
}
