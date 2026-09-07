import { useState } from 'react';
import { flushSync } from 'react-dom';

interface Propiedades {
  readonly src: string;
  /** La versión grande para la ampliación; si no hay, se amplía la chica. */
  readonly srcGrande?: string | null;
  /** El nombre de lo que se ve: va en el botón, en el `alt` y debajo de la foto ampliada. */
  readonly nombre: string;
  /** La clase de la miniatura, que la pone cada pantalla. */
  readonly className: string;
}

/** Un identificador CSS válido y único por foto, para que la miniatura y la grande sean «la misma». */
function nombreDeTransicion(src: string): string {
  return `foto-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

/**
 * Una foto chica que se amplía a pantalla completa al tocarla, para ver qué es. Se cierra
 * tocando en cualquier lado. Ampliada usa la versión grande del catálogo (`foto_grande`).
 *
 * La miniatura y la grande comparten un `view-transition-name`, así el navegador
 * transforma una en la otra al abrir y al cerrar. El nombre lo lleva **solo la foto que
 * está transicionando y solo mientras dura la transición**: cada elemento con nombre se
 * captura en su propio grupo y se dibuja por encima del fundido de la pantalla, así que
 * si todas las miniaturas lo llevaran, todas flotarían sobre el fondo oscurecido hasta el
 * final. Sin la API, el cambio es directo y queda el fundido del CSS.
 */
export function FotoAmpliable({ src, srcGrande, nombre, className }: Propiedades): React.JSX.Element {
  const [abierta, setAbierta] = useState(false);
  const [transicionando, setTransicionando] = useState(false);
  const transicion = nombreDeTransicion(src);

  const cambiar = (nuevoEstado: boolean): void => {
    if (typeof document.startViewTransition !== 'function') {
      setAbierta(nuevoEstado);
      return;
    }
    // El nombre tiene que estar en el DOM antes de que la API capture el «antes», y el
    // cambio de estado tiene que aplicarse dentro del callback, de forma sincrónica:
    // React agrupa las actualizaciones, y sin `flushSync` la captura vería el DOM viejo.
    flushSync(() => {
      setTransicionando(true);
    });
    const transicionEnCurso = document.startViewTransition(() => {
      flushSync(() => {
        setAbierta(nuevoEstado);
      });
    });
    void transicionEnCurso.finished.finally(() => {
      setTransicionando(false);
    });
  };

  return (
    <>
      <button
        type="button"
        className="ver-foto"
        aria-label={`Ver la foto de ${nombre}`}
        onClick={() => {
          cambiar(true);
        }}
      >
        {/* La miniatura lleva el nombre solo en los extremos de la transición en los que ella es la foto: antes de abrir y después de cerrar. */}
        <img className={className} src={src} alt="" loading="lazy" style={{ viewTransitionName: transicionando && !abierta ? transicion : 'none' }} />
      </button>
      {abierta && (
        <button
          type="button"
          className="foto-ampliada"
          aria-label={`Cerrar la foto de ${nombre}`}
          onClick={() => {
            cambiar(false);
          }}
        >
          <img src={srcGrande ?? src} alt={nombre} style={{ viewTransitionName: transicion }} />
          <b>{nombre}</b>
          <small>Tocá para cerrar</small>
        </button>
      )}
    </>
  );
}
