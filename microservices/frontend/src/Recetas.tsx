import { useEffect, useState } from 'react';
import { BASE_CATALOGO, listarRecetas, minutos, versionesOrdenadas, type RecetaResumen } from './api';
import { BarraXp } from './BarraXp';
import type { Fetch } from './salud';

export interface PropiedadesRecetas {
  readonly fetchImpl: Fetch;
  /** La experiencia acumulada, para la barra de nivel de la cabecera. */
  readonly xp: number;
  readonly alElegir: (receta: RecetaResumen) => void;
}

type Carga = { readonly estado: 'cargando' } | { readonly estado: 'error'; readonly detalle: string } | { readonly estado: 'lista'; readonly recetas: readonly RecetaResumen[] };

/**
 * La pantalla de inicio del prototipo de Figma: cabecera oscura con el saludo y la
 * barra de experiencia, y una tarjeta grande por plato, con su foto a sangre y los
 * datos en chips sobre la foto. Tocar la tarjeta abre la receta.
 */
export function Recetas({ fetchImpl, xp, alElegir }: PropiedadesRecetas): React.JSX.Element {
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
    <main className="pantalla inicio-recetas">
      <header className="cabecera-oscura">
        <p className="saludo">¡Hola!</p>
        <h1>¿Qué cocinamos hoy?</h1>
        <BarraXp xp={xp} />
      </header>

      <div className="cuerpo">
        <div className="fila-titulo">
          <h2>Recetas</h2>
          {carga.estado === 'lista' && <span>{carga.recetas.length === 1 ? '1 disponible' : `${carga.recetas.length} disponibles`}</span>}
        </div>

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
                <TarjetaReceta resumen={r} alElegir={() => alElegir(r)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function TarjetaReceta({ resumen, alElegir }: { readonly resumen: RecetaResumen; readonly alElegir: () => void }): React.JSX.Element {
  // El tiempo que se muestra es el del modo propuesto: el más lento, el de cocinar con calma.
  const propuesta = versionesOrdenadas(resumen)[0];
  return (
    <button type="button" className="tarjeta-receta" onClick={alElegir}>
      {resumen.foto === null ? (
        <span className="tarjeta-foto tarjeta-sin-foto" aria-hidden="true">
          {resumen.nombre.charAt(0)}
        </span>
      ) : (
        <img className="tarjeta-foto" src={`${BASE_CATALOGO}${resumen.foto}`} alt="" />
      )}
      <span className="tarjeta-velo" aria-hidden="true" />
      <span className="tarjeta-texto">
        <b className="tarjeta-titulo">{resumen.nombre}</b>
        <span className="chips">
          <span className="chip">
            <span aria-hidden="true">⏱</span> {minutos(propuesta?.tiempo_total_s ?? 0)}
          </span>
          <span className="chip">
            <span aria-hidden="true">🍽</span> {resumen.porciones} porc
          </span>
          <span className="chip">
            <span aria-hidden="true">🔥</span> {resumen.nutricion['kcal']} kcal
          </span>
        </span>
      </span>
    </button>
  );
}
