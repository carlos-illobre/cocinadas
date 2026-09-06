import { useEffect, useRef, useState } from 'react';
import { BASE_CATALOGO, minutos, reloj, type Proceso as ProcesoReceta, type Receta } from './api';
import {
  atenderAlarma,
  avanzarReloj,
  carriles,
  desvio,
  empezar,
  empezarEtapa,
  esperaPrevia_s,
  etapaActual,
  listo,
  pasoActual,
  procesosVisibles,
  progresoPaso,
  proximoVencimiento_s,
  resumen,
  tildar,
  transcurridoEtapa_s,
  type EstadoCocina,
  type PasoHecho,
  type ProcesoVisible,
} from './cocina/modelo';
import type { Avisador } from './cocina/sonido';

export interface PropiedadesCocina {
  readonly receta: Receta;
  readonly avisador: Avisador;
  readonly alVolver: () => void;
  readonly alTerminar: () => void;
  /** Reloj inyectable; por omisión, el del navegador. */
  readonly ahora?: () => number;
  /** Cada cuánto se redibuja, en ms. */
  readonly tic_ms?: number;
}

const ICONO_PROCESO: Readonly<Record<string, string>> = { frio: '❄', calor: '♨', hervor: '≈', tapado: '◠', reposo: '·' };

/**
 * La pantalla de cocina (mockup B1 a B5): arriba los procesos que corren solos, en el
 * medio la tarea de las manos con su cronómetro, abajo el riel con los carriles. Cuando
 * vence un proceso crítico, la alarma tapa todo; entre etapas, la pausa; al final, el
 * resumen.
 */
