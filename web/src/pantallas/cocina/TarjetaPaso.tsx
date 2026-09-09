import { useState } from 'react';
import { reloj, type Receta } from '../../api';
import { esperaPrevia_s, etapaActual, listo, pasoActual, progresoPaso, proximoVencimiento_s, reiniciarPaso } from '../../cocina/modelo';
import { FotoAmpliable } from '../../componentes/FotoAmpliable';
import { conTransicion } from '../../transicion';
import { Cronometro } from './Cronometro';
import { fotoDe } from './fotoDe';
import type { CocinaEnMarcha } from './useCocina';

/** La tarea de las manos: el paso actual con su cronómetro, sus sub-pasos y sus botones. */
export function TarjetaPaso({ estado, reloj_ms, accion, tildar, receta }: CocinaEnMarcha & { readonly receta: Receta }): React.JSX.Element {
  const [mostrarPorQue, setMostrarPorQue] = useState(false);
  const etapa = etapaActual(estado);
  const paso = pasoActual(estado);
  const progreso = progresoPaso(estado, reloj_ms);
  const critica = etapa.vigilancia;
  const pasado = progreso.exceso_s > 0;
  const esperaPrevia = esperaPrevia_s(estado, reloj_ms);
  const foto = fotoDe(receta, paso.ingredientes[0] ?? null);
  const ingrediente = receta.ingredientes.find((i) => i.id === paso.ingredientes[0])?.nombre ?? '';

  return (
    <section className={pasado ? 'now pasado' : 'now'} aria-labelledby="titulo-paso">
      <div className="hd">
        <span className="eyebrow">{esperaPrevia > 0 ? 'Todavía no · empieza en' : paso.espera ? 'Espera · preparate' : 'Ahora · con las manos'}</span>
        <span className="plan">
          {reloj(paso.inicio_s)} → {reloj(paso.inicio_s + paso.duracion_s)}
        </span>
      </div>
      <div className="ttl">
        {/* Con `key` por paso: al pasar de paso, la foto ampliada se cierra sola. */}
        {foto !== null && <FotoAmpliable key={paso.id} src={foto.chica} srcGrande={foto.grande} nombre={ingrediente} className="ph" />}
        <h2 id="titulo-paso">{paso.titulo}</h2>
        <Cronometro progreso={progreso} esperaPrevia_s={esperaPrevia} vence_s={paso.espera ? proximoVencimiento_s(estado, reloj_ms) : null} />
      </div>

      <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progreso.previsto_pct)}>
        <i style={{ width: `${progreso.previsto_pct}%` }} />
        {pasado && (
          <>
            <span className="ov" style={{ width: `${progreso.exceso_pct}%` }} />
            <span className="mk" data-t={reloj(progreso.previsto_s)} style={{ left: `${progreso.previsto_pct}%` }} />
          </>
        )}
      </div>
      {pasado && <p className={critica ? 'over-note' : 'over-note ok'}>{critica ? `Pasado ${reloj(progreso.exceso_s)}: ${paso.por_que.texto}` : '✓ Sin apuro: en esta etapa pasarse no cambia el plato'}</p>}

      <ul className="steps">
        {paso.acciones.map((texto, i) => {
          const hecho = estado.subpasos.includes(i);
          return (
            <li key={texto} className={hecho ? 'ok' : ''}>
              <button type="button" aria-pressed={hecho} onClick={() => tildar(i)}>
                {texto}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Qué cuida este paso —sabor, desperdicio, seguridad— siempre a la vista; el texto
          largo que lo explica, detrás del «?». */}
      <div className="etiquetas-fila">
        <ul className="chips etiquetas" aria-label="Qué cuida este paso">
          {paso.por_que.etiquetas.map((e) => (
            <li key={e} className="chip">
              {e}
            </li>
          ))}
        </ul>
        <button type="button" className="btn ghost" aria-label="Por qué" aria-expanded={mostrarPorQue} onClick={() => conTransicion(() => setMostrarPorQue((v) => !v))}>
          ?
        </button>
      </div>

      {mostrarPorQue && <p className="por-que">{paso.por_que.texto}</p>}

      <div className="actions">
        <button type="button" className="btn ghost" aria-label="Reiniciar el paso" title="Reiniciar el paso" onClick={accion(reiniciarPaso)}>
          ↺
        </button>
        <button type="button" className="btn listo" onClick={accion(listo, true)}>
          {esperaPrevia > 0 ? 'Ya lo hice ✓' : paso.espera ? 'Seguir ✓' : pasado ? 'Listo (con demora) ✓' : 'Listo, siguiente ✓'}
        </button>
      </div>
    </section>
  );
}
