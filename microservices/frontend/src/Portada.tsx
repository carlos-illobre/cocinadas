import { useEffect, useState } from 'react';
import { minutos, obtenerReceta, urlFoto, versionesOrdenadas, type Receta, type RecetaResumen } from './api';
import type { Fetch } from './salud';

export interface PropiedadesPortada {
  readonly fetchImpl: Fetch;
  readonly resumen: RecetaResumen;
  /** Clave de la versión elegida (`dos-etapas`). */
  readonly version: string;
  readonly alCambiarVersion: (clave: string) => void;
  readonly alVolver: () => void;
  readonly alEmpezar: (receta: Receta) => void;
}

type Carga = { readonly estado: 'cargando' } | { readonly estado: 'error'; readonly detalle: string } | { readonly estado: 'lista'; readonly receta: Receta };
type Solapa = 'ingredientes' | 'utensilios';

/**
 * El detalle de la receta del prototipo de Figma: la foto a sangre con el título encima,
 * la fila de valores, los criterios de diseño del documento (la prosa de la receta),
 * el modo de preparación como tarjetas, ingredientes o utensilios, y el botón de
 * comenzar fijo al pie.
 */
export function Portada({ fetchImpl, resumen, version, alCambiarVersion, alVolver, alEmpezar }: PropiedadesPortada): React.JSX.Element {
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });
  const [solapa, setSolapa] = useState<Solapa>('ingredientes');

  useEffect(() => {
    let vigente = true;
    setCarga({ estado: 'cargando' });
    obtenerReceta(fetchImpl, resumen.plato, version).then(
      (receta) => {
        if (vigente) setCarga({ estado: 'lista', receta });
      },
      (error: unknown) => {
        if (vigente) setCarga({ estado: 'error', detalle: error instanceof Error ? error.message : String(error) });
      },
    );
    return () => {
      vigente = false;
    };
  }, [fetchImpl, resumen.plato, version]);

  const foto = urlFoto(resumen.foto);
  const versiones = versionesOrdenadas(resumen);
  const elegida = versiones.find((v) => v.clave === version) ?? versiones[0];
  const tiempo = minutos(elegida?.tiempo_total_s ?? 0);

  return (
    <main className="pantalla detalle">
      <header className={foto === null ? 'detalle-hero sin-foto' : 'detalle-hero'}>
        {foto !== null && <img className="detalle-foto" src={foto} alt="" />}
        <div className="detalle-velo" aria-hidden="true" />
        <button type="button" className="boton-volver" aria-label="Volver a las recetas" onClick={alVolver}>
          ‹
        </button>
        <h1>{resumen.nombre}</h1>
      </header>

      <div className="valores">
        <Valor icono="⏱" valor={tiempo} nombre="Tiempo" />
        <Valor icono="🍽" valor={String(resumen.porciones)} nombre="Porciones" />
        <Valor icono="🔥" valor={`${resumen.nutricion['kcal']} kcal`} nombre="Calorías" />
        <Valor icono="💪" valor={`${resumen.nutricion['proteina_g']} g`} nombre="Proteína" />
      </div>

      <section className="criterios" aria-label="Criterios de diseño">
        {carga.estado === 'cargando' && <p role="status">Abriendo la receta…</p>}
        {carga.estado === 'error' && (
          <p role="alert" className="aviso-error">
            No se pudo abrir la receta: {carga.detalle}
          </p>
        )}
        {carga.estado === 'lista' && <Criterios receta={carga.receta} />}
      </section>

      {versiones.length > 1 && (
        <section className="modos-bloque" aria-labelledby="titulo-modo">
          <h3 id="titulo-modo" className="titulo-seccion">
            Modo de preparación
          </h3>
          <div className="modos" role="tablist" aria-label="Modo de preparación">
            {versiones.map((v) => (
              <button key={v.clave} type="button" role="tab" aria-selected={v.clave === version} className={v.clave === version ? 'modo on' : 'modo'} onClick={() => alCambiarVersion(v.clave)}>
                <span className="modo-icono" aria-hidden="true">
                  {v.icono}
                </span>
                <span className="modo-texto">
                  <span className="modo-nombre">
                    <b>{v.titulo}</b>
                    <span className="modo-tiempo">{minutos(v.tiempo_total_s)}</span>
                  </span>
                  <small>{v.resumen}</small>
                </span>
                <span className="circulo" aria-hidden="true">
                  {v.clave === version ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {carga.estado === 'lista' && <Necesario receta={carga.receta} solapa={solapa} alCambiarSolapa={setSolapa} />}

      {carga.estado === 'lista' && (
        <div className="cta-fija">
          <button type="button" className="btn primary" onClick={() => alEmpezar(carga.receta)}>
            Comenzar · {tiempo} →
          </button>
        </div>
      )}
    </main>
  );
}

function Valor({ icono, valor, nombre }: { readonly icono: string; readonly valor: string; readonly nombre: string }): React.JSX.Element {
  return (
    <div className="valor">
      <span className="valor-icono" aria-hidden="true">
        {icono}
      </span>
      <b>{valor}</b>
      <small>{nombre}</small>
    </div>
  );
}

/** La sección «Criterios de diseño» del documento, y a continuación la de seguridad y conservación. */
function Criterios({ receta }: { readonly receta: Receta }): React.JSX.Element {
  return (
    <>
      {receta.criterios.map((c) => (
        <p key={c.titulo} className="criterio">
          <b>{c.titulo}.</b> {c.texto}
        </p>
      ))}
      {receta.seguridad.length > 0 && (
        <>
          <h3 className="titulo-seccion">Seguridad y conservación</h3>
          <ul className="seguridad">
            {receta.seguridad.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Necesario({ receta, solapa, alCambiarSolapa }: { readonly receta: Receta; readonly solapa: Solapa; readonly alCambiarSolapa: (s: Solapa) => void }): React.JSX.Element {
  return (
    <section className="necesario" aria-label="Qué necesitás">
      <div className="seg" role="tablist" aria-label="Qué necesitás">
        <button type="button" role="tab" aria-selected={solapa === 'ingredientes'} className={solapa === 'ingredientes' ? 'on' : ''} onClick={() => alCambiarSolapa('ingredientes')}>
          Ingredientes
        </button>
        <button type="button" role="tab" aria-selected={solapa === 'utensilios'} className={solapa === 'utensilios' ? 'on' : ''} onClick={() => alCambiarSolapa('utensilios')}>
          Utensilios
        </button>
      </div>
      {solapa === 'ingredientes' ? (
        <ul className="filas">
          {receta.ingredientes.map((i) => (
            <li key={`${i.id ?? 'sin-id'}-${i.nombre}`} className="fila">
              <span className="fila-nombre">{i.nombre}</span>
              <span className="fila-cantidad">{i.cantidad}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="filas">
          {receta.utensilios.map((u) => (
            <li key={`${u.id ?? 'sin-id'}-${u.nombre}`} className="fila">
              <span className="fila-icono" aria-hidden="true">
                🔧
              </span>
              <span className="fila-nombre">{u.nombre}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
