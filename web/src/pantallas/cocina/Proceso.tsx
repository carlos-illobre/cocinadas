import type { ProcesoVisible } from '../../cocina/modelo';
import { reloj, type Receta } from '../../api';
import { fotoDe } from './fotoDe';

/** Un proceso que corre solo —agua calentando, camarones descongelando— con su cuenta regresiva. */
const ICONO_PROCESO: Readonly<Record<string, string>> = { frio: '❄', calor: '♨', hervor: '≈', tapado: '◠', reposo: '·' };

export function Proceso({ visible, receta }: { readonly visible: ProcesoVisible; readonly receta: Receta }): React.JSX.Element {
  const { proceso, restante_s, fraccion, porSonar } = visible;
  const clase = porSonar ? 'proc warn' : proceso.critico || proceso.tipo === 'calor' || proceso.tipo === 'hervor' || proceso.tipo === 'tapado' ? 'proc hot' : 'proc cold';
  const foto = fotoDe(receta, proceso.ingrediente);
  return (
    <div className={clase} role="timer" aria-label={proceso.nombre}>
      <div className="ic">
        {foto !== null ? <img className="ph" src={foto} alt="" /> : <span className="ph ph-vacio" aria-hidden="true">{ICONO_PROCESO[proceso.tipo] ?? '·'}</span>}
        <b aria-hidden="true">{ICONO_PROCESO[proceso.tipo] ?? '·'}</b>
      </div>
      <div className="nm">
        {proceso.nombre}
        <small>{proceso.nota}</small>
      </div>
      <div className="tm">
        {reloj(restante_s)}
        <small>restante</small>
      </div>
      <div className="bar">
        <i style={{ width: `${fraccion * 100}%` }} />
      </div>
    </div>
  );
}
