import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  type ArchivoJson,
  type RecetaResumen,
  type RecetaServida,
  esFicha,
  esImagen,
  fotoDeFicha,
  indexarFotos,
  leerRecetas,
  planificar,
  urlDeFoto,
} from './catalogo';

function recetaJson(plato: string, numero: number, clave: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    esquema: 1,
    plato,
    version: { numero, clave, titulo: `Versión ${numero}`, resumen: 'r', icono: numero === 1 ? '⚡' : '🎯' },
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

  // Un plato sin foto en sus fuentes, y un JSON de otro esquema.
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
  // Enlaza algo que existe pero no es una imagen: no se copia al bundle.
  writeFileSync(join(frescos, 'no-imagen.md'), '# Ficha\n\n![pdf](../fotos-envases/manual.pdf)\n');
  writeFileSync(join(fotos, 'README.md'), '');
  writeFileSync(join(fotos, 'brocoli.jpg'), 'jpg');
  writeFileSync(join(fotos, 'manual.pdf'), 'pdf');

  const utensilios = join(raiz, 'utencillos');
  mkdirSync(join(utensilios, 'fotos'), { recursive: true });
  writeFileSync(join(utensilios, 'README.md'), '');
  writeFileSync(join(utensilios, 'wok-30cm.md'), '# Wok\n\n![Wok](fotos/wok-30cm-frente.PNG)\n');
  writeFileSync(join(utensilios, 'fotos', 'wok-30cm-frente.PNG'), 'png');
  // Una ficha dentro de fotos/ no cuenta: los utensilios no se recorren en recursivo.
  writeFileSync(join(utensilios, 'fotos', 'perdida.md'), '![p](wok-30cm-frente.PNG)');
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

describe('esImagen', () => {
  it.each(['a.jpg', 'a.jpeg', 'a.png', 'a.webp', 'a.PNG'])('%s es una imagen', (nombre) => {
    expect(esImagen(nombre)).toBe(true);
  });

  it.each(['a.pdf', 'a.md', 'a'])('%s no es una imagen', (nombre) => {
    expect(esImagen(nombre)).toBe(false);
  });
});

describe('urlDeFoto', () => {
  it('lleva la extensión del archivo de origen, en minúscula', () => {
    expect(urlDeFoto('ingredientes', 'brocoli-entero', '/x/y/brocoli.WEBP')).toBe('/fotos/ingredientes/brocoli-entero.webp');
  });
});

/**
 * Las versiones chicas que `pnpm optimizar` habría dejado en `web/assets/`: la misma ruta
 * relativa que el original, con extensión `.webp`. Es lo que se publica.
 */
function armarAssets(datos: string, assets: string): void {
  for (const relativo of [
    'recetas/pasta-brocoli/pasta-brocoli.webp',
    'ingredientes/fotos-envases/brocoli.webp',
    'utencillos/fotos/wok-30cm-frente.webp',
    'ingredientes-grandes/fotos-envases/brocoli.webp',
    'utencillos-grandes/fotos/wok-30cm-frente.webp',
  ]) {
    mkdirSync(join(assets, dirname(relativo)), { recursive: true });
    writeFileSync(join(assets, relativo), 'webp');
  }
}

describe('sobre un directorio de datos', () => {
  let raiz: string;
  let assets: string;
  let avisos: string[];

  beforeEach(() => {
    raiz = mkdtempSync(join(tmpdir(), 'catalogo-'));
    assets = mkdtempSync(join(tmpdir(), 'assets-'));
    armarDatos(raiz);
    armarAssets(raiz, assets);
    avisos = [];
  });

  afterEach(() => {
    rmSync(raiz, { recursive: true, force: true });
    rmSync(assets, { recursive: true, force: true });
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

    it('devuelve null si lo enlazado existe pero no es una imagen', () => {
      expect(fotoDeFicha(join(raiz, 'ingredientes', 'frescos', 'no-imagen.md'), raiz)).toBeNull();
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

  describe('planificar', () => {
    const json = (plan: { json: readonly ArchivoJson[] }, ruta: string): unknown =>
      plan.json.find((a) => a.ruta === ruta)?.contenido;

    it('escribe recetas.json con un resumen por plato y las versiones ordenadas por número', () => {
      const plan = planificar(raiz, assets, (m) => avisos.push(m));
      const lista = json(plan, 'recetas.json') as readonly RecetaResumen[];
      // El orden es el del disco: readdirSync devuelve las carpetas alfabéticamente.
      expect(lista.map((r) => r.plato)).toEqual(['otro-plato', 'pasta-brocoli', 'zeta-sin-archivo']);
      const pasta = lista.find((r) => r.plato === 'pasta-brocoli');
      expect(pasta).toMatchObject({
        nombre: 'Plato pasta-brocoli',
        momento: 'cena',
        porciones: 1,
        nutricion: { kcal: 700 },
        foto: '/fotos/recetas/pasta-brocoli.webp',
      });
      expect(pasta?.versiones.map((v) => [v.numero, v.clave, v.icono, v.tiempo_total_s, v.tiempo_total_texto])).toEqual([
        [1, 'linea-de-tiempo', '⚡', 600, '10 min'],
        [2, 'dos-etapas', '🎯', 1200, '20 min'],
      ]);
    });

    it('deja sin foto al plato que no la declara y al que la declara pero no está en disco', () => {
      const plan = planificar(raiz, assets, () => undefined);
      const lista = json(plan, 'recetas.json') as readonly RecetaResumen[];
      expect(lista.find((r) => r.plato === 'otro-plato')?.foto).toBeNull();
      expect(lista.find((r) => r.plato === 'zeta-sin-archivo')?.foto).toBeNull();
      expect((json(plan, 'recetas/zeta-sin-archivo/linea-de-tiempo.json') as RecetaServida).foto).toBeNull();
    });

    it('escribe cada versión por clave y por número, con las fotos resueltas', () => {
      const plan = planificar(raiz, assets, () => undefined);
      for (const ruta of ['recetas/pasta-brocoli/dos-etapas.json', 'recetas/pasta-brocoli/2.json']) {
        const receta = json(plan, ruta) as RecetaServida;
        expect(receta.version.numero).toBe(2);
        expect(receta.foto).toBe('/fotos/recetas/pasta-brocoli.webp');
        expect(receta.ingredientes.map((i) => [i.id, i.foto, i.foto_grande])).toEqual([
          ['brocoli-entero', '/fotos/ingredientes/brocoli-entero.webp', '/fotos/ingredientes-grandes/brocoli-entero.webp'],
          ['sin-foto', null, null],
          [null, null, null],
        ]);
        expect(receta.utensilios.map((u) => [u.id, u.foto, u.foto_grande])).toEqual([
          ['wok-30cm', '/fotos/utensilios/wok-30cm.webp', '/fotos/utensilios-grandes/wok-30cm.webp'],
          [null, null, null],
        ]);
      }
    });

    it('copia solo las fotos que alguna receta referencia, una sola vez cada una', () => {
      const plan = planificar(raiz, assets, () => undefined);
      expect(plan.fotos.map((f) => f.ruta).sort()).toEqual([
        'fotos/ingredientes-grandes/brocoli-entero.webp',
        'fotos/ingredientes/brocoli-entero.webp',
        'fotos/recetas/pasta-brocoli.webp',
        'fotos/utensilios-grandes/wok-30cm.webp',
        'fotos/utensilios/wok-30cm.webp',
      ]);
      // Lo que se copia sale de assets, no de data: es la versión chica.
      expect(plan.fotos.find((f) => f.ruta === 'fotos/utensilios/wok-30cm.webp')?.origen).toBe(
        resolve(assets, 'utencillos', 'fotos', 'wok-30cm-frente.webp'),
      );
      expect(plan.faltantes).toEqual([]);
    });

    it('avisa qué versión chica falta en vez de publicar la receta sin foto', () => {
      rmSync(join(assets, 'utencillos', 'fotos', 'wok-30cm-frente.webp'));
      const plan = planificar(raiz, assets, () => undefined);

      expect(plan.faltantes).toEqual([join('utencillos', 'fotos', 'wok-30cm-frente.webp')]);
      // Y no se copia: lo que falta no se publica a medias.
      expect(plan.fotos.map((f) => f.ruta)).not.toContain('fotos/utensilios/wok-30cm.webp');
    });
  });
});
