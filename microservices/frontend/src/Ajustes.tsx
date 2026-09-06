import type { Tema } from './tema';

export interface PropiedadesAjustes {
  readonly tema: Tema;
  readonly alCambiarTema: () => void;
  readonly alVerEstado: () => void;
  readonly cocinadasGuardadas: number;
  readonly version: string;
}

/** Ajustes: el tema, dónde se guardan las cocinadas y el estado de los servicios. */
export function Ajustes({ tema, alCambiarTema, alVerEstado, cocinadasGuardadas, version }: PropiedadesAjustes): React.JSX.Element {
  const oscuro = tema === 'oscuro';
  return (
    <main className="pantalla ajustes">
      <header className="cabecera">
        <p className="saludo">Templa {version}</p>
        <h1>Ajustes</h1>
      </header>

      <div className="cuerpo">
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
            {cocinadasGuardadas === 0 ? 'Todavía no hay cocinadas guardadas.' : cocinadasGuardadas === 1 ? 'Hay 1 cocinada guardada' : `Hay ${cocinadasGuardadas} cocinadas guardadas`}
            {cocinadasGuardadas > 0 && ' en este teléfono.'} Con las cuentas de usuario van a sincronizarse con tu perfil.
          </p>
        </section>

        <section aria-labelledby="titulo-sistema">
          <h3 id="titulo-sistema" className="titulo-seccion">
            Sistema
          </h3>
          <button type="button" className="enlace" onClick={alVerEstado}>
            Estado de los servicios ›
          </button>
        </section>
      </div>
    </main>
  );
}
