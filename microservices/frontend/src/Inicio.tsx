export interface PropiedadesInicio {
  /** Qué pasa al tocar «Empezar». Lo decide quien monta la pantalla, no la pantalla. */
  readonly alEmpezar: () => void;
}

/**
 * Pantalla de inicio (docs/mockups/bienvenida-concepto.png): la foto de la mesada de
 * fondo, el logo, el lema y un solo botón. Es lo primero que ve quien abre la app.
 */
export function Inicio({ alEmpezar }: PropiedadesInicio): React.JSX.Element {
  return (
    <section className="inicio" aria-labelledby="inicio-lema">
      {/* `alt` vacío: es decorativa; el nombre del producto lo da el logo. */}
      <img className="inicio-fondo" src="/inicio.jpg" alt="" />
      <div className="inicio-velo" aria-hidden="true" />
      <div className="inicio-contenido">
        <img className="inicio-logo" src="/logo.png" alt="Templa" width="300" height="100" />
        <p id="inicio-lema" className="inicio-lema">
          Tu receta, al punto justo
        </p>
        <button type="button" className="inicio-boton" onClick={alEmpezar}>
          Empezar
        </button>
      </div>
    </section>
  );
}
