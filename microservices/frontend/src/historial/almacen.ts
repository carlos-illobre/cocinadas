/**
 * Donde se guarda lo que la app recuerda en el telefono: la parte de localStorage que
 * se usa. En las pruebas se reemplaza por un mapa en memoria.
 */
export interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

/**
 * Un almacen que nunca falla: localStorage puede no existir o lanzar (modo privado,
 * datos bloqueados). Ante eso se guarda en memoria y lo guardado dura la sesion.
 */
export function almacenSeguro(candidato: Almacen | undefined): Almacen {
  const memoria = new Map<string, string>();
  return {
    getItem(clave) {
      try {
        return candidato?.getItem(clave) ?? memoria.get(clave) ?? null;
      } catch {
        return memoria.get(clave) ?? null;
      }
    },
    setItem(clave, valor) {
      memoria.set(clave, valor);
      try {
        candidato?.setItem(clave, valor);
      } catch {
        // Sin almacenamiento persistente: queda en memoria.
      }
    },
  };
}

/**
 * Las cocinadas guardadas en el dispositivo. Es el mismo registro que más adelante se
 * sincroniza con el perfil (servicio `cocinadas`); hasta entonces vive en localStorage
 * bajo una sola clave, como JSON.
 */
export interface EtapaCocinada {
  readonly nombre: string;
  readonly previsto_s: number;
  readonly real_s: number;
}

export interface PasoCocinado {
  readonly id: string;
  readonly titulo: string;
  readonly previsto_s: number;
  readonly real_s: number;
  readonly critico: boolean;
}

export interface Cocinada {
  readonly id: string;
  readonly plato: string;
  readonly nombre: string;
  readonly version: { readonly clave: string; readonly titulo: string };
  /** ISO 8601, UTC. */
  readonly fecha: string;
  readonly total_previsto_s: number;
  readonly total_real_s: number;
  readonly etapas: readonly EtapaCocinada[];
  readonly pasos: readonly PasoCocinado[];
  readonly criticos: number;
  readonly criticosATiempo: number;
}

export const CLAVE_COCINADAS = 'templa.cocinadas';

function esCocinada(x: unknown): x is Cocinada {
  return typeof x === 'object' && x !== null && typeof (x as Cocinada).id === 'string' && typeof (x as Cocinada).plato === 'string' && typeof (x as Cocinada).total_real_s === 'number';
}

/** Lee todas, de la más reciente a la más antigua. Lo que no se pueda leer se ignora, no rompe. */
export function listarCocinadas(almacen: Almacen): readonly Cocinada[] {
  const crudo = almacen.getItem(CLAVE_COCINADAS);
  if (crudo === null) {
    return [];
  }
  try {
    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) {
      return [];
    }
    return datos.filter(esCocinada).sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch {
    return [];
  }
}

export function guardarCocinada(almacen: Almacen, cocinada: Cocinada): readonly Cocinada[] {
  const todas = [cocinada, ...listarCocinadas(almacen).filter((c) => c.id !== cocinada.id)];
  almacen.setItem(CLAVE_COCINADAS, JSON.stringify(todas));
  return todas;
}

export interface ProgresoReceta {
  readonly plato: string;
  readonly nombre: string;
  /** De la más antigua a la más reciente, que es como se lee un gráfico de progreso. */
  readonly intentos: readonly Cocinada[];
  readonly mejor_s: number;
  readonly promedio_s: number;
  readonly objetivo_s: number;
}

/** Agrupa por plato; el objetivo es el previsto de la versión del último intento. */
export function progresoPorReceta(cocinadas: readonly Cocinada[]): readonly ProgresoReceta[] {
  const porPlato = new Map<string, Cocinada[]>();
  for (const c of cocinadas) {
    porPlato.set(c.plato, [...(porPlato.get(c.plato) ?? []), c]);
  }
  return [...porPlato.entries()].map(([plato, lista]) => {
    const intentos = [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const tiempos = intentos.map((i) => i.total_real_s);
    const ultimo = intentos[intentos.length - 1] as Cocinada;
    return {
      plato,
      nombre: ultimo.nombre,
      intentos,
      mejor_s: Math.min(...tiempos),
      promedio_s: Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length),
      objetivo_s: ultimo.total_previsto_s,
    };
  });
}

/** «5 sep 2026 · 19:40», en la zona horaria del teléfono. */
export function fechaCorta(iso: string, idioma = 'es-AR'): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString(idioma, { day: 'numeric', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString(idioma, { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
}
