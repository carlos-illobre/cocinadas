import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cargarCatalogo,
  contarFichas,
  contarRecetas,
  esFicha,
  fotoDeFicha,
  indexarFotos,
  inventariar,
  leerRecetas,
} from '../src/catalogo.js';

function recetaJson(plato: string, numero: number, clave: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    esquema: 1,
    plato,
    version: { numero, clave, titulo: `Versión ${numero}`, resumen: 'r' },
    nombre: `Plato ${plato}`,
    momento: 'cena',
    porciones: 1,
    tiempo_total_s: 600 * numero,
    tiempo_total_texto: `${10 * numero} min`,
    nutricion: { kcal: 700 },
    fuentes: { html: 'x.html', pdf: 'x.pdf', foto: `${plato}.jpg` },
    ingredientes: [
      { id: 'brocoli-entero', nombre: 'Brócoli' },
      { id: 'sin-foto', nombre: 'Algo sin foto' },
      { id: null, nombre: 'Agua' },
    ],
    utensilios: [
      { id: 'wok-30cm', nombre: 'Wok' },
      { id: null, nombre: 'Bol' },
    ],
    ...extra,
  });
}

/** Arma un directorio de datos con la misma forma que data/ en el repositorio. */
function armarDatos(raiz: string): void {
  const plato = join(raiz, 'recetas', 'pasta-brocoli');
  mkdirSync(plato, { recursive: true });
  writeFileSync(join(raiz, 'recetas', 'README.md'), '');
  writeFileSync(join(raiz, 'recetas', 'validar.py'), '');
  // Nombres que se leen en orden inverso al número: el orden de las versiones lo pone el sort, no el disco.
  writeFileSync(join(plato, 'a-dos-etapas.json'), recetaJson('pasta-brocoli', 2, 'dos-etapas'));
  writeFileSync(join(plato, 'b-linea-de-tiempo.json'), recetaJson('pasta-brocoli', 1, 'linea-de-tiempo'));
  writeFileSync(join(plato, 'pasta-brocoli-v1-linea-de-tiempo.html'), '');
  writeFileSync(join(plato, 'pasta-brocoli.jpg'), 'jpg');

  // Un plato sin foto en disco aunque el JSON la declare, y un JSON de otro esquema.
  const otro = join(raiz, 'recetas', 'otro-plato');
  mkdirSync(otro);
  writeFileSync(join(otro, 'otro-plato-v1-linea-de-tiempo.json'), recetaJson('otro-plato', 1, 'linea-de-tiempo', { fuentes: { html: 'x.html', pdf: 'x.pdf' } }));
  writeFileSync(join(otro, 'otro-plato-v9-raro.json'), recetaJson('otro-plato', 9, 'raro', { esquema: 2 }));
  // Un JSON cuyo plato no coincide con la carpeta.
  writeFileSync(join(otro, 'ajeno.json'), recetaJson('pasta-brocoli', 3, 'ajeno'));
  // Un plato que declara foto pero el archivo no está en disco.
  const zeta = join(raiz, 'recetas', 'zeta-sin-archivo');
  mkdirSync(zeta);
  writeFileSync(join(zeta, 'zeta-sin-archivo-v1-linea-de-tiempo.json'), recetaJson('zeta-sin-archivo', 1, 'linea-de-tiempo'));

  const frescos = join(raiz, 'ingredientes', 'frescos');
  const fotos = join(raiz, 'ingredientes', 'fotos-envases');
  mkdirSync(frescos, { recursive: true });
  mkdirSync(fotos, { recursive: true });
  writeFileSync(join(raiz, 'ingredientes', 'README.md'), '');
  writeFileSync(join(raiz, 'ingredientes', 'indice-ingredientes.md'), '');
  writeFileSync(join(raiz, 'ingredientes', 'plantilla-ingrediente.md'), '![x](fotos-envases/brocoli.jpg)');
  writeFileSync(join(frescos, 'brocoli-entero.md'), '# Brócoli\n\n![Brócoli](../fotos-envases/brocoli.jpg)\n');
  writeFileSync(join(frescos, 'limon-entero.md'), '# Limón\n\nSin foto todavía.\n');
  writeFileSync(join(frescos, 'sin-foto.md'), '# Algo\n\n![rota](../fotos-envases/no-existe.jpg)\n');
  writeFileSync(join(frescos, 'fuera.md'), '# Fuera\n\n![afuera](../../../../etc/passwd)\n');
  writeFileSync(join(fotos, 'README.md'), '');
  writeFileSync(join(fotos, 'brocoli.jpg'), 'jpg');

  const utensilios = join(raiz, 'utencillos');
  mkdirSync(join(utensilios, 'fotos'), { recursive: true });
  writeFileSync(join(utensilios, 'README.md'), '');
  writeFileSync(join(utensilios, 'wok-30cm.md'), '# Wok\n\n![Wok](fotos/wok-30cm-frente.jpg)\n');
  writeFileSync(join(utensilios, 'fotos', 'wok-30cm-frente.jpg'), 'jpg');
  // Una ficha dentro de fotos/ no cuenta: los utensilios no se recorren en recursivo.
  writeFileSync(join(utensilios, 'fotos', 'perdida.md'), '![p](wok-30cm-frente.jpg)');
}

