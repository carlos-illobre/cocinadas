import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CLAVE_EN_CURSO } from '../cocina/enCurso';

interface Propiedades {
  readonly children: ReactNode;
  /** Inyectable para las pruebas; por omisión, recargar la página. */
  readonly recargar?: () => void;
}

interface Estado {
  readonly roto: boolean;
}

/**
 * Si algo revienta al dibujar, que no sea para siempre.
 *
 * El caso que importa: la cocinada en curso se guarda en el `localStorage` y se retoma al
 * arrancar. `enCurso.ts` comprueba lo básico —marca de tiempo, plato y modo— pero el resto
 * del estado es palabra de quien lo guardó, y un índice fuera de rango ahí rompe la
 * pantalla de cocina. Sin esto, la app quedaría en blanco en cada arranque hasta que el
 * guardado venza, seis horas después. Acá se descarta y se ofrece volver a empezar.
 */
export class Recuperacion extends Component<Propiedades, Estado> {
  override state: Estado = { roto: false };

  static getDerivedStateFromError(): Estado {
    return { roto: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('la app se rompió al dibujar', error, info.componentStack);
    try {
      localStorage.setItem(CLAVE_EN_CURSO, '');
    } catch {
      // Sin almacenamiento no hay nada guardado que pueda estar roto.
    }
  }

  override render(): ReactNode {
    if (!this.state.roto) {
      return this.props.children;
    }
    const recargar = this.props.recargar ?? (() => window.location.reload());
    return (
      <main className="pantalla" role="alert">
        <p className="eyebrow">Algo salió mal</p>
        <h1>La app se rompió al dibujar</h1>
        <p className="lead">Se descartó la cocinada que estaba en curso, por si era eso. Las guardadas no se tocan.</p>
        <button type="button" className="btn primary" onClick={recargar}>
          Volver a empezar
        </button>
      </main>
    );
  }
}
