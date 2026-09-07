import { useState } from 'react';
import { reloj } from '../api';
import { CLASE_DESVIO, desvio } from '../cocina/resumen';
import { Grafico } from './Grafico';
import { fechaCorta, progresoPorReceta, type Cocinada } from '../historial/almacen';

interface PropiedadesHistorial {
  readonly cocinadas: readonly Cocinada[];
}

/**
 * El progreso por receta: un gráfico con el tiempo total de cada intento contra el
 * objetivo de la receta, el mejor y el promedio, y la lista de intentos con sus desvíos.
 */
export function Historial({ cocinadas }: PropiedadesHistorial): React.JSX.Element {
  const recetas = progresoPorReceta(cocinadas);
  const [platoElegido, setPlato] = useState<string | null>(null);
  const receta = recetas.find((r) => r.plato === platoElegido) ?? recetas[0];

  return (
    <main className="pantalla historial">
      <p className="eyebrow">Guardado en este teléfono</p>
      <h1>Progreso</h1>

      {receta === undefined ? (
        <p className="lead">Todavía no hay cocinadas guardadas. Al terminar una receta se guarda sola, y acá vas a ver cómo mejora cada vez.</p>
      ) : (
        <>
          {recetas.length > 1 && (
            <div className="seg" role="tablist" aria-label="Receta">
              {recetas.map((r) => (
                <button key={r.plato} type="button" role="tab" aria-selected={r.plato === receta.plato} className={r.plato === receta.plato ? 'on' : ''} onClick={() => setPlato(r.plato)}>
                  {r.nombre}
                </button>
              ))}
            </div>
          )}
          <h2 className="historial-titulo">{receta.nombre}</h2>
          <Grafico progreso={receta} />
          <div className="kpis">
            <div className="kpi">
              <p className="eyebrow">Mejor</p>
              <b>{reloj(receta.mejor_s)}</b>
              <small>objetivo {reloj(receta.objetivo_s)}</small>
            </div>
            <div className="kpi">
              <p className="eyebrow">Promedio</p>
              <b>{reloj(receta.promedio_s)}</b>
              <small>{receta.intentos.length === 1 ? '1 intento' : `${receta.intentos.length} intentos`}</small>
            </div>
          </div>
          <section className="rail" aria-label="Intentos">
            <p className="eyebrow">
              Intentos <span>del más reciente al primero</span>
            </p>
            <ul className="intentos">
              {[...receta.intentos].reverse().map((c) => {
                const d = desvio(c.total_previsto_s, c.total_real_s, reloj);
                return (
                  <li key={c.id}>
                    <span className="intento-fecha">{fechaCorta(c.fecha)}</span>
                    <span className="intento-version">{c.version.titulo}</span>
                    <b className="intento-tiempo">{reloj(c.total_real_s)}</b>
                    <span className={`d ${CLASE_DESVIO[d.signo]}`.trimEnd()}>{d.signo === 'igual' ? 'justo' : d.texto}</span>
                    <small>
                      críticos a tiempo {c.criticosATiempo} / {c.criticos}
                    </small>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
