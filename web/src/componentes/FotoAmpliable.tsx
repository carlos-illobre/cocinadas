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

/**
 * Una foto chica que se amplía a pantalla completa al tocarla, para ver qué es. Se cierra
 * tocando en cualquier lado. Ampliada usa la versión grande del catálogo (`foto_grande`).
 */
export function FotoAmpliable({ src, srcGrande, nombre, className }: Propiedades): React.JSX.Element {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <button
        type="button"
        className="ver-foto"
        aria-label={`Ver la foto de ${nombre}`}
        onClick={() => {
          setAbierta(true);
        }}
      >
        <img className={className} src={src} alt="" loading="lazy" />
      </button>
      {abierta && (
        <button
          type="button"
          className="foto-ampliada"
          aria-label={`Cerrar la foto de ${nombre}`}
          onClick={() => {
            setAbierta(false);
          }}
        >
          <img src={srcGrande ?? src} alt={nombre} />
          <b>{nombre}</b>
          <small>Tocá para cerrar</small>
        </button>
      )}
    </>
  );
}
