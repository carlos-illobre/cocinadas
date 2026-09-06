import { reloj } from './api';
import type { Cocinada } from './historial/almacen';
import { logros } from './logros';
import type { Tema } from './tema';
import { nivelDe, progresoNivel } from './xp';

export interface PropiedadesPerfil {
  readonly cocinadas: readonly Cocinada[];
  readonly xp: number;
  readonly tema: Tema;
  readonly alCambiarTema: () => void;
  readonly alVerEstado: () => void;
  readonly version: string;
}

/**
 * El perfil del prototipo de Figma: nivel y experiencia, los números de la cocina, los
 * logros y el interruptor de tema. Todo sale de las cocinadas guardadas; mientras no
 * haya cuentas, no hay nombre ni sesión que cerrar.
 */
export function Perfil({ cocinadas, xp, tema, alCambiarTema, alVerEstado, version }: PropiedadesPerfil): React.JSX.Element {
  const nivel = nivelDe(xp);
  const progreso = progresoNivel(xp);
  const minutos = Math.round(cocinadas.reduce((suma, c) => suma + c.total_real_s, 0) / 60);
  const todos = logros(cocinadas);
  const conseguidos = todos.filter((l) => l.conseguido).length;
  const oscuro = tema === 'oscuro';

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
          <Numero icono="⏱" valor={String(minutos)} nombre="Minutos en la cocina" />
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

        <section aria-labelledby="titulo-tema">
          <h3 id="titulo-tema" className="titulo-seccion">
            Tema
          </h3>
          <button type="button" className="boton-tema" onClick={alCambiarTema}>
            <span className="boton-tema-icono" aria-hidden="true">
              {oscuro ? '☀️' : '🌙'}
            </span>
            {oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </button>
        </section>

        <section aria-labelledby="titulo-datos">
          <h3 id="titulo-datos" className="titulo-seccion">
            Tus cocinadas
          </h3>
          <p className="lead">
            {cocinadas.length === 0 ? 'Todavía no hay cocinadas guardadas.' : `Suman ${reloj(cocinadas.reduce((s, c) => s + c.total_real_s, 0))} de cocina, guardadas en este teléfono.`} Con las cuentas de usuario van a sincronizarse con tu perfil.
          </p>
          <button type="button" className="enlace" onClick={alVerEstado}>
            Estado de los servicios ›
          </button>
          <p className="perfil-version">Templa {version}</p>
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
