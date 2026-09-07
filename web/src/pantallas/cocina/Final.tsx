import { useEffect, useState } from 'react';
import { reloj } from '../../api';
import type { Cocinada } from '../../historial/almacen';
import {
  desvio,
  resumen,
  type EstadoCocina,
  type PasoHecho } from '../../cocina/modelo';
import type { Avisador } from '../../cocina/sonido';
import { logrosNuevos } from '../../progreso/logros';
import { puntosDe } from '../../progreso/xp';
import { confeti } from './confeti';

export function Final({
  estado,
  alVolver,
  alGuardar,
  cocinadas,
  avisador,
  fecha }: {
  readonly estado: EstadoCocina;
  readonly alVolver: () => void;
  readonly alGuardar: (cocinada: Omit<Cocinada, 'id'>) => void;
  readonly cocinadas: readonly Cocinada[];
  readonly avisador: Avisador;
  readonly fecha: () => string;
}): React.JSX.Element {
  const r = resumen(estado);
  const [guardada, setGuardada] = useState<Cocinada | null>(null);
  const [papelitos] = useState(() => confeti(40));

  // El festejo suena una sola vez, al llegar.
  useEffect(() => {
    avisador.festejo();
  }, [avisador]);

  const guardar = () => {
    const cocinada: Omit<Cocinada, 'id'> = {
      plato: estado.receta.plato,
      nombre: estado.receta.nombre,
      version: { clave: estado.receta.version.clave, titulo: estado.receta.version.titulo },
      fecha: fecha(),
      total_previsto_s: r.total_previsto_s,
      total_real_s: r.total_real_s,
      etapas: r.etapas.map((e) => ({ nombre: e.nombre, previsto_s: e.previsto_s, real_s: e.real_s })),
      pasos: r.etapas.flatMap((e) => e.pasos),
      criticos: r.criticos,
      criticosATiempo: r.criticosATiempo };
    alGuardar(cocinada);
    setGuardada({ ...cocinada, id: 'recien-guardada' });
  };
  const d = desvio(r.total_previsto_s, r.total_real_s, reloj);
  const nuevos = guardada === null ? [] : logrosNuevos(cocinadas, guardada);
  const puntos = puntosDe({ total_previsto_s: r.total_previsto_s, total_real_s: r.total_real_s });
  return (
    // El confeti va afuera del <main> y no adentro: cubre la ventana entera con
    // `position: fixed`, y un ancestro con `transform` —como la animación de entrada de
    // `.pantalla`— lo convertiría en el bloque contenedor y el confeti caería anclado a la
    // pantalla en vez de a la ventana. Como hermano no depende de eso.
    <>
      <div className="confeti" aria-hidden="true">
        {papelitos.map((p) => (
          <i key={p.id} className={p.redondo ? 'redondo' : ''} style={{ left: `${p.izquierda}%`, width: p.tamano, height: p.tamano, background: p.color, animationDelay: `${p.demora}s`, animationDuration: `${p.duracion}s` }} />
        ))}
      </div>
      <main className="pantalla sum">
        <p className="trofeo" aria-hidden="true">
          🏆
        </p>
        <h1 className="sum-titulo">¡Receta completada!</h1>
        <p className="eyebrow">Plato listo · {estado.receta.version.titulo}</p>
        <div className="big">
          {reloj(r.total_real_s)}
          <small>totales</small>
        </div>
        <p className="puntos-ganados">
          <b>+{puntos} XP</b> por lo cerca que estuviste de los tiempos
        </p>
        <p className="vs">
          Previsto {reloj(r.total_previsto_s)} · <b className={d.signo}>{d.texto}</b>
        </p>
        <div className="kpis">
          {r.etapas.map((e) => (
            <div key={e.nombre} className="kpi">
              <p className="eyebrow">{e.nombre.replace(/ · .*$/, '')}</p>
              <b>{reloj(e.real_s)}</b>
              <small>previsto {reloj(e.previsto_s)}</small>
            </div>
          ))}
          <div className="kpi">
            <p className="eyebrow">Críticos a tiempo</p>
            <b>
              {r.criticosATiempo} / {r.criticos}
            </b>
            <small>{r.criticosATiempo === r.criticos ? 'ninguno pasado' : `${r.criticos - r.criticosATiempo} pasados`}</small>
          </div>
        </div>
        <section className="rail" aria-label="Paso a paso">
          <p className="eyebrow">
            Paso a paso <span>previsto → real</span>
          </p>
          <div className="rows">
            {r.etapas.map((e) => (
              <div key={e.nombre}>
                <p className="stg">
                  {e.nombre} <span>{reloj(e.real_s)}</span>
                </p>
                {e.pasos.map((p: PasoHecho) => {
                  const dp = desvio(p.previsto_s, p.real_s, reloj);
                  return (
                    <div key={p.id} className="row done">
                      <span className="t">{reloj(p.previsto_s)}</span>
                      <span className="dot">
                        <i />
                      </span>
                      <span className="n">{p.titulo}</span>
                      <span className={`d ${dp.signo === 'mas' ? 'plus' : dp.signo === 'menos' ? 'minus' : ''}`.trimEnd()}>{dp.texto}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
        {nuevos.length > 0 && (
          <section className="logros-nuevos" aria-label="Logros conseguidos">
            <p className="eyebrow">{nuevos.length === 1 ? 'Logro conseguido' : 'Logros conseguidos'}</p>
            <ul>
              {nuevos.map((l) => (
                <li key={l.id}>
                  <span aria-hidden="true">{l.icono}</span>
                  <b>{l.nombre}</b>
                  <small>{l.descripcion}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="cta">
          {guardada !== null ? (
            <p className="over-note ok">✓ Guardada en este teléfono. Se ve en Progreso.</p>
          ) : (
            <button type="button" className="btn primary" onClick={guardar}>
              Guardar esta cocinada
            </button>
          )}
          <button type="button" className={guardada !== null ? 'btn primary' : 'btn ghost ancho'} onClick={alVolver}>
            {guardada !== null ? 'Ver el progreso' : 'Salir sin guardar'}
          </button>
        </div>
      </main>
    </>
  );
}
