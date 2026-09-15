import type React from 'react';

/**
 * La marca: la olla y el nombre, «Ilioth» con «Chef Training» debajo.
 *
 * El nombre es TEXTO y no parte de una imagen: renombrar el proyecto no renombra un
 * archivo binario, y así el nombre queda en un solo lugar. Escrito en Lobster —la
 * tipografía del logo original— con el degradado naranja a verde. En Lobster la I
 * mayúscula lleva remate y la l minúscula un bucle, así que no se confunden.
 *
 * La olla sí sigue siendo una imagen: no tiene texto adentro, así que no envejece. Se usa
 * la de 192 y no la de 512: se muestra a unos 88 px, así que 192 alcanza para pantallas
 * del doble de densidad y pesa 42 KB en vez de 238.
 */
export function Logotipo({ className = '' }: { readonly className?: string }): React.JSX.Element {
  return (
    <span className={`logotipo ${className}`.trim()}>
      <img className="logotipo-olla" src="icono-192.png" alt="" width="192" height="192" decoding="async" />
      <span className="logotipo-palabra">
        <b>Ilioth</b>
        <small>Chef Training</small>
      </span>
    </span>
  );
}
