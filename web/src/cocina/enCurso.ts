import type { Receta } from '../api';
import type { Almacen } from '../historial/almacen';
import type { EstadoCocina } from './modelo';

/**
 * La cocinada en curso, guardada en el teléfono a cada cambio.
 *
 * Recargar la página en medio de una receta no puede costar el paso en el que estabas: el
 * navegador del celular descarta la pestaña cuando pasás a otra aplicación, atendés una
 * llamada o se apaga la pantalla, y eso pasa seguido en una cocina.
 *
 * Los tiempos del estado son marcas absolutas, así que al volver el cronómetro muestra lo
 * que de verdad pasó mientras la página no estaba: es lo correcto para una cocina, donde
 * el agua siguió hirviendo.
 */
export const CLAVE_EN_CURSO = 'cocinadas.cocinando';

/**
 * Pasado este tiempo sin tocar nada, la cocinada guardada se descarta. Una receta dura
 * media hora; retomar la de ayer no tendría sentido y mostraría tiempos absurdos.
 */
export const MAXIMA_ANTIGUEDAD_MS = 6 * 60 * 60 * 1000;

interface Guardado {
  readonly guardadoEn_ms: number;
  readonly estado: EstadoCocina;
}

export function guardarEnCurso(almacen: Almacen, estado: EstadoCocina, ahora: number): void {
  almacen.setItem(CLAVE_EN_CURSO, JSON.stringify({ guardadoEn_ms: ahora, estado } satisfies Guardado));
}

export function borrarEnCurso(almacen: Almacen): void {
  almacen.setItem(CLAVE_EN_CURSO, '');
}

/**
 * La receta de la cocinada guardada, si hay una y no está vieja. La usa el arranque de la
 * app para volver directo a la cocina: después de una recarga, hacer el camino desde la
 * bienvenida hasta el paso en el que estabas es tan malo como perder el progreso.
 */
export function recetaEnCurso(almacen: Almacen, ahora: number): Receta | null {
  const guardado = leerGuardado(almacen, ahora);
  return guardado === null ? null : (guardado.estado.receta ?? null);
}

/** Lo guardado, ya validado como objeto y por antigüedad. */
function leerGuardado(almacen: Almacen, ahora: number): Guardado | null {
  const crudo = almacen.getItem(CLAVE_EN_CURSO);
  if (crudo === null || crudo === '') {
    return null;
  }
  let guardado: Guardado;
  try {
    guardado = JSON.parse(crudo) as Guardado;
  } catch {
    return null;
  }
  if (typeof guardado?.guardadoEn_ms !== 'number' || typeof guardado.estado !== 'object' || guardado.estado === null) {
    return null;
  }
  // Pasada la ventana, se descarta: retomarla mostraría tiempos absurdos.
  return ahora - guardado.guardadoEn_ms > MAXIMA_ANTIGUEDAD_MS ? null : guardado;
}

/**
 * La cocinada guardada, si sirve para esta receta y no está vieja. Devuelve `null` ante
 * cualquier duda: perder el progreso es malo, pero retomar un estado que no corresponde
 * es peor, porque manda a cocinar el paso equivocado.
 */
export function leerEnCurso(almacen: Almacen, receta: Receta, ahora: number): EstadoCocina | null {
  const guardado = leerGuardado(almacen, ahora);
  if (guardado === null) {
    return null;
  }
  const estado = guardado.estado;
  // La receta puede haber cambiado con un despliegue nuevo: los índices del estado
  // apuntarían a pasos que ya no son los mismos.
  if (estado.receta?.plato !== receta.plato || estado.receta.version?.clave !== receta.version.clave) {
    return null;
  }
  return estado;
}
