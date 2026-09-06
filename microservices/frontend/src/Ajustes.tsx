export interface PropiedadesAjustes {
  readonly alVerEstado: () => void;
  readonly cocinadasGuardadas: number;
  readonly version: string;
}

/** Ajustes: dónde se guardan las cocinadas y el estado de los servicios. */
export function Ajustes({ alVerEstado, cocinadasGuardadas, version }: PropiedadesAjustes): React.JSX.Element {
  return (
    <main className="pantalla ajustes">
      <header className="cabecera-oscura">
        <p className="saludo">Templa {version}</p>
        <h1>Ajustes</h1>
      </header>

      <div className="cuerpo">
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
