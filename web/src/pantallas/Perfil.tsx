import { reloj } from '../api';
import type { Cocinada } from '../historial/almacen';
import { logros } from '../progreso/logros';
import { nivelDe, progresoNivel } from '../progreso/xp';

interface PropiedadesPerfil {
  readonly cocinadas: readonly Cocinada[];
  readonly xp: number;
  readonly version: string;
}

/**
 * El perfil: nivel y experiencia, los números de la cocina, los
 * logros. Todo sale de las cocinadas guardadas.
 */
export function Perfil({ cocinadas, xp, version }: PropiedadesPerfil): React.JSX.Element {
  const nivel = nivelDe(xp);
  const progreso = progresoNivel(xp);
  const total_s = cocinadas.reduce((suma, c) => suma + c.total_real_s, 0);
  const todos = logros(cocinadas);
  const conseguidos = todos.filter((l) => l.conseguido).length;

  return (
    <main className="pantalla perfil">
      <header className="cabecera perfil-cabecera">
        <p className="perfil-avatar" aria-hidden="true">
          {nivel.numero}
        </p>
        <h1>{nivel.nombre}</h1>
        <p className="perfil-nivel">Nivel {nivel.numero}</p>

        <section className="xp" aria-label="Experiencia">
          <div className="xp-fila">
            <span className="xp-nivel">{nivel.desde_xp} XP</span>
            <span className="xp-puntos">
              {xp} / {nivel.hasta_xp} XP
            </span>
          </div>
          <div className="barra dorada" role="progressbar" aria-label="Progreso del nivel" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
            <i style={{ width: `${progreso}%` }} />
          </div>
          <p className="xp-falta">{Math.max(0, nivel.hasta_xp - xp)} XP para el nivel siguiente</p>
        </section>
      </header>

      <div className="cuerpo">
        <div className="numeros">
          <Numero icono="🍳" valor={String(cocinadas.length)} nombre="Recetas cocinadas" />
          <Numero icono="⏱" valor={String(Math.round(total_s / 60))} nombre="Minutos en la cocina" />
          <Numero icono="⚡" valor={String(xp)} nombre="Experiencia" clase="dorado" />
          <Numero icono="🏅" valor={`${conseguidos}/${todos.length}`} nombre="Logros" clase="marca" />
        </div>

        <section aria-labelledby="titulo-logros">
          <h3 id="titulo-logros" className="titulo-seccion">
            Logros
          </h3>
          <ul className="logros">
            {todos.map((l) => (
              <li key={l.id} className={l.conseguido ? 'logro' : 'logro pendiente'}>
                <span className="logro-icono" aria-hidden="true">
                  {l.icono}
                </span>
                <b>{l.nombre}</b>
                <small>{l.descripcion}</small>
                {l.conseguido && <span className="logro-hecho">Conseguido ✓</span>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-datos">
          <h3 id="titulo-datos" className="titulo-seccion">
            Tus cocinadas
          </h3>
          <p className="lead">
            {cocinadas.length === 0 ? 'Todavía no hay cocinadas guardadas.' : `Suman ${reloj(total_s)} de cocina, guardadas en este teléfono.`}
          </p>
          <p className="perfil-version">Cocinadas {version}</p>
        </section>
      </div>
    </main>
  );
}

function Numero({ icono, valor, nombre, clase = '' }: { readonly icono: string; readonly valor: string; readonly nombre: string; readonly clase?: string }): React.JSX.Element {
  return (
    <div className="numero">
      <span className="numero-icono" aria-hidden="true">
        {icono}
      </span>
      <b className={clase}>{valor}</b>
      <small>{nombre}</small>
    </div>
  );
}
