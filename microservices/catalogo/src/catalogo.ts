import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';

/**
 * Inventario de lo que el servicio encontró en el directorio de datos empaquetado en la
 * imagen (ADR-006). Solo cuenta: sirve para que /health diga si la imagen se construyó
 * con los datos adentro, que es el error que se quiere ver en el primer arranque y no en
 * la primera consulta.
 */
export interface Inventario {
  readonly recetas: number;
  readonly ingredientes: number;
  readonly utensilios: number;
}

/** Nombres de archivo que no son fichas aunque terminen en .md (ver los README de cada carpeta). */
export function esFicha(nombre: string): boolean {
  return (
    nombre.endsWith('.md') &&
    nombre !== 'README.md' &&
    !nombre.startsWith('plantilla-') &&
    !nombre.startsWith('indice-')
  );
}

/** Una receta es un archivo .json dentro de una subcarpeta de data/recetas/ (data/recetas/README.md). */
export function contarRecetas(directorioRecetas: string): number {
  let total = 0;
  for (const entrada of readdirSync(directorioRecetas)) {
    const ruta = join(directorioRecetas, entrada);
    if (statSync(ruta).isDirectory()) {
      total += readdirSync(ruta).filter((a) => a.endsWith('.json')).length;
    }
  }
  return total;
}

/** Los ingredientes están en subcarpetas por categoría; los utensilios, en la raíz de su carpeta. */
export function contarFichas(directorio: string, recursivo: boolean): number {
  let total = 0;
  for (const entrada of readdirSync(directorio)) {
    const ruta = join(directorio, entrada);
    if (statSync(ruta).isDirectory()) {
      if (recursivo) {
        total += contarFichas(ruta, recursivo);
      }
    } else if (esFicha(entrada)) {
      total += 1;
    }
  }
  return total;
}

export function inventariar(directorioDatos: string): Inventario {
  return {
    recetas: contarRecetas(join(directorioDatos, 'recetas')),
    ingredientes: contarFichas(join(directorioDatos, 'ingredientes'), true),
    utensilios: contarFichas(join(directorioDatos, 'utencillos'), false),
  };
}

// ─── El catálogo en memoria ──────────────────────────────────────────────────

/** Lo que el JSON de una receta declara (data/recetas/esquema-receta.md). Solo lo que el servicio lee. */
export interface RecetaJson {
  readonly esquema: number;
  readonly plato: string;
  readonly version: { readonly numero: number; readonly clave: string; readonly titulo: string; readonly resumen: string };
  readonly nombre: string;
  readonly momento: string;
  readonly porciones: number;
  readonly tiempo_total_s: number;
  readonly tiempo_total_texto: string;
  readonly nutricion: Readonly<Record<string, number>>;
  readonly fuentes: { readonly foto?: string };
  readonly ingredientes: readonly { readonly id: string | null; readonly [k: string]: unknown }[];
  readonly utensilios: readonly { readonly id: string | null; readonly [k: string]: unknown }[];
  readonly [k: string]: unknown;
}

export interface VersionResumen {
  readonly numero: number;
  readonly clave: string;
  readonly titulo: string;
  readonly resumen: string;
  readonly tiempo_total_s: number;
  readonly tiempo_total_texto: string;
}

export interface RecetaResumen {
  readonly plato: string;
  readonly nombre: string;
  readonly momento: string;
  readonly porciones: number;
  readonly nutricion: Readonly<Record<string, number>>;
  /** Ruta relativa a la API (`/recetas/<plato>/foto`), o null si el plato no tiene foto. */
  readonly foto: string | null;
  readonly versiones: readonly VersionResumen[];
}

/** La receta completa tal como la sirve la API: el JSON más la ruta de cada foto resuelta. */
export type RecetaServida = RecetaJson & {
  readonly foto: string | null;
  readonly ingredientes: readonly { readonly id: string | null; readonly foto: string | null; readonly [k: string]: unknown }[];
  readonly utensilios: readonly { readonly id: string | null; readonly foto: string | null; readonly [k: string]: unknown }[];
};

export interface Catalogo {
  recetas(): readonly RecetaResumen[];
  /** `version` acepta la clave (`dos-etapas`) o el número (`2`). */
  receta(plato: string, version: string): RecetaServida | null;
  /** Ruta absoluta del archivo, o null. Nunca devuelve una ruta fuera del directorio de datos. */
  fotoReceta(plato: string): string | null;
  fotoIngrediente(id: string): string | null;
  fotoUtensilio(id: string): string | null;
}

const IMAGEN_MARKDOWN = /!\[[^\]]*\]\(([^)\s]+)\)/;

/**
 * La foto de una ficha es la primera imagen Markdown enlazada (data/ingredientes/README.md).
 * Devuelve la ruta absoluta solo si el archivo existe y queda dentro del directorio de
 * datos: una ficha no puede apuntar afuera de la imagen.
 */
