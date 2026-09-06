import { useEffect, useRef, useState } from 'react';
import { BASE_CATALOGO, reloj, type Proceso as ProcesoReceta, type Receta } from './api';
import type { Almacen, Cocinada } from './historial/almacen';
import {
  atenderAlarma,
  avanzarReloj,
  desvio,
  empezar,
  empezarEtapa,
  esperaPrevia_s,
  etapaActual,
  frenteGantt,
  gantt,
  listo,
  pasoActual,
  procesosVisibles,
  progresoPaso,
  proximoVencimiento_s,
  reiniciarPaso,
  resumen,
  tildar,
  transcurridoEtapa_s,
  type EstadoCocina,
  type FilaGantt,
  type PasoHecho,
  type ProcesoVisible,
} from './cocina/modelo';
import { borrarEnCurso, guardarEnCurso, leerEnCurso } from './cocina/enCurso';
import type { Avisador } from './cocina/sonido';
import { logrosNuevos } from './logros';
import { puntosDe } from './xp';

export interface PropiedadesCocina {
  readonly receta: Receta;
  readonly avisador: Avisador;
  readonly alVolver: () => void;
  readonly alTerminar: () => void;
  /** Guarda la cocinada terminada (el id lo pone quien guarda). */
  readonly alGuardar: (cocinada: Omit<Cocinada, 'id'>) => void;
  /** Las cocinadas que ya estaban guardadas, para saber qué logro desbloquea esta. */
  readonly cocinadas: readonly Cocinada[];
  /** Dónde se guarda la cocinada en curso, para no perderla si la página se recarga. */
  readonly almacen: Almacen;
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
export function Cocina({ receta, avisador, alVolver, alTerminar, alGuardar, cocinadas, almacen, ahora = () => Date.now(), tic_ms = 500 }: PropiedadesCocina): React.JSX.Element {
  // Si hay una cocinada de esta misma receta a medio hacer, se retoma donde quedó.
  const [estado, setEstado] = useState<EstadoCocina>(() => leerEnCurso(almacen, receta, ahora()) ?? empezar(receta, ahora()));
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

  // Se guarda a cada cambio, no cada tanto: el navegador del celular puede descartar la
  // pestaña en cualquier momento y no avisa.
  useEffect(() => {
    if (estado.fase === 'fin') {
      borrarEnCurso(almacen);
    } else {
      guardarEnCurso(almacen, estado, ahora());
    }
  }, [estado, almacen, ahora]);

  const avisosPrevios = useRef(0);
  useEffect(() => {
    if (estado.avisosSuaves > avisosPrevios.current) {
      avisosPrevios.current = estado.avisosSuaves;
      avisador.suave();
    }
  }, [estado.avisosSuaves, avisador]);

  const accion = (f: (e: EstadoCocina, t: number) => EstadoCocina, sonar = false) => () => {
    const t = ahora();
    if (sonar) {
      avisador.toque();
    }
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
    return <Final estado={estado} alVolver={alTerminar} alGuardar={alGuardar} cocinadas={cocinadas} avisador={avisador} fecha={() => new Date(ahora()).toISOString()} />;
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
          <button
            type="button"
            className="enlace volver"
            onClick={() => {
              borrarEnCurso(almacen);
              alVolver();
            }}
          >
            ‹ Volver
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
          <button type="button" className={critica ? 'btn hot' : 'btn primary'} onClick={accion(listo, true)}>
            {esperaPrevia > 0 ? 'Ya lo hice ✓' : paso.espera ? 'Seguir ✓' : 'Listo, siguiente ✓'}
          </button>
          <button type="button" className="btn ghost" aria-label="Reiniciar el paso" title="Reiniciar el paso" onClick={accion(reiniciarPaso)}>
            ↺
          </button>
          <button type="button" className="btn ghost" aria-label="Por qué" aria-expanded={mostrarPorQue} onClick={() => setMostrarPorQue((v) => !v)}>
            ?
          </button>
        </div>
      </section>

      <Riel estado={estado} ahora={reloj_ms} />
    </main>
  );
}

interface Papelito {
  readonly id: number;
  readonly color: string;
  readonly izquierda: number;
  readonly demora: number;
  readonly duracion: number;
  readonly tamano: number;
  readonly redondo: boolean;
}

const COLORES_CONFETI = ['#FF6B35', '#FFD166', '#06D6A0', '#4ECDC4', '#FF6B9D', '#C77DFF'];

/** Los papelitos del festejo, sorteados una sola vez al llegar a la pantalla. */
function confeti(cuantos: number): readonly Papelito[] {
  return Array.from({ length: cuantos }, (_, id) => ({
    id,
    color: COLORES_CONFETI[id % COLORES_CONFETI.length] as string,
    izquierda: Math.random() * 100,
    demora: Math.random() * 1.5,
    duracion: 2.5 + Math.random() * 2,
    tamano: 6 + Math.random() * 8,
    redondo: id % 2 === 0,
  }));
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

function Riel({ estado, ahora }: { readonly estado: EstadoCocina; readonly ahora: number }): React.JSX.Element {
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
      <section className="rail" aria-label="Pasos hechos">
        <p className="eyebrow">
          Hecho <span>previsto → real</span>
        </p>
        <div className="rows">
          {(estado.hechos[estado.etapa] as readonly PasoHecho[]).map((p) => {
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

function Final({
  estado,
  alVolver,
  alGuardar,
  cocinadas,
  avisador,
  fecha,
}: {
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
      criticosATiempo: r.criticosATiempo,
    };
    alGuardar(cocinada);
    setGuardada({ ...cocinada, id: 'recien-guardada' });
  };
  const d = desvio(r.total_previsto_s, r.total_real_s, reloj);
  const nuevos = guardada === null ? [] : logrosNuevos(cocinadas, guardada);
  const puntos = puntosDe({ total_previsto_s: r.total_previsto_s, total_real_s: r.total_real_s });
  return (
    <main className="pantalla sum">
      <div className="confeti" aria-hidden="true">
        {papelitos.map((p) => (
          <i key={p.id} className={p.redondo ? 'redondo' : ''} style={{ left: `${p.izquierda}%`, width: p.tamano, height: p.tamano, background: p.color, animationDelay: `${p.demora}s`, animationDuration: `${p.duracion}s` }} />
        ))}
      </div>
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
  );
}
