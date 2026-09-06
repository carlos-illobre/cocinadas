import { useState } from 'react';
import { reloj } from './api';
import { fechaCorta, progresoPorReceta, type Cocinada, type ProgresoReceta } from './historial/almacen';

export interface PropiedadesHistorial {
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
        <p className="lead">Todavía no hay cocinadas guardadas. Al terminar una receta, tocá «Guardar esta cocinada» y acá vas a ver cómo mejora cada vez.</p>
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
                const d = c.total_real_s - c.total_previsto_s;
                return (
                  <li key={c.id}>
                    <span className="intento-fecha">{fechaCorta(c.fecha)}</span>
                    <span className="intento-version">{c.version.titulo}</span>
                    <b className="intento-tiempo">{reloj(c.total_real_s)}</b>
                    <span className={d > 0 ? 'd plus' : d < 0 ? 'd minus' : 'd'}>{d > 0 ? `+${reloj(d)}` : d < 0 ? `−${reloj(-d)}` : 'justo'}</span>
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

/** Barras por intento sobre una escala en minutos; la línea punteada es el objetivo. */
export function Grafico({ progreso }: { readonly progreso: ProgresoReceta }): React.JSX.Element {
  const ANCHO = 340;
  const ALTO = 170;
  const IZQ = 40;
  const ABAJO = 26;
  const ARRIBA = 12;
  const tiempos = progreso.intentos.map((i) => i.total_real_s);
  const maximo_s = Math.max(progreso.objetivo_s, ...tiempos);
  // Techo redondo en minutos, para que las marcas del eje sean legibles.
  const techo_min = maximo_s <= 300 ? Math.max(1, Math.ceil(maximo_s / 60)) : Math.ceil(maximo_s / 60 / 5) * 5;
  const techo_s = techo_min * 60;
  const alturaUtil = ALTO - ABAJO - ARRIBA;
  const y = (s: number) => ARRIBA + alturaUtil - (s / techo_s) * alturaUtil;
  const n = progreso.intentos.length;
  const paso = (ANCHO - IZQ - 8) / n;
  const anchoBarra = Math.min(28, paso * 0.6);
  const marcas = [...new Set([0, Math.round(techo_min / 2), techo_min])];

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`Tiempo total de cada intento de ${progreso.nombre}, objetivo ${reloj(progreso.objetivo_s)}`}>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={IZQ} x2={ANCHO - 4} y1={y(m * 60)} y2={y(m * 60)} className="grafico-guia" />
            <text x={IZQ - 6} y={y(m * 60) + 4} className="grafico-eje" textAnchor="end">
              {m} min
            </text>
          </g>
        ))}
        <line x1={IZQ} x2={ANCHO - 4} y1={y(progreso.objetivo_s)} y2={y(progreso.objetivo_s)} className="grafico-objetivo" />
        <text x={ANCHO - 4} y={y(progreso.objetivo_s) - 4} className="grafico-eje" textAnchor="end">
          objetivo
        </text>
        {progreso.intentos.map((c, i) => {
          const x = IZQ + 4 + paso * i + (paso - anchoBarra) / 2;
          const alto = y(0) - y(c.total_real_s);
          const pasado = c.total_real_s > c.total_previsto_s;
          return (
            <g key={c.id}>
              <rect x={x} y={y(c.total_real_s)} width={anchoBarra} height={alto} rx={4} className={pasado ? 'grafico-barra pasado' : 'grafico-barra'} />
              <text x={x + anchoBarra / 2} y={y(c.total_real_s) - 5} className="grafico-valor" textAnchor="middle">
                {reloj(c.total_real_s)}
              </text>
              <text x={x + anchoBarra / 2} y={ALTO - 8} className="grafico-eje" textAnchor="middle">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Cada barra es un intento, en orden. Verde: dentro del objetivo; coral: pasado.</figcaption>
    </figure>
  );
}
