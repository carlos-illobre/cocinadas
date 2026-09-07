import { useEffect, useRef, useState } from 'react';
import type { Receta, RecetaResumen } from '../api';
import { borrarEnCurso, recetaEnCurso } from '../cocina/enCurso';
import type { Almacen } from '../historial/almacen';

export type Pantalla =
  | { readonly nombre: 'inicio' }
  | { readonly nombre: 'recetas' }
  | { readonly nombre: 'portada'; readonly resumen: RecetaResumen; readonly version: string }
  | { readonly nombre: 'mise'; readonly receta: Receta }
  | { readonly nombre: 'cocina'; readonly receta: Receta }
  | { readonly nombre: 'historial' }
  | { readonly nombre: 'perfil' };

interface Pila {
  readonly pantalla: Pantalla;
  /** Ir a una pantalla nueva: se apila y se agrega una entrada al historial. */
  readonly avanzar: (p: Pantalla) => void;
  /** Volver: se desapila acá y se consume la entrada del historial sin reaccionar a ella. */
  readonly atras: () => void;
  /** Cambiar algo de la pantalla actual sin apilar otra (elegir el modo de preparación). */
  readonly reemplazar: (p: Pantalla) => void;
}

/** La pila sin su última pantalla; con una sola no se toca, porque no hay a dónde volver. */
const sinLaUltima = (pila: readonly Pantalla[]): readonly Pantalla[] => (pila.length > 1 ? pila.slice(0, -1) : pila);

const ultima = (pila: readonly Pantalla[]): Pantalla => pila[pila.length - 1] as Pantalla;

/**
 * La navegación, sin enrutador: la pila de pantallas cabe en un objeto y la URL no cambia
 * nunca. El botón de atrás del teléfono dispara `popstate`; sin la pila, la app no tendría
 * a dónde volver y el navegador se iría del sitio.
 */
export function usePila(almacen: Almacen, ahora: () => number): Pila {
  // Si quedó una cocinada a medio hacer, se vuelve directo a la cocina. Es lo que pasa
  // cuando el teléfono descarta la pestaña o alguien recarga sin querer.
  const [pila, setPila] = useState<readonly Pantalla[]>(() => {
    const receta = recetaEnCurso(almacen, ahora());
    return receta === null ? [{ nombre: 'inicio' }] : [{ nombre: 'inicio' }, { nombre: 'cocina', receta }];
  });
  const volviendoSolo = useRef(false);

  // Atrás del teléfono: se descarta la pantalla de arriba de la pila. Cuando ya no queda
  // ninguna, no se hace nada y el navegador se va del sitio, que es lo esperable.
  useEffect(() => {
    const atrasDelTelefono = () => {
      if (volviendoSolo.current) {
        volviendoSolo.current = false;
        return;
      }
      setPila((prev) => {
        // Salir de la cocina con el botón de atrás es salir: la cocinada a medio hacer se
        // descarta igual que con «‹ Volver», para no retomarla sin querer más tarde.
        if (prev.length > 1 && ultima(prev).nombre === 'cocina') {
          borrarEnCurso(almacen);
        }
        return sinLaUltima(prev);
      });
    };
    window.addEventListener('popstate', atrasDelTelefono);
    return () => window.removeEventListener('popstate', atrasDelTelefono);
  }, [almacen]);

  const pantalla = ultima(pila);

  // Cada pantalla arranca arriba. Todas viven en el mismo documento —la app nunca cambia
  // de página— así que sin esto el navegador conserva el desplazamiento: al terminar la
  // cocinada, que se juega al pie de una línea de tiempo larga, la pantalla de victoria
  // aparecía ya desplazada hasta abajo, con el festejo y el confeti arriba de todo, fuera
  // de la vista.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pantalla.nombre]);

  return {
    pantalla,
    avanzar: (p) => {
      window.history.pushState(null, '');
      setPila((prev) => [...prev, p]);
    },
    atras: () => {
      volviendoSolo.current = true;
      setPila(sinLaUltima);
      window.history.back();
    },
    reemplazar: (p) => setPila((prev) => [...prev.slice(0, -1), p]),
  };
}
