interface Propiedades {
  readonly silencio: boolean;
  readonly alCambiar: () => void;
}

/** Apaga y prende los sonidos: un botón redondo flotante debajo del de tema. */
export function BotonSonido({ silencio, alCambiar }: Propiedades): React.JSX.Element {
  return (
    <button type="button" className="boton-tema boton-sonido" aria-label={silencio ? 'Activar los sonidos' : 'Silenciar los sonidos'} title={silencio ? 'Sonidos' : 'Silencio'} onClick={alCambiar}>
      <span aria-hidden="true">{silencio ? '🔇' : '🔊'}</span>
    </button>
  );
}
