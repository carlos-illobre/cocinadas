import { reloj } from '../../api';
import type { ProgresoPaso } from '../../cocina/modelo';

/**
 * La cajita a la derecha del título: verde mientras se está en tiempo, roja y latiendo
 * pasado. Debajo del número va la meta —el previsto— y no «transcurrido»: es contra eso
 * que se mide. Antes de que el paso empiece, o mientras se espera a que venza lo que
 * corre, cuenta para atrás.
 */
export function Cronometro({ progreso, esperaPrevia_s, vence_s }: { readonly progreso: ProgresoPaso; readonly esperaPrevia_s: number; readonly vence_s: number | null }): React.JSX.Element {
  if (esperaPrevia_s > 0) {
    return (
      <div className="cronometro">
        <b>{reloj(esperaPrevia_s)}</b>
        <small>para empezar este paso</small>
      </div>
    );
  }
  if (vence_s !== null) {
    return (
      <div className="cronometro">
        <b>{reloj(vence_s)}</b>
        <small>para que venza lo que corre</small>
      </div>
    );
  }
  return (
    <div className="cronometro">
      <b>{reloj(progreso.transcurrido_s)}</b>
      {progreso.exceso_s > 0 ? (
        <span className="over">+{reloj(progreso.exceso_s)}</span>
      ) : (
        <small>
          de <strong>{reloj(progreso.previsto_s)}</strong> previstos
        </small>
      )}
    </div>
  );
}
