import { reloj } from '../../api';
import type { PasoHecho } from '../../cocina/modelo';
import { CLASE_DESVIO, desvio } from '../../cocina/resumen';

/** Un paso ya hecho en una línea de tiempo: previsto, tilde, título y desvío. */
export function FilaHecha({ paso }: { readonly paso: PasoHecho }): React.JSX.Element {
  const d = desvio(paso.previsto_s, paso.real_s, reloj);
  return (
    <div className="row done">
      <span className="t">{reloj(paso.previsto_s)}</span>
      <span className="dot">
        <i />
      </span>
      <span className="n">{paso.titulo}</span>
      <span className={`d ${CLASE_DESVIO[d.signo]}`.trimEnd()}>{d.texto}</span>
    </div>
  );
}