export function fotoDeFicha(rutaFicha: string, directorioDatos: string): string | null {
  const enlace = IMAGEN_MARKDOWN.exec(readFileSync(rutaFicha, 'utf8'));
  if (enlace === null) {
    return null;
  }
  const ruta = resolve(dirname(rutaFicha), enlace[1] as string);
  const raiz = resolve(directorioDatos) + sep;
  if (!ruta.startsWith(raiz) || !existsSync(ruta)) {
    return null;
  }
  return ruta;
}

/** Recorre las fichas y arma id → ruta de la foto (solo las que tienen). */
export function indexarFotos(directorio: string, recursivo: boolean, directorioDatos: string): Map<string, string> {
  const fotos = new Map<string, string>();
  for (const entrada of readdirSync(directorio)) {
    const ruta = join(directorio, entrada);
    if (statSync(ruta).isDirectory()) {
      if (recursivo) {
        for (const [id, foto] of indexarFotos(ruta, recursivo, directorioDatos)) {
          fotos.set(id, foto);
        }
      }
    } else if (esFicha(entrada)) {
      const foto = fotoDeFicha(ruta, directorioDatos);
      if (foto !== null) {
        fotos.set(basename(entrada, '.md'), foto);
      }
    }
  }
  return fotos;
}

/** Lee todos los JSON de recetas. Un JSON con otro esquema se ignora con aviso, no corta el arranque. */
export function leerRecetas(directorioRecetas: string, avisar: (mensaje: string) => void): readonly RecetaJson[] {
  const recetas: RecetaJson[] = [];
  for (const entrada of readdirSync(directorioRecetas)) {
    const carpeta = join(directorioRecetas, entrada);
    if (!statSync(carpeta).isDirectory()) {
      continue;
    }
    for (const archivo of readdirSync(carpeta).filter((a) => a.endsWith('.json'))) {
      const ruta = join(carpeta, archivo);
      const json = JSON.parse(readFileSync(ruta, 'utf8')) as RecetaJson;
      if (json.esquema !== 1 || json.plato !== entrada) {
        avisar(`se ignora ${ruta}: esquema ${String(json.esquema)} o plato ${String(json.plato)} distinto de la carpeta`);
        continue;
      }
      recetas.push(json);
    }
  }
  return recetas;
}

export function cargarCatalogo(directorioDatos: string, avisar: (mensaje: string) => void): Catalogo {
  const dirRecetas = join(directorioDatos, 'recetas');
  const recetas = leerRecetas(dirRecetas, avisar);
  const fotosIngredientes = indexarFotos(join(directorioDatos, 'ingredientes'), true, directorioDatos);
  const fotosUtensilios = indexarFotos(join(directorioDatos, 'utencillos'), false, directorioDatos);

  const fotoReceta = (plato: string): string | null => {
    const primera = recetas.find((r) => r.plato === plato);
    if (primera === undefined || primera.fuentes.foto === undefined) {
      return null;
    }
    const ruta = join(dirRecetas, plato, primera.fuentes.foto);
    return existsSync(ruta) ? ruta : null;
  };

  const resumenDe = (r: RecetaJson): VersionResumen => ({
    numero: r.version.numero,
    clave: r.version.clave,
    titulo: r.version.titulo,
    resumen: r.version.resumen,
    tiempo_total_s: r.tiempo_total_s,
    tiempo_total_texto: r.tiempo_total_texto,
  });

  const conFotos = <T extends { readonly id: string | null }>(lista: readonly T[], fotos: Map<string, string>, prefijo: string) =>
    lista.map((x) => ({ ...x, foto: x.id !== null && fotos.has(x.id) ? `${prefijo}/${x.id}/foto` : null }));

  return {
    recetas() {
      const porPlato = new Map<string, RecetaJson[]>();
      for (const r of recetas) {
        porPlato.set(r.plato, [...(porPlato.get(r.plato) ?? []), r]);
      }
      return [...porPlato.entries()].map(([plato, versiones]) => {
        const primera = versiones[0] as RecetaJson;
        return {
          plato,
          nombre: primera.nombre,
          momento: primera.momento,
          porciones: primera.porciones,
          nutricion: primera.nutricion,
          foto: fotoReceta(plato) === null ? null : `/recetas/${plato}/foto`,
          versiones: versiones.map(resumenDe).sort((a, b) => a.numero - b.numero),
        };
      });
    },
    receta(plato, version) {
      const r = recetas.find((x) => x.plato === plato && (x.version.clave === version || String(x.version.numero) === version));
      if (r === undefined) {
        return null;
      }
      return {
        ...r,
        foto: fotoReceta(plato) === null ? null : `/recetas/${plato}/foto`,
        ingredientes: conFotos(r.ingredientes, fotosIngredientes, '/ingredientes'),
        utensilios: conFotos(r.utensilios, fotosUtensilios, '/utensilios'),
      };
    },
    fotoReceta,
    fotoIngrediente: (id) => fotosIngredientes.get(id) ?? null,
    fotoUtensilio: (id) => fotosUtensilios.get(id) ?? null,
  };
}