export function Cocina({ receta, avisador, alVolver, alTerminar, ahora = () => Date.now(), tic_ms = 500 }: PropiedadesCocina): React.JSX.Element {
  const [estado, setEstado] = useState<EstadoCocina>(() => empezar(receta, ahora()));
  const [reloj_ms, setReloj] = useState(() => ahora());
  const [mostrarPorQue, setMostrarPorQue] = useState(false);

  // El tic: redibuja y deja que el modelo detecte vencimientos.
  useEffect(() => {
    const id = setInterval(() => {
      const t = ahora();
      setReloj(t);
      setEstado((e) => avanzarReloj(e, t));
    }, tic_ms);
    return () => clearInterval(id);
  }, [ahora, tic_ms]);

  // Sonido: fuerte y repetido mientras la alarma esté en pantalla; suave al vencer un
  // proceso no crítico.
  useEffect(() => {
    if (estado.fase !== 'alarma') {
      return undefined;
    }
    avisador.fuerte();
    const id = setInterval(() => avisador.fuerte(), 2000);
    return () => clearInterval(id);
  }, [estado.fase, avisador]);

  const avisosPrevios = useRef(0);
  useEffect(() => {
    if (estado.avisosSuaves > avisosPrevios.current) {
      avisosPrevios.current = estado.avisosSuaves;
      avisador.suave();
    }
  }, [estado.avisosSuaves, avisador]);

  const accion = (f: (e: EstadoCocina, t: number) => EstadoCocina) => () => {
    const t = ahora();
    setReloj(t);
    setEstado((e) => f(e, t));
    setMostrarPorQue(false);
  };

  if (estado.fase === 'alarma') {
    return <Alarma estado={estado} alAtender={accion(atenderAlarma)} />;
  }
  if (estado.fase === 'fin-etapa') {
    return <FinDeEtapa estado={estado} alSeguir={accion(empezarEtapa)} />;
  }
  if (estado.fase === 'fin') {
    return <Final estado={estado} alVolver={alTerminar} />;
  }

  const etapa = etapaActual(estado);
  const paso = pasoActual(estado);
  const progreso = progresoPaso(estado, reloj_ms);
  const procesos = procesosVisibles(estado, reloj_ms);
  const critica = etapa.vigilancia;
  const transcurridoEtapa = transcurridoEtapa_s(estado, reloj_ms);
  const fotoPaso = fotoDe(receta, paso.ingredientes[0] ?? null);
  const vence = proximoVencimiento_s(estado, reloj_ms);
  const esperaPrevia = esperaPrevia_s(estado, reloj_ms);

  return (
    <main className={critica ? 'pantalla cocina critica' : 'pantalla cocina'}>
      <header className="top">
        <div>
          <button type="button" className="enlace volver" onClick={alVolver}>
            ‹ Portada
          </button>
          <p className="eyebrow">{etapa.nombre}</p>
          <h1>
            Paso {estado.paso + 1} de {etapa.pasos.length}
          </h1>
        </div>
        <div className="clock">
          {reloj(transcurridoEtapa)}
          <small>de {reloj(etapa.duracion_s)}</small>
        </div>
      </header>
      <div className="stagebar" aria-hidden="true">
        <i style={{ width: `${Math.min(100, (transcurridoEtapa / etapa.duracion_s) * 100)}%` }} />
      </div>

      {procesos.length > 0 && (
        <section className="bg" aria-label={critica ? 'En el fuego' : 'Corre solo'}>
          <p className="eyebrow">{critica ? 'En el fuego' : 'Corre solo'}</p>
          {procesos.map((p) => (
            <Proceso key={p.proceso.id} visible={p} receta={receta} />
          ))}
        </section>
      )}

      <section className={critica ? 'now hot' : 'now'} aria-labelledby="titulo-paso">
        <div className="hd">
          <span className="eyebrow">{esperaPrevia > 0 ? 'Todavía no · empieza en' : paso.espera ? 'Espera · preparate' : 'Ahora · con las manos'}</span>
          <span className="plan">
            {reloj(paso.inicio_s)} → {reloj(paso.inicio_s + paso.duracion_s)}
          </span>
        </div>
        <div className="ttl">
          {fotoPaso !== null && <img className="ph" src={fotoPaso} alt="" />}
          <h2 id="titulo-paso">{paso.titulo}</h2>
        </div>

        {esperaPrevia > 0 ? (
          <div className="big">
            {reloj(esperaPrevia)}
            <small>para empezar este paso</small>
          </div>
        ) : paso.espera && vence !== null ? (
          <div className="big">
            {reloj(vence)}
            <small>para que venza lo que corre</small>
          </div>
        ) : (
          <div className="big">
            {reloj(progreso.transcurrido_s)}
            {progreso.exceso_s > 0 ? <span className="over">+{reloj(progreso.exceso_s)}</span> : <small>de {reloj(progreso.previsto_s)} previstos</small>}
          </div>
        )}

        <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progreso.previsto_pct)}>
          <i style={{ width: `${progreso.previsto_pct}%` }} />
          {progreso.exceso_s > 0 && (
            <>
              <span className="ov" style={{ width: `${progreso.exceso_pct}%` }} />
              <span className="mk" data-t={reloj(progreso.previsto_s)} style={{ left: `${progreso.previsto_pct}%` }} />
            </>
          )}
        </div>
        {progreso.exceso_s > 0 && (
          <p className={critica ? 'over-note' : 'over-note ok'}>
            {critica ? `Pasado ${reloj(progreso.exceso_s)}: ${paso.por_que.texto}` : '✓ Sin apuro: en esta etapa pasarse no cambia el plato'}
          </p>
        )}

        <ul className="steps">
          {paso.acciones.map((accionTexto, i) => {
            const hecho = estado.subpasos.includes(i);
            return (
              <li key={accionTexto} className={hecho ? 'ok' : ''}>
                <button type="button" aria-pressed={hecho} onClick={() => setEstado((e) => tildar(e, i))}>
                  {accionTexto}
                </button>
              </li>
            );
          })}
        </ul>

        {mostrarPorQue && (
          <p className="por-que">
            <b>{paso.por_que.etiquetas.join(' · ')}</b> {paso.por_que.texto}
          </p>
        )}

        <div className="actions">
          <button type="button" className={critica ? 'btn hot' : 'btn primary'} onClick={accion(listo)}>
            {esperaPrevia > 0 ? 'Ya lo hice ✓' : paso.espera ? 'Seguir ✓' : 'Listo, siguiente ✓'}
          </button>
          <button type="button" className="btn ghost" aria-label="Por qué" aria-expanded={mostrarPorQue} onClick={() => setMostrarPorQue((v) => !v)}>
            ?
          </button>
        </div>
      </section>

      <Riel estado={estado} />
    </main>
  );
}

function fotoDe(receta: Receta, id: string | null): string | null {
  const ingrediente = receta.ingredientes.find((i) => i.id === id && i.foto !== null);
  return ingrediente === undefined ? null : `${BASE_CATALOGO}${ingrediente.foto}`;
}

function Proceso({ visible, receta }: { readonly visible: ProcesoVisible; readonly receta: Receta }): React.JSX.Element {
  const { proceso, restante_s, fraccion, porSonar } = visible;
  const clase = porSonar ? 'proc warn' : proceso.critico || proceso.tipo === 'calor' || proceso.tipo === 'hervor' || proceso.tipo === 'tapado' ? 'proc hot' : 'proc cold';
  const foto = fotoDe(receta, proceso.ingrediente);
  return (
    <div className={clase} role="timer" aria-label={proceso.nombre}>
      <div className="ic">
        {foto !== null ? <img className="ph" src={foto} alt="" /> : <span className="ph ph-vacio" aria-hidden="true">{ICONO_PROCESO[proceso.tipo] ?? '·'}</span>}
        <b aria-hidden="true">{ICONO_PROCESO[proceso.tipo] ?? '·'}</b>
      </div>
      <div className="nm">
        {proceso.nombre}
        <small>{proceso.nota}</small>
      </div>
      <div className="tm">
        {reloj(restante_s)}
        <small>restante</small>
      </div>
      <div className="bar">
        <i style={{ width: `${fraccion * 100}%` }} />
      </div>
    </div>
  );
}

