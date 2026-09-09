import { useEffect, useRef, useState } from 'react';
import type { Receta } from '../../api';
import { borrarEnCurso, guardarEnCurso, leerEnCurso } from '../../cocina/enCurso';
import { avanzarReloj, empezar, tildar, type EstadoCocina } from '../../cocina/modelo';
import type { Avisador } from '../../cocina/sonido';
import type { Almacen } from '../../historial/almacen';
import { conTransicion } from '../../transicion';

type Transicion = (e: EstadoCocina, t: number) => EstadoCocina;

export interface CocinaEnMarcha {
  readonly estado: EstadoCocina;
  readonly reloj_ms: number;
  /** Aplica una transición del modelo con la hora actual; `sonar` agrega el toque de confirmación. */
  readonly accion: (f: Transicion, sonar?: boolean) => () => void;
  readonly tildar: (i: number) => void;
}

/**
 * El estado de la cocinada y lo que la mantiene viva: el tic que redibuja y detecta
 * vencimientos, los sonidos, el guardado y el volver arriba.
 */
export function useCocina(receta: Receta, almacen: Almacen, avisador: Avisador, ahora: () => number, tic_ms: number): CocinaEnMarcha {
  // Si hay una cocinada de esta misma receta a medio hacer, se retoma donde quedó.
  const [estado, setEstado] = useState<EstadoCocina>(() => leerEnCurso(almacen, receta, ahora()) ?? empezar(receta, ahora()));
  const [reloj_ms, setReloj] = useState(() => ahora());

  useEffect(() => {
    const id = setInterval(() => {
      const t = ahora();
      setReloj(t);
      setEstado((e) => avanzarReloj(e, t));
    }, tic_ms);
    return () => clearInterval(id);
  }, [ahora, tic_ms]);

  // Fuerte y repetido mientras la alarma esté en pantalla.
  useEffect(() => {
    if (estado.fase !== 'alarma') {
      return undefined;
    }
    avisador.fuerte();
    const id = setInterval(() => avisador.fuerte(), 2000);
    return () => clearInterval(id);
  }, [estado.fase, avisador]);

  // Suave al vencer un proceso no crítico.
  const avisosPrevios = useRef(0);
  useEffect(() => {
    if (estado.avisosSuaves > avisosPrevios.current) {
      avisosPrevios.current = estado.avisosSuaves;
      avisador.suave();
    }
  }, [estado.avisosSuaves, avisador]);

  // Se guarda a cada cambio, no cada tanto: el navegador del celular puede descartar la
  // pestaña en cualquier momento y no avisa.
  useEffect(() => {
    if (estado.fase === 'fin') {
      borrarEnCurso(almacen);
    } else {
      guardarEnCurso(almacen, estado, ahora());
    }
  }, [estado, almacen, ahora]);

  // Alarma, fin de etapa, final y cada paso son pantallas para quien cocina, pero no para
  // el navegador, que conserva el desplazamiento: «Listo» se toca al pie de la tarjeta y
  // el paso siguiente nacía metido debajo del bloque fijo, con el borde superior tapado.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [estado.fase, estado.etapa, estado.paso]);

  return {
    estado,
    reloj_ms,
    accion: (f, sonar = false) => () => {
      const t = ahora();
      if (sonar) {
        avisador.toque();
      }
      // Cada acción puede cambiar de paso, de etapa o de fase: lo que se va se funde con lo que llega.
      conTransicion(() => {
        setReloj(t);
        setEstado((e) => f(e, t));
      });
    },
    tildar: (i) => setEstado((e) => tildar(e, i)),
  };
}
