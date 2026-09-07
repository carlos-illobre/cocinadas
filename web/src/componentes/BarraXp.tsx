import { nivelDe, progresoNivel } from '../progreso/xp';

export interface PropiedadesBarraXp {
  readonly xp: number;
}

/**
 * La tarjeta de experiencia: nivel y nombre, puntos, la barra
 * dorada del progreso dentro del nivel y sus dos extremos.
 */
export function BarraXp({ xp }: PropiedadesBarraXp): React.JSX.Element {
  const nivel = nivelDe(xp);
  const progreso = progresoNivel(xp);
  return (
    <section className="xp" aria-label="Experiencia">
      <div className="xp-fila">
        <span className="xp-nivel">
          Nivel {nivel.numero} — {nivel.nombre}
        </span>
        <span className="xp-puntos">{xp} XP</span>
      </div>
      <div className="barra dorada" role="progressbar" aria-label="Progreso del nivel" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
        <i style={{ width: `${progreso}%` }} />
      </div>
      <div className="xp-limites">
        <span>{nivel.desde_xp} XP</span>
        <span>{nivel.hasta_xp} XP</span>
      </div>
    </section>
  );
}
