import { reloj, type Receta } from '../../api';
import { etapaActual, procesosVisibles, transcurridoEtapa_s, type EstadoCocina } from '../../cocina/modelo';
import { Proceso } from './Proceso';

/**
 * Cabecera, barra de la etapa y lo que corre solo, fijos arriba al hacer scroll: mientras
 * se leen los sub-pasos, las barras siguen a la vista.
 */
export function Cabecera({ estado, reloj_ms, receta, alVolver }: { readonly estado: EstadoCocina; readonly reloj_ms: number; readonly receta: Receta; readonly alVolver: () => void }): React.JSX.Element {
  const etapa = etapaActual(estado);
  const procesos = procesosVisibles(estado, reloj_ms);
  const transcurrido = transcurridoEtapa_s(estado, reloj_ms);
  const titulo = etapa.vigilancia ? 'En el fuego' : 'Corre solo';
  return (
    <div className="fijo">
      <header className="top">
        <div>
          <button type="button" className="enlace volver" onClick={alVolver}>
            ‹ Volver
          </button>
          <p className="eyebrow">{etapa.nombre}</p>
          <h1>{estado.fase === 'fin' ? 'Receta completa' : `Paso ${estado.paso + 1} de ${etapa.pasos.length}`}</h1>
        </div>
        <div className="clock">
          {reloj(transcurrido)}
          <small>de {reloj(etapa.duracion_s)}</small>
        </div>
      </header>
      <div className="stagebar" aria-hidden="true">
        <i style={{ width: `${estado.fase === 'fin' ? 100 : Math.min(100, (transcurrido / etapa.duracion_s) * 100)}%` }} />
      </div>

      {procesos.length > 0 && (
        <section className="bg" aria-label={titulo}>
          <p className="eyebrow">{titulo}</p>
          {procesos.map((p) => (
            <Proceso key={p.proceso.id} visible={p} receta={receta} />
          ))}
        </section>
      )}
    </div>
  );
}
