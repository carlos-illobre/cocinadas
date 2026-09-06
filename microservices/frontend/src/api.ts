import type { Fetch } from './salud';

/** El proxy publica el servicio de catálogo bajo este prefijo (infrastructure/reverse-proxy/Caddyfile). */
export const BASE_CATALOGO = '/api/catalogo';

export interface VersionResumen {
  readonly numero: number;
  readonly clave: string;
  readonly titulo: string;
  readonly resumen: string;
  /** Un emoji que identifica el modo en su tarjeta. */
  readonly icono: string;
  readonly tiempo_total_s: number;
  readonly tiempo_total_texto: string;
}

export interface RecetaResumen {
  readonly plato: string;
  readonly nombre: string;
  readonly momento: string;
  readonly porciones: number;
  readonly nutricion: Readonly<Record<string, number>>;
  readonly foto: string | null;
  readonly versiones: readonly VersionResumen[];
}

export interface Ingrediente {
  readonly id: string | null;
  readonly nombre: string;
  readonly cantidad: string;
  readonly preparacion: string;
  readonly foto: string | null;
}

export interface Utensilio {
  readonly id: string | null;
  readonly nombre: string;
  readonly uso: string;
  readonly foto: string | null;
}

export interface Paso {
  readonly id: string;
  readonly inicio_s: number;
  readonly duracion_s: number;
  readonly critico: boolean;
  readonly espera: boolean;
  readonly titulo: string;
  readonly acciones: readonly string[];
  readonly ingredientes: readonly string[];
  readonly inicia_procesos: readonly string[];
  readonly por_que: { readonly etiquetas: readonly string[]; readonly texto: string };
}

export interface Proceso {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: string;
  readonly inicio_s: number;
  readonly fin_s: number;
  readonly critico: boolean;
  readonly ingrediente: string | null;
  readonly nota: string;
  /** Id del paso que hay que hacer cuando vence, o null. */
  readonly al_terminar: string | null;
}

/** Un criterio de la seccion «Criterios de diseno» del documento. */
export interface Criterio {
  readonly titulo: string;
  readonly texto: string;
}

export interface Etapa {
  readonly id: string;
  readonly numero: number;
  readonly nombre: string;
  readonly vigilancia: boolean;
  readonly duracion_s: number;
  readonly arranque: string;
  readonly pausa_despues: string | null;
  readonly procesos: readonly Proceso[];
  readonly pasos: readonly Paso[];
}

/** La receta completa (data/recetas/esquema-receta.md), con las fotos ya resueltas por el catálogo. */
export interface Receta extends RecetaResumen {
  readonly version: VersionResumen;
  readonly sal_agregada_g: number;
  readonly tiempo_total_s: number;
  readonly tiempo_total_texto: string;
  readonly ingredientes: readonly Ingrediente[];
  readonly utensilios: readonly Utensilio[];
  readonly etapas: readonly Etapa[];
  readonly criterios: readonly Criterio[];
  readonly seguridad: readonly string[];
}

/** De la más lenta a la más rápida: la lenta es la que se propone, porque es la de cocinar con calma. */
export function versionesOrdenadas(resumen: RecetaResumen): readonly VersionResumen[] {
  return [...resumen.versiones].sort((a, b) => b.tiempo_total_s - a.tiempo_total_s);
}

async function pedir<T>(fetchImpl: Fetch, ruta: string): Promise<T> {
  const respuesta = await fetchImpl(`${BASE_CATALOGO}${ruta}`);
  if (!respuesta.ok) {
    throw new Error(`el catálogo respondió HTTP ${respuesta.status} a ${ruta}`);
  }
  return (await respuesta.json()) as T;
}

export function listarRecetas(fetchImpl: Fetch): Promise<readonly RecetaResumen[]> {
  return pedir(fetchImpl, '/recetas');
}

export function obtenerReceta(fetchImpl: Fetch, plato: string, version: string): Promise<Receta> {
  return pedir(fetchImpl, `/recetas/${plato}/${version}`);
}

/** Las fotos vienen como rutas relativas a la API; acá se vuelven URL que el navegador pueda pedir. */
export function urlFoto(ruta: string | null): string | null {
  return ruta === null ? null : `${BASE_CATALOGO}${ruta}`;
}

/** 1260 → «21 min»; 90 → «2 min» (se redondea: en la portada importa el orden de magnitud, no el segundo). */
export function minutos(segundos: number): string {
  return `${Math.round(segundos / 60)} min`;
}

/** 1260 → «21:00»; 75 → «1:15». Para los pasos, donde el segundo sí importa. */
export function reloj(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
