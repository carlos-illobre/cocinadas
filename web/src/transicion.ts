import { flushSync } from 'react-dom';

/**
 * Aplica un cambio de estado dentro de una transición de vista, para que lo que se va
 * se funda con lo que llega. El cambio tiene que renderizarse de forma sincrónica dentro
 * del callback: React agrupa las actualizaciones, y sin `flushSync` el navegador
 * capturaría el DOM viejo. Sin la API, el cambio es directo.
 */
export function conTransicion(cambio: () => void): void {
  if (typeof document.startViewTransition !== 'function') {
    cambio();
    return;
  }
  document.startViewTransition(() => {
    flushSync(cambio);
  });
}
