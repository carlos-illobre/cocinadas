import { useEffect, useState } from 'react';
import { BASE_CATALOGO, listarRecetas, minutos, type RecetaResumen } from './api';
import type { Fetch } from './salud';

export interface PropiedadesRecetas {
  readonly fetchImpl: Fetch;
  readonly alElegir: (receta: RecetaResumen) => void;
  readonly alVerEstado: () => void;
}

type Carga = { readonly estado: 'cargando' } | { readonly estado: 'error'; readonly detalle: string } | { readonly estado: 'lista'; readonly recetas: readonly RecetaResumen[] };

/**
 * Selección de receta (mockup A1): una tarjeta por plato con su foto, tiempo, calorías y
 * proteína, y cuántas versiones tiene. Tocar la tarjeta abre la portada.
 */
export function Recetas({ fetchImpl, alElegir, alVerEstado }: PropiedadesRecetas): React.JSX.Element {
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    listarRecetas(fetchImpl).then(
      (recetas) => {
        if (vigente) setCarga({ estado: 'lista', recetas });
      },
      (error: unknown) => {
        if (vigente) setCarga({ estado: 'error', detalle: error instanceof Error ? error.message : String(error) });
      },
    );
    return () => {
      vigente = false;
    };
  }, [fetchImpl]);

  return (
    <main className="pantalla pick">
      <header className="pick-cabecera">
        <p className="eyebrow">Cero desperdicio · sin sal · 1 porción</p>
        <h1>Recetas</h1>
      </header>

      {carga.estado === 'cargando' && <p role="status">Buscando recetas…</p>}
      {carga.estado === 'error' && (
        <p role="alert" className="aviso-error">
          No se pudo leer el catálogo: {carga.detalle}
        </p>
      )}
      {carga.estado === 'lista' && (
        <ul className="lista-recetas">
          {carga.recetas.map((r) => (
            <li key={r.plato}>
              <button type="button" className="rcard" onClick={() => alElegir(r)}>
                {r.foto === null ? (
                  <span className="plato plato-vacio" aria-hidden="true">
                    {r.nombre.charAt(0)}
                  </span>
                ) : (
                  <img className="plato" src={`${BASE_CATALOGO}${r.foto}`} alt="" />
                )}
                <span className="rcard-texto">
                  <b>{r.nombre}</b>
                  <span className="m">
                    {minutos(r.versiones[0]?.tiempo_total_s ?? 0)} · {r.nutricion['kcal']} kcal · {r.nutricion['proteina_g']} g proteína
                    <br />
                    {r.versiones.length === 1 ? '1 versión' : `${r.versiones.length} versiones`}
                  </span>
                </span>
                <span className="go" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="pie">
        <button type="button" className="enlace" onClick={alVerEstado}>
          Estado del sistema
        </button>
      </footer>
    </main>
  );
}
