import { useEffect, useState } from 'react';

type Carga<T> = { readonly estado: 'cargando' } | { readonly estado: 'error'; readonly detalle: string } | { readonly estado: 'lista'; readonly datos: T };

/**
 * Lo que devuelve `pedir`, con sus estados de carga. Cuando `pedir` cambia NO se vuelve a
 * «cargando»: lo anterior sigue a la vista hasta que llega lo nuevo, y recién ahí se
 * reemplaza. Volver a «cargando» vaciaba la pantalla un instante y se veía como un
 * parpadeo. Una respuesta tardía no pisa a la nueva porque el efecto se cancela con `vigente`.
 */
export function useCarga<T>(pedir: () => Promise<T>): Carga<T> {
  const [carga, setCarga] = useState<Carga<T>>({ estado: 'cargando' });
  useEffect(() => {
    let vigente = true;
    pedir().then(
      (datos) => {
        if (vigente) setCarga({ estado: 'lista', datos });
      },
      (error: unknown) => {
        if (vigente) setCarga({ estado: 'error', detalle: error instanceof Error ? error.message : String(error) });
      },
    );
    return () => {
      vigente = false;
    };
  }, [pedir]);
  return carga;
}
