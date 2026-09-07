import { useEffect, useRef, useState } from 'react';
import { reloj } from '../../api';
import type { Cocinada } from '../../historial/almacen';
import type { EstadoCocina } from '../../cocina/modelo';
import { cocinadaDe, resumen } from '../../cocina/resumen';
import { FilaHecha } from './FilaHecha';
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
  const [papelitos] = useState(() => confeti(40));
  // La cocinada se arma una sola vez, al llegar: la fecha es la de ese momento.
  const [cocinada] = useState(() => cocinadaDe(estado, fecha()));
  // El id lo pone quien guarda; para los logros alcanza con uno provisorio.
  const guardada: Cocinada = { ...cocinada, id: 'recien-guardada' };
  // Las cocinadas anteriores, congeladas al llegar: contra esas se calcula qué logro es
  // nuevo. Si se leyera la prop, al guardar esta ya estaría adentro y no sería «nueva».
  const [previas] = useState(cocinadas);

  // Se guarda siempre, sola, al llegar. Una sola vez: `alGuardar` cambia de identidad en
  // cada render de App, y sin la guarda el efecto la guardaría de nuevo con otro id.
  const yaGuardada = useRef(false);
  useEffect(() => {
    if (yaGuardada.current) {
      return;
    }
    yaGuardada.current = true;
    alGuardar(cocinada);
    avisador.festejo();
  }, [alGuardar, avisador, cocinada]);

  const nuevos = logrosNuevos(previas, guardada);
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
          {[
            { texto: 'Receta completada', puntos: x.completada, clase: 'fila' },
            { texto: 'Bonus por tiempo', puntos: x.bonusEnTiempo, clase: x.bonusEnTiempo > 0 ? 'fila' : 'fila apagada' },
            { texto: 'Pasos a tiempo', puntos: x.pasosATiempo, clase: x.pasosATiempo > 0 ? 'fila' : 'fila apagada' },
            { texto: 'Total', puntos: x.total, clase: 'fila total' },
          ].map((fila) => (
            <p key={fila.texto} className={fila.clase}>
              <span>{fila.texto}</span>
              <b>+{fila.puntos}</b>
            </p>
          ))}
        </section>
        {/* Guardada y el botón para seguir van arriba del paso a paso: es lo que se busca al
            terminar, y el paso a paso es largo. */}
        <div className="cta">
          <p className="over-note ok">✓ Guardada en este teléfono. Se ve en Progreso.</p>
          <button type="button" className="btn primary" onClick={alVolver}>
            Ver el progreso
          </button>
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
                {e.pasos.map((p) => (
                  <FilaHecha key={p.id} paso={p} />
                ))}
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