describe('esFicha', () => {
  it.each(['brocoli-entero.md', 'wok-30cm.md'])('%s es una ficha', (nombre) => {
    expect(esFicha(nombre)).toBe(true);
  });

  it.each(['README.md', 'plantilla-ingrediente.md', 'indice-ingredientes.md', 'foto.jpg', 'notas.txt'])(
    '%s no es una ficha',
    (nombre) => {
      expect(esFicha(nombre)).toBe(false);
    },
  );
});

describe('sobre un directorio de datos', () => {
  let raiz: string;
  let avisos: string[];

  beforeEach(() => {
    raiz = mkdtempSync(join(tmpdir(), 'catalogo-'));
    armarDatos(raiz);
    avisos = [];
  });

  afterEach(() => {
    rmSync(raiz, { recursive: true, force: true });
  });

  describe('inventario', () => {
    it('cuenta solo los .json dentro de las carpetas de plato', () => {
      expect(contarRecetas(join(raiz, 'recetas'))).toBe(6);
    });

    it('cuenta las fichas de ingredientes en todas las categorías, sin README, índice ni plantilla', () => {
      expect(contarFichas(join(raiz, 'ingredientes'), true)).toBe(4);
    });

    it('cuenta las fichas de utensilios solo en la raíz de su carpeta', () => {
      expect(contarFichas(join(raiz, 'utencillos'), false)).toBe(1);
    });

    it('arma el inventario completo', () => {
      expect(inventariar(raiz)).toEqual({ recetas: 6, ingredientes: 4, utensilios: 1 });
    });
  });

  describe('fotoDeFicha', () => {
    it('resuelve la primera imagen enlazada, relativa a la ficha', () => {
      expect(fotoDeFicha(join(raiz, 'ingredientes', 'frescos', 'brocoli-entero.md'), raiz)).toBe(
        resolve(raiz, 'ingredientes', 'fotos-envases', 'brocoli.jpg'),
      );
    });

    it('devuelve null si la ficha no enlaza ninguna imagen', () => {
      expect(fotoDeFicha(join(raiz, 'ingredientes', 'frescos', 'limon-entero.md'), raiz)).toBeNull();
    });

    it('devuelve null si el archivo enlazado no existe', () => {
      expect(fotoDeFicha(join(raiz, 'ingredientes', 'frescos', 'sin-foto.md'), raiz)).toBeNull();
    });

    it('devuelve null si el enlace sale del directorio de datos', () => {
      expect(fotoDeFicha(join(raiz, 'ingredientes', 'frescos', 'fuera.md'), raiz)).toBeNull();
    });
  });

  describe('indexarFotos', () => {
    it('indexa por id solo las fichas con foto válida', () => {
      const fotos = indexarFotos(join(raiz, 'ingredientes'), true, raiz);
      expect([...fotos.keys()]).toEqual(['brocoli-entero']);
    });

    it('en los utensilios no baja a subcarpetas', () => {
      const fotos = indexarFotos(join(raiz, 'utencillos'), false, raiz);
      expect([...fotos.keys()]).toEqual(['wok-30cm']);
    });
  });

  describe('leerRecetas', () => {
    it('lee los JSON válidos y avisa por los que ignora, sin cortar', () => {
      const recetas = leerRecetas(join(raiz, 'recetas'), (m) => avisos.push(m));
      expect(recetas.map((r) => `${r.plato}/${r.version.clave}`).sort()).toEqual([
        'otro-plato/linea-de-tiempo',
        'pasta-brocoli/dos-etapas',
        'pasta-brocoli/linea-de-tiempo',
        'zeta-sin-archivo/linea-de-tiempo',
      ]);
      expect(avisos).toHaveLength(2);
      expect(avisos[0]).toContain('ajeno.json');
      expect(avisos[0]).toContain('plato pasta-brocoli');
      expect(avisos[1]).toContain('otro-plato-v9-raro.json');
      expect(avisos[1]).toContain('esquema 2');
    });
  });

  describe('cargarCatalogo', () => {
    it('lista un resumen por plato con sus versiones ordenadas por número', () => {
      const catalogo = cargarCatalogo(raiz, (m) => avisos.push(m));
      const lista = catalogo.recetas();
      expect(lista.map((r) => r.plato)).toEqual(['otro-plato', 'pasta-brocoli', 'zeta-sin-archivo']);
      const pasta = lista[1];
      expect(pasta).toMatchObject({
        nombre: 'Plato pasta-brocoli',
        momento: 'cena',
        porciones: 1,
        nutricion: { kcal: 700 },
        foto: '/recetas/pasta-brocoli/foto',
      });
      expect(pasta?.versiones.map((v) => [v.numero, v.clave, v.tiempo_total_s, v.tiempo_total_texto])).toEqual([
        [1, 'linea-de-tiempo', 600, '10 min'],
        [2, 'dos-etapas', 1200, '20 min'],
      ]);
    });

    it('marca sin foto al plato que no declara foto en sus fuentes', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.recetas()[0]?.foto).toBeNull();
      expect(catalogo.fotoReceta('otro-plato')).toBeNull();
      expect(catalogo.fotoReceta('inexistente')).toBeNull();
    });

    it('marca sin foto al plato que la declara pero no la tiene en disco', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.recetas()[2]?.foto).toBeNull();
      expect(catalogo.fotoReceta('zeta-sin-archivo')).toBeNull();
      expect(catalogo.receta('zeta-sin-archivo', '1')?.foto).toBeNull();
    });

    it('devuelve la ruta absoluta de la foto de un plato que la tiene', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.fotoReceta('pasta-brocoli')).toBe(join(raiz, 'recetas', 'pasta-brocoli', 'pasta-brocoli.jpg'));
    });

    it.each(['dos-etapas', '2'])('sirve la receta por clave o número (%s) con las fotos resueltas', (version) => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      const receta = catalogo.receta('pasta-brocoli', version);
      expect(receta).not.toBeNull();
      expect(receta?.version.numero).toBe(2);
      expect(receta?.foto).toBe('/recetas/pasta-brocoli/foto');
      expect(receta?.ingredientes.map((i) => [i.id, i.foto])).toEqual([
        ['brocoli-entero', '/ingredientes/brocoli-entero/foto'],
        ['sin-foto', null],
        [null, null],
      ]);
      expect(receta?.utensilios.map((u) => [u.id, u.foto])).toEqual([
        ['wok-30cm', '/utensilios/wok-30cm/foto'],
        [null, null],
      ]);
    });

    it('la receta de un plato sin foto en disco viene con foto null', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.receta('otro-plato', '1')?.foto).toBeNull();
    });

    it('devuelve null si el plato o la versión no existen', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.receta('pasta-brocoli', '3')).toBeNull();
      expect(catalogo.receta('nada', 'dos-etapas')).toBeNull();
    });

    it('resuelve las fotos de ingredientes y utensilios por id', () => {
      const catalogo = cargarCatalogo(raiz, () => undefined);
      expect(catalogo.fotoIngrediente('brocoli-entero')).toBe(resolve(raiz, 'ingredientes', 'fotos-envases', 'brocoli.jpg'));
      expect(catalogo.fotoIngrediente('limon-entero')).toBeNull();
      // Cada índice recorre solo su carpeta: un utensilio no es un ingrediente ni al revés.
      expect(catalogo.fotoIngrediente('wok-30cm')).toBeNull();
      expect(catalogo.fotoUtensilio('brocoli-entero')).toBeNull();
      expect(catalogo.fotoUtensilio('perdida')).toBeNull();
      expect(catalogo.fotoUtensilio('wok-30cm')).toBe(resolve(raiz, 'utencillos', 'fotos', 'wok-30cm-frente.jpg'));
      expect(catalogo.fotoUtensilio('cuchara')).toBeNull();
    });
  });
});
