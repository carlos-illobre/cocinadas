/**
 * Qué imagen hay que achicar, a cuánto, y dónde va la versión chica.
 *
 * Los originales viven en `data/` y en `docs/mockups/`, y ahí se quedan: son la fuente y
 * pueden pesar lo que haga falta. Las versiones que se publican van a `web/assets/`, y
 * **se versionan**: se regeneran con `pnpm optimizar` cuando cambia un original.
 *
 * Acá no se convierte nada. Esto decide; `optimizar.ts` ejecuta.
 *
 * Los anchos salen de a qué tamaño se muestra cada cosa en la app, no de lo que mide el
 * original. Una foto de ingrediente de 2000 px se muestra en un cuadrado de 44: mandarla
 * entera son dos megabytes de datos móviles para pintar un pulgar.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';

/** Formatos que sabemos leer. Los `.svg` de `inicio-capas/` son el mismo PNG en base64. */
const ENTRADA = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function esImagen(ruta: string): boolean {
  return ENTRADA.has(extname(ruta).toLowerCase());
}

/**
 * Ancho de destino por uso, medido sobre el CSS de la app y con margen para pantallas del
 * doble de densidad:
 *
 * - `miniatura`: ingredientes y utensilios. Se muestran a 38 px en la cocina, 44 en la
 *   portada y 52 en la mise en place. 128 alcanza para todos a más de 2×.
 * - `plato`: la foto de la receta. Ocupa el ancho de la app (430 px) en la tarjeta y en la
 *   portada a sangre; 860 es 2×.
 * - `escena`: las capas de la pantalla de inicio, sobre un lienzo de 1414 × 2000. Los
 *   1000 px vienen del pipeline anterior (docs/mockups/inicio-capas/README.md).
 *
 * Nunca se agranda: si el original mide menos, se deja como está.
 */
export const ANCHOS = { miniatura: 128, plato: 860, escena: 1000 } as const;
export type Uso = keyof typeof ANCHOS;

/**
 * Calidad de WebP por uso. Las miniaturas aguantan más compresión porque se ven chiquitas;
 * el fondo de inicio es lo primero que se ve y ocupa la pantalla entera.
 */
export const CALIDADES: Readonly<Record<Uso, number>> = { miniatura: 0.82, plato: 0.85, escena: 0.86 };

export interface Imagen {
  /** Ruta del original, relativa a la raíz del repositorio. */
  readonly origen: string;
  /** Ruta de la versión chica, relativa a la raíz del repositorio. */
  readonly destino: string;
  readonly uso: Uso;
  readonly ancho: number;
  readonly calidad: number;
}

interface Fuente {
  readonly directorio: string;
  readonly destino: string;
  readonly uso: Uso;
  /** Nombres de archivo que no van, aunque sean imágenes. */
  readonly excluir?: readonly string[];
  /** Nombre de salida distinto del de entrada, sin extensión. */
  readonly renombrar?: Readonly<Record<string, string>>;
}

/**
 * De dónde sale cada cosa y a dónde va. Las carpetas de `data/` se espejan tal cual, así
 * que el catálogo puede encontrar la versión chica cambiando el prefijo y la extensión.
 *
 * Las excepciones de `inicio-capas/` están explicadas en su README: la 11 llegó con fondo
 * blanco y lo que se publica es la que ya pasó por `quitar-fondo.mjs`; la composición
 * original es la referencia de diseño, no una capa.
 */
export const FUENTES: readonly Fuente[] = [
  { directorio: 'data/recetas', destino: 'web/assets/recetas', uso: 'plato' },
  { directorio: 'data/ingredientes', destino: 'web/assets/ingredientes', uso: 'miniatura' },
  { directorio: 'data/utencillos', destino: 'web/assets/utencillos', uso: 'miniatura' },
  {
    directorio: 'docs/mockups/inicio-capas',
    destino: 'web/assets/inicio',
    uso: 'escena',
    excluir: ['11.png', 'composicion-original.jpg'],
    renombrar: { '11-sin-fondo': '11' },
  },
];

/** Todas las imágenes de un directorio, recorriendo subcarpetas. Rutas relativas a `raiz`. */
export function buscarImagenes(raiz: string, directorio: string): readonly string[] {
  const absoluto = join(raiz, directorio);
  if (!existsSync(absoluto)) {
    return [];
  }
  const encontradas: string[] = [];
  for (const entrada of readdirSync(absoluto).sort()) {
    const ruta = join(absoluto, entrada);
    if (statSync(ruta).isDirectory()) {
      encontradas.push(...buscarImagenes(raiz, join(directorio, entrada)));
    } else if (esImagen(entrada)) {
      encontradas.push(relative(raiz, ruta).split(sep).join('/'));
    }
  }
  return encontradas;
}

/** `data/ingredientes/fotos-envases/x.jpg` → `web/assets/ingredientes/fotos-envases/x.webp`. */
export function destinoDe(origen: string, fuente: Fuente): string {
  const relativo = origen.slice(fuente.directorio.length + 1);
  const carpetas = relativo.split('/').slice(0, -1);
  const base = basename(relativo, extname(relativo));
  return [fuente.destino, ...carpetas, `${fuente.renombrar?.[base] ?? base}.webp`].join('/');
}

export function planificarImagenes(raiz: string): readonly Imagen[] {
  return FUENTES.flatMap((fuente) =>
    buscarImagenes(raiz, fuente.directorio)
      .filter((origen) => !(fuente.excluir ?? []).includes(basename(origen)))
      .map((origen) => ({
        origen,
        destino: destinoDe(origen, fuente),
        uso: fuente.uso,
        ancho: ANCHOS[fuente.uso],
        calidad: CALIDADES[fuente.uso],
      })),
  );
}

/**
 * La versión chica que le corresponde a un original de `data/`, para que el catálogo
 * publique esa y no la de dos megabytes.
 *
 * Vale para `data/` y no para las capas de inicio porque las tres carpetas de datos se
 * espejan tal cual en `web/assets/` (ver FUENTES): cambia el prefijo y la extensión, y
 * nada más. Que exista es otra pregunta, y la hace quien la use.
 */
export function chicaDe(origen: string, directorioDatos: string, directorioAssets: string): string {
  const relativo = relative(directorioDatos, origen);
  const carpetas = relativo.split(sep).slice(0, -1);
  return join(directorioAssets, ...carpetas, `${basename(relativo, extname(relativo))}.webp`);
}