function Riel({ estado }: { readonly estado: EstadoCocina }): React.JSX.Element {
  const etapa = etapaActual(estado);
  const hechos = estado.hechos[estado.etapa] as readonly PasoHecho[];
  const lanes = carriles(etapa);
  const ALTO = 50;
  return (
    <section className="rail" aria-label="Línea de tiempo">
      <p className="eyebrow">
        Línea de tiempo <span>{hechos.length} de {etapa.pasos.length} hechos</span>
      </p>
      <div className="rows withlanes">
        {lanes.map((c, i) => (
          <div
            key={c.proceso.id}
            className={`lane ${c.proceso.critico ? 'hot' : 'cold'}${i > 0 ? ' l2' : ''}`}
            style={{ top: c.desde * ALTO + 6, height: Math.max(0, (c.hasta - c.desde) * ALTO - 12) }}
            aria-hidden="true"
          >
            {i === 0 && <span className="tag">{c.proceso.nombre}</span>}
          </div>
        ))}
        {etapa.pasos.map((p, i) => {
          const hecho = hechos[i];
          const actual = i === estado.paso;
          const d = hecho === undefined ? null : desvio(hecho.previsto_s, hecho.real_s, reloj);
          const claseFila = hecho !== undefined ? 'row done' : actual ? 'row cur' : p.espera ? 'row wait' : 'row';
          return (
            <div key={p.id} className={claseFila} aria-current={actual ? 'step' : undefined}>
              <span className="t">{reloj(p.inicio_s)}</span>
              <span className="dot">
                <i />
              </span>
              <span />
              <span className="n">{p.titulo}</span>
              <span className={d === null ? 'd' : `d ${d.signo === 'mas' ? 'plus' : d.signo === 'menos' ? 'minus' : ''}`.trimEnd()}>
                {d === null ? reloj(p.duracion_s) : d.texto}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Alarma({ estado, alAtender }: { readonly estado: EstadoCocina; readonly alAtender: () => void }): React.JSX.Element {
  const etapa = etapaActual(estado);
  // La alarma siempre nombra un proceso de la etapa: la pone avanzarReloj.
  const proceso = etapa.procesos.find((p) => p.id === estado.alarma) as ProcesoReceta;
  const siguiente = etapa.pasos.find((p) => p.id === proceso.al_terminar);
  const fotoSiguiente = siguiente === undefined ? null : fotoDe(estado.receta, siguiente.ingredientes[0] ?? null);
  return (
    <main className="alarma" role="alertdialog" aria-labelledby="titulo-alarma">
      <div className="body">
        <div className="ring" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </div>
        <p className="eyebrow">{etapa.nombre} · tiempo crítico</p>
        <h1 id="titulo-alarma">{proceso.nombre}</h1>
        <p className="lead">{proceso.nota}</p>
        {siguiente !== undefined && (
          <div className="next">
            {fotoSiguiente !== null && <img className="ph" src={fotoSiguiente} alt="" />}
            <div>
              <b>{siguiente.titulo}</b>
              <small>{siguiente.acciones[0] ?? ''}</small>
            </div>
            <span>{reloj(siguiente.duracion_s)}</span>
          </div>
        )}
      </div>
      <div className="ft">
        <button type="button" className="btn blanco" onClick={alAtender}>
          {siguiente === undefined ? 'Atendido' : `Atendido · seguir con ${siguiente.titulo.toLowerCase()}`}
        </button>
        <p className="sec">Suena y vibra hasta que toques</p>
      </div>
    </main>
  );
}

function FinDeEtapa({ estado, alSeguir }: { readonly estado: EstadoCocina; readonly alSeguir: () => void }): React.JSX.Element {
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

function Final({ estado, alVolver }: { readonly estado: EstadoCocina; readonly alVolver: () => void }): React.JSX.Element {
  const r = resumen(estado);
  const d = desvio(r.total_previsto_s, r.total_real_s, reloj);
  return (
    <main className="pantalla sum">
      <p className="eyebrow">Plato listo · {estado.receta.version.titulo}</p>
      <div className="big">
        {reloj(r.total_real_s)}
        <small>totales</small>
      </div>
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
      <div className="cta">
        <button type="button" className="btn primary" onClick={alVolver}>
          Volver a las recetas
        </button>
        <p className="hint">Guardar esta cocinada en tu perfil llega con las cuentas de usuario. {minutos(r.total_real_s)} en total.</p>
      </div>
    </main>
  );
}
