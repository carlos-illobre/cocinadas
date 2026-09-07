import { reloj } from '../../api';
import { etapaActual, type EstadoCocina, type PasoHecho } from '../../cocina/modelo';
import { CLASE_DESVIO, desvio } from '../../cocina/resumen';
import { frenteGantt, gantt, type FilaGantt } from '../../cocina/gantt';

/** La línea de tiempo de la etapa, con sus carriles. */
export function Riel({ estado, ahora }: { readonly estado: EstadoCocina; readonly ahora: number }): React.JSX.Element {
  const etapa = etapaActual(estado);
  const hechos = estado.hechos[estado.etapa] as readonly PasoHecho[];
  const g = gantt(etapa);
  const frente = frenteGantt(estado, ahora, g);
  /** Qué parte de una barra quedó atrás del frente, de 0 a 1. */
  const relleno = (top: number, alto: number): number => Math.max(0, Math.min(1, (frente - top) / Math.max(1, alto)));

  return (
    <section className="rail" aria-label="Línea de tiempo">
      <p className="eyebrow">
        Línea de tiempo <span>{hechos.length} de {etapa.pasos.length} hechos</span>
      </p>
      <div className="rows withlanes" style={{ '--carriles': g.carriles.length } as React.CSSProperties}>
        {/* El gantt: el tiempo baja, las manos en la primera barra y cada proceso en la suya. */}
        <div className="gantt" aria-hidden="true">
          {g.filas.map((f) => {
            const top = f.top + 4;
            const alto = Math.max(8, f.altoBarra - 8);
            return (
              <div key={f.paso.id} className={f.paso.espera ? 'barra espera' : 'barra'} style={{ top, height: alto }}>
                <i style={{ height: `${relleno(top, alto) * 100}%` }} />
              </div>
            );
          })}
          {g.carriles.map((c, i) => {
            const top = c.top + 4;
            const alto = Math.max(8, c.alto - 8);
            return (
              <div key={c.proceso.id} className={c.proceso.critico ? 'carril hot' : 'carril cold'} style={{ top, height: alto, '--i': i } as React.CSSProperties}>
                <i style={{ height: `${relleno(top, alto) * 100}%` }} />
                {i === 0 && <span className="tag">{c.proceso.nombre}</span>}
              </div>
            );
          })}
        </div>
        {etapa.pasos.map((p, i) => {
          const hecho = hechos[i];
          const actual = i === estado.paso;
          const d = hecho === undefined ? null : desvio(hecho.previsto_s, hecho.real_s, reloj);
          const claseFila = hecho !== undefined ? 'row done' : actual ? 'row cur' : p.espera ? 'row wait' : 'row';
          return (
            <div key={p.id} className={claseFila} style={{ height: (g.filas[i] as FilaGantt).alto }} aria-current={actual ? 'step' : undefined}>
              <span className="t">{reloj(p.inicio_s)}</span>
              <span className="dot">
                <i />
              </span>
              <span className="n">{p.titulo}</span>
              <span className={d === null ? 'd' : `d ${CLASE_DESVIO[d.signo]}`.trimEnd()}>{d === null ? reloj(p.duracion_s) : d.texto}</span>
              {/* La columna vacía donde se dibuja el gantt, a la derecha del todo. */}
              <span />
            </div>
          );
        })}
      </div>
    </section>
  );
}
