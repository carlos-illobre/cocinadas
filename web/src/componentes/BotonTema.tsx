import type { Tema } from '../tema';

interface Propiedades {
  readonly tema: Tema;
  readonly alCambiar: () => void;
}

/**
 * El interruptor de tema: un botón redondo flotante, arriba a la derecha, con el ícono
 * del tema al que se pasa. Está en todas las pantallas menos en la de entrada.
 */
export function BotonTema({ tema, alCambiar }: Propiedades): React.JSX.Element {
  const oscuro = tema === 'oscuro';
  return (
    <button type="button" className="boton-tema" aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={oscuro ? 'Modo claro' : 'Modo oscuro'} onClick={alCambiar}>
      <span aria-hidden="true">{oscuro ? '☀️' : '🌙'}</span>
    </button>
  );
}
