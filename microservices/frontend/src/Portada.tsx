import { useEffect, useState } from 'react';
import { BASE_CATALOGO, minutos, obtenerReceta, urlFoto, type Receta, type RecetaResumen } from './api';
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

/**
 * Portada de la receta (mockup A2 y A3): título, foto, valores, la pestaña de versiones,
 * la fila de ingredientes con foto y cantidad, y una tarjeta por etapa.
 */
export function Portada({ fetchImpl, resumen, version, alCambiarVersion, alVolver, alEmpezar }: PropiedadesPortada): React.JSX.Element {
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });

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

  return (
    <main className="pantalla cover">
      <header className="cover-hero">
        <button type="button" className="enlace volver" onClick={alVolver}>
          ‹ Recetas
        </button>
        <p className="eyebrow">
          {resumen.porciones === 1 ? '1 porción' : `${resumen.porciones} porciones`} · {resumen.momento}
        </p>
        <div className="cover-titulo">
          <h1>{resumen.nombre}</h1>
          {foto !== null && <img className="plato-hero" src={foto} alt="" />}
        </div>
        <div className="meta">
          <span className="chip">{resumen.nutricion['kcal']} kcal</span>
          <span className="chip">{resumen.nutricion['proteina_g']} g proteína</span>
          <span className="chip">{resumen.nutricion['fibra_g']} g fibra</span>
        </div>
      </header>

      <div className="seg" role="tablist" aria-label="Versión de la receta">
        {resumen.versiones.map((v) => (
          <button
            key={v.clave}
            type="button"
            role="tab"
            aria-selected={v.clave === version}
            className={v.clave === version ? 'on' : ''}
            onClick={() => alCambiarVersion(v.clave)}
          >
            Versión {v.numero} · {v.titulo}
            <small>{v.tiempo_total_texto}</small>
          </button>
        ))}
      </div>

      {carga.estado === 'cargando' && <p role="status">Abriendo la receta…</p>}
      {carga.estado === 'error' && (
        <p role="alert" className="aviso-error">
          No se pudo abrir la receta: {carga.detalle}
        </p>
      )}
      {carga.estado === 'lista' && <Detalle receta={carga.receta} alEmpezar={alEmpezar} />}
    </main>
  );
}

function Detalle({ receta, alEmpezar }: { readonly receta: Receta; readonly alEmpezar: (receta: Receta) => void }): React.JSX.Element {
  const primera = receta.etapas[0];
  // «Etapa 1 · Preparación» → «Etapa 1»: el botón nombra la etapa, no su contenido.
  const textoBoton = primera !== undefined && receta.etapas.length > 1 ? `Empezar ${primera.nombre.replace(/ · .*$/, '')}` : `Empezar · ${minutos(receta.tiempo_total_s)}`;
  return (
    <>
      <section className="ingr" aria-labelledby="titulo-ingredientes">
        <p id="titulo-ingredientes" className="eyebrow">
          Ingredientes <span>{receta.ingredientes.length}</span>
        </p>
        <ul className="fila-ingredientes">
          {receta.ingredientes.map((i) => (
            <li key={`${i.id ?? 'sin-id'}-${i.nombre}`} title={`${i.nombre}: ${i.cantidad}, ${i.preparacion}`}>
              {i.foto === null ? (
                <span className="ph ph-vacio" aria-hidden="true">
                  {i.nombre.charAt(0)}
                </span>
              ) : (
                <img className="ph" src={`${BASE_CATALOGO}${i.foto}`} alt={i.nombre} />
              )}
              <small>{i.cantidad}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="stages" aria-label="Etapas">
        {receta.etapas.map((e) => {
          const criticos = e.pasos.filter((p) => p.critico).length;
          return (
            <article key={e.id} className={e.vigilancia ? 'stage hot' : 'stage'}>
              <div className="hd">
                <b>{e.nombre}</b>
                <span>{minutos(e.duracion_s)}</span>
              </div>
              <p>{e.arranque}</p>
              <p className="stage-cuenta">
                {e.pasos.length} pasos · {e.procesos.length} procesos en paralelo
                {criticos > 0 && ` · ${criticos} con tiempo crítico`}
              </p>
              {e.pausa_despues !== null && <p className="stage-pausa">Después puede haber pausa.</p>}
            </article>
          );
        })}
      </section>

      <div className="cta">
        <button type="button" className="btn primary" onClick={() => alEmpezar(receta)}>
          {textoBoton}
        </button>
        <p className="hint">Primer paso: {primera?.pasos[0]?.titulo.toLowerCase() ?? ''}</p>
      </div>
    </>
  );
}
