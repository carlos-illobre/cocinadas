import { useState } from 'react';

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
 * Cambia el estado dentro de una View Transition si el navegador la tiene: la miniatura
 * y la foto grande comparten `view-transition-name`, así que una se transforma en la otra
 * al abrir y al cerrar. Sin la API, el cambio es directo y queda el fundido del CSS.
 */
function conTransicion(cambio: () => void): void {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(cambio);
  } else {
    cambio();
  }
}

/**
 * Una foto chica que se amplía a pantalla completa al tocarla, para ver qué es. Se cierra
 * tocando en cualquier lado. Ampliada usa la versión grande del catálogo (`foto_grande`).
 */
export function FotoAmpliable({ src, srcGrande, nombre, className }: Propiedades): React.JSX.Element {
  const [abierta, setAbierta] = useState(false);
  const transicion = nombreDeTransicion(src);
  return (
    <>
      <button
        type="button"
        className="ver-foto"
        aria-label={`Ver la foto de ${nombre}`}
        onClick={() => {
          conTransicion(() => {
            setAbierta(true);
          });
        }}
      >
        {/* Solo un elemento puede llevar el nombre a la vez: la miniatura lo suelta mientras la grande está abierta. */}
        <img className={className} src={src} alt="" loading="lazy" style={{ viewTransitionName: abierta ? 'none' : transicion }} />
      </button>
      {abierta && (
        <button
          type="button"
          className="foto-ampliada"
          aria-label={`Cerrar la foto de ${nombre}`}
          onClick={() => {
            conTransicion(() => {
              setAbierta(false);
            });
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
