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
import { desgloseDe } from '../../progreso/xp';
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
  const nuevos = guardada === null ? [] : logrosNuevos(cocinadas, guardada);
  const x = desgloseDe({ total_previsto_s: r.total_previsto_s, total_real_s: r.total_real_s, pasos: r.etapas.flatMap((e) => e.pasos) });
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
        <p className="sum-receta">{estado.receta.nombre}</p>
        <div className="resultados">
          <Tarjeta icono="⏱" etiqueta="Tiempo total" valor={reloj(r.total_real_s)} nota={`objetivo: ${reloj(r.total_previsto_s)}`} tono={x.enTiempo ? 'verde' : 'coral'} />
          <Tarjeta icono="⚡" etiqueta="XP ganado" valor={`+${x.total}`} nota="puntos de experiencia" tono="dorado" />
          <Tarjeta icono="✅" etiqueta="Pasos en tiempo" valor={`${x.pasosEnTiempo}/${x.pasos}`} nota={`${x.precision}% de precisión`} tono="verde" />
          <Tarjeta icono={x.enTiempo ? '🌟' : '📈'} etiqueta="Resultado" valor={x.enTiempo ? 'Excelente' : 'Completado'} nota={x.enTiempo ? '¡Dentro del objetivo!' : 'Seguí mejorando'} tono={x.enTiempo ? 'dorado' : 'gris'} />
        </div>
        <section className="desglose" aria-label="Desglose de XP">
          <p className="eyebrow">Desglose de XP</p>
          <p className="fila">
            <span>Receta completada</span>
            <b>+{x.completada}</b>
          </p>
          <p className={x.bonusEnTiempo > 0 ? 'fila' : 'fila apagada'}>
            <span>Bonus por tiempo</span>
            <b>+{x.bonusEnTiempo}</b>
          </p>
          <p className={x.pasosATiempo > 0 ? 'fila' : 'fila apagada'}>
            <span>Pasos a tiempo</span>
            <b>+{x.pasosATiempo}</b>
          </p>
          <p className="fila total">
            <span>Total</span>
            <b>+{x.total}</b>
          </p>
        </section>
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

function Tarjeta({ icono, etiqueta, valor, nota, tono }: { readonly icono: string; readonly etiqueta: string; readonly valor: string; readonly nota: string; readonly tono: 'verde' | 'coral' | 'dorado' | 'gris' }): React.JSX.Element {
  return (
    <div className={`tarjeta-resultado ${tono}`}>
      <span className="icono" aria-hidden="true">
        {icono}
      </span>
      <p className="eyebrow">{etiqueta}</p>
      <b>{valor}</b>
      <small>{nota}</small>
    </div>
  );
}
