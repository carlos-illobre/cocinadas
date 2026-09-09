import { useState } from 'react';
import type { Receta } from '../../api';
import { borrarEnCurso } from '../../cocina/enCurso';
import { atenderAlarma, empezarEtapa, etapaActual } from '../../cocina/modelo';
import type { Avisador } from '../../cocina/sonido';
import type { Almacen, Cocinada } from '../../historial/almacen';
import { conTransicion } from '../../transicion';
import { Alarma } from './Alarma';
import { Cabecera } from './Cabecera';
import { FinDeEtapa } from './FinDeEtapa';
import { Final } from './Final';
import { Riel } from './Riel';
import { TarjetaPaso } from './TarjetaPaso';
import { useCocina } from './useCocina';

interface PropiedadesCocina {
  readonly receta: Receta;
  readonly avisador: Avisador;
  readonly alVolver: () => void;
  readonly alTerminar: () => void;
  /** Guarda la cocinada terminada (el id lo pone quien guarda). */
  readonly alGuardar: (cocinada: Omit<Cocinada, 'id'>) => void;
  /** Las cocinadas que ya estaban guardadas, para saber qué logro desbloquea esta. */
  readonly cocinadas: readonly Cocinada[];
  /** Dónde se guarda la cocinada en curso, para no perderla si la página se recarga. */
  readonly almacen: Almacen;
  /** Reloj inyectable; por omisión, el del navegador. */
  readonly ahora?: () => number;
  /** Cada cuánto se redibuja, en ms. */
  readonly tic_ms?: number;
}

/**
 * La pantalla de cocina: arriba los procesos que corren solos, en el medio la tarea de
 * las manos con su cronómetro, abajo el riel con los carriles. Cuando vence un proceso
 * crítico, la alarma tapa todo; entre etapas, la pausa; al final, el resumen.
 */
export function Cocina({ receta, avisador, alVolver, alTerminar, alGuardar, cocinadas, almacen, ahora = () => Date.now(), tic_ms = 500 }: PropiedadesCocina): React.JSX.Element {
  const cocina = useCocina(receta, almacen, avisador, ahora, tic_ms);
  const { estado, reloj_ms, accion } = cocina;
  // Al terminar el último paso no se salta a los resultados: la tarjeta del paso se vuelve
  // «Receta completada» con un botón, y el festejo —confeti y sonido— arranca recién al tocarlo.
  const [verResultados, setVerResultados] = useState(false);

  if (estado.fase === 'alarma') {
    return <Alarma estado={estado} alAtender={accion(atenderAlarma)} />;
  }
  if (estado.fase === 'fin-etapa') {
    return <FinDeEtapa estado={estado} alSeguir={accion(empezarEtapa)} />;
  }
  if (estado.fase === 'fin' && verResultados) {
    return <Final estado={estado} alVolver={alTerminar} alGuardar={alGuardar} cocinadas={cocinadas} avisador={avisador} fecha={() => new Date(ahora()).toISOString()} />;
  }

  return (
    <main className={etapaActual(estado).vigilancia ? 'pantalla cocina critica' : 'pantalla cocina'}>
      <Cabecera
        estado={estado}
        reloj_ms={reloj_ms}
        receta={receta}
        alVolver={() => {
          borrarEnCurso(almacen);
          alVolver();
        }}
      />

      {estado.fase === 'fin' ? (
        <section className="now completada" aria-label="Receta completada">
          <p className="tilde" aria-hidden="true">
            ✅
          </p>
          <h2>¡Receta completada!</h2>
          <button type="button" className="btn verde" onClick={() => conTransicion(() => setVerResultados(true))}>
            Ver resultados 🏆
          </button>
        </section>
      ) : (
        // Con `key` por paso e inicio: al pasar de paso o reiniciarlo, el «?» se cierra solo.
        <TarjetaPaso key={`${estado.etapa}-${estado.paso}-${String(estado.inicioPaso_ms)}`} {...cocina} receta={receta} />
      )}

      <Riel estado={estado} ahora={reloj_ms} />
    </main>
  );
}
