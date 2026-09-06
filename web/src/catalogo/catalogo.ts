/**
 * El catálogo, leído de data/ en el momento de compilar (ADR-006, ADR-015).
 *
 * Esto corre en Node durante el build, no en el navegador: `generar.ts` lo llama antes
 * de `vite build` y escribe el resultado en public/api/catalogo/, que Vite copia tal cual
 * al bundle. Por eso vive en src/ y no en una carpeta aparte: la compuerta de cobertura
 * mide src/** y el generador entra sin configuración nueva.
 *
 * Acá no se escribe nada. `planificar` devuelve QUÉ archivos hay que crear y con qué
 * contenido; escribirlos es lo único que hace `generar.ts`, que por eso no se mide.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';

/** Nombres de archivo que no son fichas aunque terminen en .md (ver los README de cada carpeta). */
export function esFicha(nombre: string): boolean {
  return (
    nombre.endsWith('.md') &&
    nombre !== 'README.md' &&
    !nombre.startsWith('plantilla-') &&
    !nombre.startsWith('indice-')
  );
}

/**
 * Extensiones que el navegador sabe mostrar. Antes esto era el Content-Type que ponía el
 * servicio; ahora lo pone Caddy por la extensión del archivo, así que lo único que queda
 * es no copiar al bundle algo que no sea una imagen.
 */
const IMAGENES = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function esImagen(ruta: string): boolean {
  return IMAGENES.has(extname(ruta).toLowerCase());
}

/** Lo que el JSON de una receta declara (data/recetas/esquema-receta.md). Solo lo que se lee acá. */
export interface RecetaJson {
  readonly esquema: number;
  readonly plato: string;
  readonly version: { readonly numero: number; readonly clave: string; readonly titulo: string; readonly resumen: string; readonly icono: string };
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
  /** Un emoji que identifica el modo en la tarjeta (esquema-receta.md). */
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
  /** Ruta relativa a /api/catalogo (`/fotos/recetas/<plato>.jpg`), o null si no hay foto. */
  readonly foto: string | null;
  readonly versiones: readonly VersionResumen[];
}

/** La receta completa tal como la lee la app: el JSON más la ruta de cada foto resuelta. */
export type RecetaServida = RecetaJson & {
  readonly foto: string | null;
  readonly ingredientes: readonly { readonly id: string | null; readonly foto: string | null; readonly [k: string]: unknown }[];
  readonly utensilios: readonly { readonly id: string | null; readonly foto: string | null; readonly [k: string]: unknown }[];
};

/** Un archivo del bundle: su ruta relativa a public/api/catalogo/ y de dónde sale. */
export interface ArchivoJson {
  readonly ruta: string;
  readonly contenido: unknown;
}

export interface ArchivoCopiado {
  readonly ruta: string;
  readonly origen: string;
}

/** Todo lo que hay que escribir. Lo devuelve `planificar` y lo escribe `generar.ts`. */
export interface Plan {
  readonly json: readonly ArchivoJson[];
  readonly fotos: readonly ArchivoCopiado[];
}

const IMAGEN_MARKDOWN = /!\[[^\]]*\]\(([^)\s]+)\)/;

/**
 * La foto de una ficha es la primera imagen Markdown enlazada (data/ingredientes/README.md).
 * Devuelve la ruta absoluta solo si el archivo existe, es una imagen y queda dentro del
 * directorio de datos: una ficha no puede apuntar afuera del repositorio.
 */
