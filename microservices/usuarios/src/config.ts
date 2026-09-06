/**
 * Configuración leída del entorno. Sin valores por omisión (invariante 2): el .env es la
 * única fuente de la verdad, y una variable ausente corta el arranque en vez de degradar
 * el comportamiento en silencio (invariante 3).
 */
export interface Config {
  readonly puerto: number;
  readonly logLevel: string;
  /** Peticiones por minuto y por IP antes de contestar 429. */
  readonly limitePorMinuto: number;
  readonly natsUrl: string;
  readonly databaseUrl: string;
  readonly jwtSecret: string;
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

/**
 * El secreto de los JWT es lo que impide falsificar sesiones. Un secreto corto se
 * adivina por fuerza bruta; acá se exige un mínimo para que un `.env` copiado del ejemplo
 * sin cambiar no arranque en producción.
 */
export const LARGO_MINIMO_SECRETO = 32;

export function secretoDesde(valor: string): string {
  if (valor.length < LARGO_MINIMO_SECRETO) {
    throw new Error(`JWT_SECRET demasiado corto: tiene ${valor.length} caracteres y el mínimo es ${LARGO_MINIMO_SECRETO}`);
  }
  return valor;
}

export function limiteDesde(valor: string): number {
  const limite = Number(valor);
  // Un límite de cero o negativo dejaría la API sin protección sin que nadie lo note.
  if (!Number.isInteger(limite) || limite < 1) {
    throw new Error(`RATE_LIMIT_POR_MINUTO inválido: ${valor}`);
  }
  return limite;
}

export function leerConfig(entorno: Entorno): Config {
  return {
    puerto: puertoDesde(obligatoria(entorno, 'PUERTO')),
    logLevel: obligatoria(entorno, 'LOG_LEVEL'),
    limitePorMinuto: limiteDesde(obligatoria(entorno, 'RATE_LIMIT_POR_MINUTO')),
    natsUrl: obligatoria(entorno, 'NATS_URL'),
    databaseUrl: obligatoria(entorno, 'DATABASE_URL'),
    jwtSecret: secretoDesde(obligatoria(entorno, 'JWT_SECRET')),
  };
}
