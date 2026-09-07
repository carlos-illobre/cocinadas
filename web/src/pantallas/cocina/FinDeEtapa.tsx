import { reloj } from '../../api';
import { etapaActual, type EstadoCocina, type PasoHecho } from '../../cocina/modelo';
import { desvio } from '../../cocina/resumen';
import { FilaHecha } from './FilaHecha';

export function FinDeEtapa({ estado, alSeguir }: { readonly estado: EstadoCocina; readonly alSeguir: () => void }): React.JSX.Element {
  const etapa = etapaActual(estado);
  const siguiente = estado.receta.etapas[estado.etapa + 1];
  const real = estado.etapasReales_s[estado.etapa] as number;
  const d = desvio(etapa.duracion_s, real, reloj);
  return (
    <main className="pantalla fin-etapa">
      <p className="eyebrow">{etapa.nombre} · lista</p>
      <div className="big">
        {reloj(real)}
        <small>previsto {reloj(etapa.duracion_s)}</small>
      </div>
      <p className={`lead desvio ${d.signo}`}>{d.signo === 'igual' ? 'Justo a tiempo.' : `${d.texto} respecto de lo previsto.`}</p>
      {etapa.pausa_despues !== null && <p className="lead">{etapa.pausa_despues}</p>}
      <section className="rail" aria-label="Pasos hechos">
        <p className="eyebrow">
          Hecho <span>previsto → real</span>
        </p>
        <div className="rows">
          {(estado.hechos[estado.etapa] as readonly PasoHecho[]).map((p) => (
            <FilaHecha key={p.id} paso={p} />
          ))}
        </div>
      </section>
      {siguiente !== undefined && (
        <div className="cta">
          <button type="button" className="btn primary" onClick={alSeguir}>
            Empezar {siguiente.nombre.replace(/ · .*$/, '')}
          </button>
          <p className="hint">{siguiente.arranque}</p>
        </div>
      )}
    </main>
  );
}