export function fotoDeFicha(rutaFicha: string, directorioDatos: string): string | null {
  const enlace = IMAGEN_MARKDOWN.exec(readFileSync(rutaFicha, 'utf8'));
  if (enlace === null) {
    return null;
  }
  const ruta = resolve(dirname(rutaFicha), enlace[1] as string);
  const raiz = resolve(directorioDatos) + sep;
  if (!ruta.startsWith(raiz) || !esImagen(ruta) || !existsSync(ruta)) {
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

/** Lee todos los JSON de recetas. Un JSON con otro esquema se ignora con aviso, no corta el build. */
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

/** `/fotos/ingredientes/brocoli-entero.jpg`: la extensión sale del archivo de origen. */
export function urlDeFoto(prefijo: string, id: string, origen: string): string {
  return `/fotos/${prefijo}/${id}${extname(origen).toLowerCase()}`;
}

function resumenDe(r: RecetaJson): VersionResumen {
  return {
    numero: r.version.numero,
    clave: r.version.clave,
    titulo: r.version.titulo,
    resumen: r.version.resumen,
    icono: r.version.icono,
    tiempo_total_s: r.tiempo_total_s,
    tiempo_total_texto: r.tiempo_total_texto,
  };
}

/**
 * Lee data/ y arma el plan completo de lo que va al bundle. Las mismas respuestas que
 * antes daba la API, pero calculadas una vez en el build en vez de en cada petición.
 */
export function planificar(directorioDatos: string, avisar: (mensaje: string) => void): Plan {
  const dirRecetas = join(directorioDatos, 'recetas');
  const recetas = leerRecetas(dirRecetas, avisar);
  const fotosIngredientes = indexarFotos(join(directorioDatos, 'ingredientes'), true, directorioDatos);
  const fotosUtensilios = indexarFotos(join(directorioDatos, 'utencillos'), false, directorioDatos);

  // Origen absoluto de la foto de cada plato, solo si la declara y está en disco.
  const fotosRecetas = new Map<string, string>();
  for (const r of recetas) {
    if (r.fuentes.foto === undefined || fotosRecetas.has(r.plato)) {
      continue;
    }
    const ruta = join(dirRecetas, r.plato, r.fuentes.foto);
    if (esImagen(ruta) && existsSync(ruta)) {
      fotosRecetas.set(r.plato, ruta);
    }
  }

  const url = (fotos: Map<string, string>, prefijo: string, id: string | null): string | null => {
    const origen = id === null ? undefined : fotos.get(id);
    return origen === undefined ? null : urlDeFoto(prefijo, id as string, origen);
  };

  const conFotos = <T extends { readonly id: string | null }>(lista: readonly T[], fotos: Map<string, string>, prefijo: string) =>
    lista.map((x) => ({ ...x, foto: url(fotos, prefijo, x.id) }));

  const porPlato = new Map<string, RecetaJson[]>();
  for (const r of recetas) {
    porPlato.set(r.plato, [...(porPlato.get(r.plato) ?? []), r]);
  }

  const resumen: RecetaResumen[] = [...porPlato.entries()].map(([plato, versiones]) => {
    const primera = versiones[0] as RecetaJson;
    return {
      plato,
      nombre: primera.nombre,
      momento: primera.momento,
      porciones: primera.porciones,
      nutricion: primera.nutricion,
      foto: url(fotosRecetas, 'recetas', plato),
      versiones: versiones.map(resumenDe).sort((a, b) => a.numero - b.numero),
    };
  });

  const json: ArchivoJson[] = [{ ruta: 'recetas.json', contenido: resumen }];
  for (const r of recetas) {
    const servida: RecetaServida = {
      ...r,
      foto: url(fotosRecetas, 'recetas', r.plato),
      ingredientes: conFotos(r.ingredientes, fotosIngredientes, 'ingredientes'),
      utensilios: conFotos(r.utensilios, fotosUtensilios, 'utensilios'),
    };
    // Por clave y por número: la API aceptaba las dos formas y la app usa la clave.
    json.push({ ruta: `recetas/${r.plato}/${r.version.clave}.json`, contenido: servida });
    json.push({ ruta: `recetas/${r.plato}/${String(r.version.numero)}.json`, contenido: servida });
  }

  // Solo se copian las fotos que alguna receta referencia. El servicio servía cualquier
  // ficha del catálogo bajo demanda; el bundle se baja entero al celular, así que una
  // foto de un ingrediente que ninguna receta usa es peso que nadie va a mirar.
  const fotos = new Map<string, ArchivoCopiado>();
  const copiar = (prefijo: string, indice: Map<string, string>, id: string | null): void => {
    const origen = id === null ? undefined : indice.get(id);
    if (origen !== undefined) {
      const ruta = urlDeFoto(prefijo, id as string, origen).slice(1);
      fotos.set(ruta, { ruta, origen });
    }
  };
  for (const r of recetas) {
    copiar('recetas', fotosRecetas, r.plato);
    for (const i of r.ingredientes) {
      copiar('ingredientes', fotosIngredientes, i.id);
    }
    for (const u of r.utensilios) {
      copiar('utensilios', fotosUtensilios, u.id);
    }
  }

  return { json, fotos: [...fotos.values()] };
}
