import { reloj, type Proceso as ProcesoReceta } from '../../api';
import { etapaActual, type EstadoCocina } from '../../cocina/modelo';
import { fotoDe } from './fotoDe';

export function Alarma({ estado, alAtender }: { readonly estado: EstadoCocina; readonly alAtender: () => void }): React.JSX.Element {
  const etapa = etapaActual(estado);
  // La alarma siempre nombra un proceso de la etapa: la pone .
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
        {/* Lo que sigue va afuera del botón: adentro, con un título largo, se salía. */}
        {siguiente !== undefined && <p className="siguiente">Seguir con {siguiente.titulo.toLowerCase()}</p>}
        <button type="button" className="btn blanco" onClick={alAtender}>
          Atendido
        </button>
        <p className="sec">Suena y vibra hasta que toques</p>
      </div>
    </main>
  );
}
