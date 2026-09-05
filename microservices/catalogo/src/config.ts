/**
 * Configuración leída del entorno. Sin valores por omisión (invariante 2): el .env es la
 * única fuente de la verdad, y una variable ausente corta el arranque en vez de degradar
 * el comportamiento en silencio (invariante 3).
 */
export interface Config {
  readonly puerto: number;
  readonly logLevel: string;
  readonly natsUrl: string;
  readonly directorioDatos: string;
}

export type Entorno = Readonly<Record<string, string | undefined>>;

/**
 * Devuelve el valor de una variable obligatoria. Ausente y vacía se tratan igual acá
 * porque ninguna variable de este servicio admite «apagado a propósito»; el día que una
 * lo admita, se agrega `opcional()` con la distinción, no se afloja esta.
 */
export function obligatoria(entorno: Entorno, nombre: string): string {
  const valor = entorno[nombre];
  if (valor === undefined || valor === '') {
    throw new Error(`falta ${nombre} en el entorno`);
  }
  return valor;
}

export function puertoDesde(valor: string): number {
  const puerto = Number(valor);
  // Un puerto inválido tiene que verse al arrancar, no como un EADDRINUSE confuso después.
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PUERTO inválido: ${valor}`);
  }
  return puerto;
}

export function leerConfig(entorno: Entorno): Config {
  return {
    puerto: puertoDesde(obligatoria(entorno, 'PUERTO')),
    logLevel: obligatoria(entorno, 'LOG_LEVEL'),
    natsUrl: obligatoria(entorno, 'NATS_URL'),
    directorioDatos: obligatoria(entorno, 'DIRECTORIO_DATOS'),
  };
}
