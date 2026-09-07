import { useEffect, useRef, useState } from 'react';
import { reloj, type Receta } from '../../api';
import type { Almacen, Cocinada } from '../../historial/almacen';
import {
  atenderAlarma,
  avanzarReloj,
  empezar,
  empezarEtapa,
  esperaPrevia_s,
  etapaActual,
  listo,
  pasoActual,
  procesosVisibles,
  progresoPaso,
  proximoVencimiento_s,
  reiniciarPaso,
  tildar,
  transcurridoEtapa_s,
  type EstadoCocina } from '../../cocina/modelo';
import { borrarEnCurso, guardarEnCurso, leerEnCurso } from '../../cocina/enCurso';
import type { Avisador } from '../../cocina/sonido';
import { Alarma } from './Alarma';
import { FinDeEtapa } from './FinDeEtapa';
import { Final } from './Final';
import { Riel } from './Riel';
import { fotoDe } from './fotoDe';
import { Proceso } from './Proceso';

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
  // Al terminar el último paso no se salta a los resultados: la tarjeta del paso se vuelve
  // «Receta completada» con un botón, como en el prototipo, y el festejo —confeti y
  // sonido— arranca recién al tocarlo.
  const [verResultados, setVerResultados] = useState(false);

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

  // La cocina cambia de pantalla sin cambiar de pantalla para App: alarma, fin de etapa y
  // final son fases de este mismo componente. Sin esto, el resumen del final aparecía al
  // pie de la línea de tiempo, que es donde uno estaba mirando, con el festejo y el
  // confeti arriba de todo y fuera de la vista.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [estado.fase]);

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
  if (estado.fase === 'fin' && verResultados) {
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
      {/* Cabecera, barra de la etapa y lo que corre solo quedan fijos arriba al hacer scroll,
          como en el prototipo: mientras se leen los sub-pasos, las barras siguen a la vista. */}
      <div className="fijo">
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
          <h1>{estado.fase === 'fin' ? 'Receta completa' : `Paso ${estado.paso + 1} de ${etapa.pasos.length}`}</h1>
        </div>
        <div className="clock">
          {reloj(transcurridoEtapa)}
          <small>de {reloj(etapa.duracion_s)}</small>
        </div>
      </header>
      <div className="stagebar" aria-hidden="true">
        <i style={{ width: `${estado.fase === 'fin' ? 100 : Math.min(100, (transcurridoEtapa / etapa.duracion_s) * 100)}%` }} />
      </div>

      {procesos.length > 0 && (
        <section className="bg" aria-label={critica ? 'En el fuego' : 'Corre solo'}>
          <p className="eyebrow">{critica ? 'En el fuego' : 'Corre solo'}</p>
          {procesos.map((p) => (
            <Proceso key={p.proceso.id} visible={p} receta={receta} />
          ))}
        </section>
      )}
      </div>

      {estado.fase === 'fin' ? (
        <section className="now completada" aria-label="Receta completada">
          <p className="tilde" aria-hidden="true">
            ✅
          </p>
          <h2>¡Receta completada!</h2>
          <button
            type="button"
            className="btn verde"
            onClick={() => {
              setVerResultados(true);
            }}
          >
            Ver resultados 🏆
          </button>
        </section>
      ) : (
        <section className={progreso.exceso_s > 0 ? 'now pasado' : 'now'} aria-labelledby="titulo-paso">
          <div className="hd">
            <span className="eyebrow">{esperaPrevia > 0 ? 'Todavía no · empieza en' : paso.espera ? 'Espera · preparate' : 'Ahora · con las manos'}</span>
            <span className="plan">
              {reloj(paso.inicio_s)} → {reloj(paso.inicio_s + paso.duracion_s)}
            </span>
          </div>
          {/* La cajita del cronómetro a la derecha del título, como en el prototipo: verde
              mientras se está en tiempo, roja y latiendo pasado. Debajo del número va la
              meta —el previsto— y no «transcurrido»: es contra eso que se mide. */}
          <div className="ttl">
            {fotoPaso !== null && <img className="ph" src={fotoPaso} alt="" />}
            <h2 id="titulo-paso">{paso.titulo}</h2>
            <div className="cronometro">
              {esperaPrevia > 0 ? (
                <>
                  <b>{reloj(esperaPrevia)}</b>
                  <small>para empezar este paso</small>
                </>
              ) : paso.espera && vence !== null ? (
                <>
                  <b>{reloj(vence)}</b>
                  <small>para que venza lo que corre</small>
                </>
              ) : (
                <>
                  <b>{reloj(progreso.transcurrido_s)}</b>
                  {progreso.exceso_s > 0 ? (
                    <span className="over">+{reloj(progreso.exceso_s)}</span>
                  ) : (
                    <small>
                      de <strong>{reloj(progreso.previsto_s)}</strong> previstos
                    </small>
                  )}
                </>
              )}
            </div>
          </div>
  
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
  
          {/* Qué cuida este paso —sabor, desperdicio, seguridad—, como en el prototipo: a la
              vista siempre; el texto largo que lo explica sigue detrás del «?». */}
          <ul className="chips etiquetas" aria-label="Qué cuida este paso">
            {paso.por_que.etiquetas.map((e) => (
              <li key={e} className="chip">
                {e}
              </li>
            ))}
          </ul>
  
          {mostrarPorQue && <p className="por-que">{paso.por_que.texto}</p>}
  
          {/* El orden del prototipo: reiniciar chico a la izquierda y «Listo» grande; el «?» es
              nuestro y va al final. */}
          {/* El «?» en su propia fila, arriba: así «Listo» se queda con todo el ancho de abajo. */}
          <div className="ayuda-paso">
            <button type="button" className="btn ghost" aria-label="Por qué" aria-expanded={mostrarPorQue} onClick={() => setMostrarPorQue((v) => !v)}>
              ?
            </button>
          </div>
          <div className="actions">
            <button type="button" className="btn ghost" aria-label="Reiniciar el paso" title="Reiniciar el paso" onClick={accion(reiniciarPaso)}>
              ↺
            </button>
            <button type="button" className="btn listo" onClick={accion(listo, true)}>
              {esperaPrevia > 0 ? 'Ya lo hice ✓' : paso.espera ? 'Seguir ✓' : progreso.exceso_s > 0 ? 'Listo (con demora) ✓' : 'Listo, siguiente ✓'}
            </button>
          </div>
        </section>
  
      )}

      <Riel estado={estado} ahora={reloj_ms} />
    </main>
  );
}
