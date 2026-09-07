import { useState } from 'react';
import { reloj } from '../api';
import { enTiempo } from '../progreso/xp';
import { fechaCorta, progresoPorReceta, type Cocinada, type ProgresoReceta } from '../historial/almacen';

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

/**
 * Un punto por intento, con el objetivo como línea horizontal en el medio: lo que se lee es
 * la distancia de cada punto a esa línea, por arriba o por abajo. La escala es simétrica
 * alrededor del objetivo a propósito, así la línea queda siempre en el centro y un intento
 * que se pasó y otro que se quedó corto se ven a la misma distancia. El color es el de la
 * regla de «en tiempo» (xp.ts): verde a ±10 % del previsto de ese intento, coral fuera.
 */
export function Grafico({ progreso }: { readonly progreso: ProgresoReceta }): React.JSX.Element {
  const ANCHO = 340;
  const ALTO = 190;
  const IZQ = 48;
  const DER = 8;
  const ABAJO = 26;
  const ARRIBA = 18;
  const objetivo = progreso.objetivo_s;
  const desvioMaximo = Math.max(...progreso.intentos.map((i) => Math.abs(i.total_real_s - objetivo)));
  // Un piso para el rango: con un solo intento clavado, la línea igual necesita aire
  // alrededor para leerse como el centro y no como el borde.
  const rango = Math.max(desvioMaximo * 1.25, objetivo * 0.1, 60);
  const alturaUtil = ALTO - ABAJO - ARRIBA;
  const y = (s: number) => ARRIBA + alturaUtil / 2 - ((s - objetivo) / rango) * (alturaUtil / 2);
  const n = progreso.intentos.length;
  const paso = (ANCHO - IZQ - DER) / n;
  const x = (i: number) => IZQ + paso * i + paso / 2;
  const marcas = [objetivo + rango, objetivo, objetivo - rango];
  const puntos = progreso.intentos.map((c, i) => ({ c, x: x(i), y: y(c.total_real_s), lejos: !enTiempo(c) }));

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`Tiempo total de cada intento de ${progreso.nombre} contra el objetivo de ${reloj(objetivo)}`}>
        {/* «objetivo» va en el eje, sobre su valor, y no al final de la línea: ahí chocaba con
            el rótulo del último punto, que es justo el que más cerca de la línea queda. */}
        {marcas.map((m) => (
          <g key={m}>
            <line x1={IZQ} x2={ANCHO - DER} y1={y(m)} y2={y(m)} className={m === objetivo ? 'grafico-objetivo' : 'grafico-guia'} />
            {m === objetivo && (
              <text x={IZQ - 6} y={y(m) - 8} className="grafico-eje" textAnchor="end">
                objetivo
              </text>
            )}
            <text x={IZQ - 6} y={y(m) + (m === objetivo ? 9 : 4)} className="grafico-eje" textAnchor="end">
              {reloj(Math.max(0, Math.round(m)))}
            </text>
          </g>
        ))}
        {n > 1 && <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(' ')} className="grafico-linea" />}
        {puntos.map(({ c, x: px, y: py, lejos }, i) => (
          <g key={c.id}>
            <circle cx={px} cy={py} r={6} className={lejos ? 'grafico-punto lejos' : 'grafico-punto'} />
            <text x={px} y={py - 11} className="grafico-valor" textAnchor="middle">
              {reloj(c.total_real_s)}
            </text>
            <text x={px} y={ALTO - 8} className="grafico-eje" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>Cada punto es un intento, en orden; la línea es el objetivo. Cuanto más cerca de la línea, mejor. Verde: a menos del 10 %; coral: más lejos.</figcaption>
    </figure>
  );
}
