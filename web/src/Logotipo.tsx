import type React from 'react';

/**
 * La marca: la olla y la palabra «Cocinadas».
 *
 * La palabra es TEXTO y no parte de una imagen. El logo original venía como un PNG con
 * los dos elementos juntos, y por eso siguió diciendo «Templa» después de que el proyecto
 * cambiara de nombre: renombrar el proyecto no renombra un archivo binario. Escrita en
 * Lobster —la tipografía del logo— con el degradado naranja a verde del original, se
 * mantiene la identidad y el nombre queda en un solo lugar.
 *
 * La olla sí sigue siendo una imagen: no tiene texto adentro, así que no envejece.
 *
 * `decorativo` es para donde la marca se repite con un encabezado al lado: ahí se oculta
 * a los lectores de pantalla para que no lean «Cocinadas» dos veces seguidas.
 */
export function Logotipo({
  className = '',
  decorativo = false,
}: {
  readonly className?: string;
  readonly decorativo?: boolean;
}): React.JSX.Element {
  return (
    <span className={`logotipo ${className}`.trim()} aria-hidden={decorativo ? true : undefined}>
      <img className="logotipo-olla" src="icono-512.png" alt="" width="512" height="512" decoding="async" />
      <span className="logotipo-palabra">Cocinadas</span>
    </span>
  );
}
