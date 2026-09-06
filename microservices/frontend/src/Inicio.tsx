import { useState } from 'react';

export interface PropiedadesInicio {
  /** Entrar sin cuenta: las cocinadas quedan en este teléfono. */
  readonly alEntrar: () => void;
}

/*
 * Los vegetales ocupan solo dos franjas del lienzo: una arriba (capas 2 a 6, hasta el 36 %
 * de la altura) y otra abajo (capas 7 a 10, del 55 % para abajo). Cada grupo se ancla a su
 * borde de la pantalla y se escala por el ancho, así los vegetales quedan pegados a los
 * bordes con su tamaño natural y el medio queda de pizarra, como en el diseño.
 */
const CAPAS_ARRIBA = [2, 3, 4, 5, 6];
// La 10 es la hoja de abajo a la izquierda: va antes que la 9 para quedar bajo los tallarines.
const CAPAS_ABAJO = [7, 8, 10, 9];

/**
 * Pantalla de inicio: la mesada como escena en capas. Las diez capas comparten un mismo
 * lienzo de 1414 × 2000 y ya vienen alineadas entre sí, así que dentro de cada grupo se
 * apilan con el mismo marco y ninguna se deforma. La 1 es el fondo de pizarra, en JPEG;
 * las otras nueve son los vegetales con transparencia, en WebP. Los originales están en
 * `docs/mockups/inicio-capas/`.
 */
export function Inicio({ alEntrar }: PropiedadesInicio): React.JSX.Element {
  const [avisoCuentas, setAvisoCuentas] = useState(false);

  return (
    <section className="inicio" aria-labelledby="inicio-lema">
      <div className="inicio-escena" aria-hidden="true">
        <img className="inicio-fondo" src="/inicio/1.jpg" alt="" fetchPriority="high" />
        <div className="inicio-capas arriba">
          {CAPAS_ARRIBA.map((n) => (
            <img key={n} className="inicio-capa" src={`/inicio/${n}.webp`} alt="" decoding="async" />
          ))}
        </div>
        <div className="inicio-capas abajo">
          {CAPAS_ABAJO.map((n) => (
            <img key={n} className="inicio-capa" src={`/inicio/${n}.webp`} alt="" decoding="async" />
          ))}
        </div>
      </div>

      <div className="inicio-contenido">
        <img className="inicio-logo" src="/logo.png" alt="Templa" width="300" height="100" />
        <p id="inicio-lema" className="inicio-lema">
          Tu receta, al punto justo
        </p>

        <div className="inicio-acciones">
          <button type="button" className="boton-google" onClick={() => setAvisoCuentas(true)}>
            <GoogleG />
            Continuar con Google
          </button>
          <button type="button" className="boton-sin-cuenta" onClick={alEntrar}>
            Entrar sin cuenta
          </button>
          {avisoCuentas && (
            <p className="inicio-aviso" role="status">
              Las cuentas todavía no están: falta el servicio de usuarios. Entrá sin cuenta y tus cocinadas se guardan en este teléfono.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** La «G» oficial de Google, en sus cuatro colores. */
function GoogleG(): React.JSX.Element {
  return (
    <svg className="google-g" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
