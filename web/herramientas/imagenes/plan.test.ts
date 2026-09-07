import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANCHOS, buscarImagenes, chicaDe, destinoDe, esImagen, FUENTES, planificarImagenes } from './plan';

describe('esImagen', () => {
  it.each(['a.jpg', 'a.jpeg', 'a.png', 'a.webp', 'a.PNG'])('%s se puede convertir', (n) => {
    expect(esImagen(n)).toBe(true);
  });

  // Los .svg de inicio-capas son el mismo PNG en base64: convertirlos sería trabajo doble.
  it.each(['a.svg', 'a.pdf', 'a.md', 'a'])('%s no', (n) => {
    expect(esImagen(n)).toBe(false);
  });
});

describe('destinoDe', () => {
  const ingredientes = FUENTES.find((f) => f.directorio === 'data/ingredientes') as (typeof FUENTES)[number];
  const inicio = FUENTES.find((f) => f.directorio === 'docs/mockups/inicio-capas') as (typeof FUENTES)[number];

  it('espeja la ruta bajo data/ y cambia la extensión', () => {
    expect(destinoDe('data/ingredientes/fotos-envases/brocoli.jpg', ingredientes)).toBe('web/assets/ingredientes/fotos-envases/brocoli.webp');
  });

  it('aplana docs/mockups/inicio-capas en assets/inicio', () => {
    expect(destinoDe('docs/mockups/inicio-capas/2.png', inicio)).toBe('web/assets/inicio/2.webp');
  });

  it('renombra la capa que pasó por quitar-fondo para que la app la pida por su número', () => {
    expect(destinoDe('docs/mockups/inicio-capas/11-sin-fondo.png', inicio)).toBe('web/assets/inicio/11.webp');
  });
});

describe('chicaDe', () => {
  it('cambia el prefijo de datos por el de assets y la extensión por webp', () => {
    expect(chicaDe(join('/r', 'data', 'utencillos', 'fotos', 'wok.PNG'), join('/r', 'data'), join('/r', 'web', 'assets'))).toBe(
      join('/r', 'web', 'assets', 'utencillos', 'fotos', 'wok.webp'),
    );
  });
});

describe('sobre un árbol de originales', () => {
  let raiz: string;

  beforeEach(() => {
    raiz = mkdtempSync(join(tmpdir(), 'imagenes-'));
    const escribir = (relativo: string) => {
      mkdirSync(join(raiz, relativo, '..'), { recursive: true });
      writeFileSync(join(raiz, relativo), 'x');
    };
    mkdirSync(join(raiz, 'data/ingredientes/fotos-envases'), { recursive: true });
    mkdirSync(join(raiz, 'data/utencillos/fotos'), { recursive: true });
    mkdirSync(join(raiz, 'data/recetas/pasta'), { recursive: true });
    mkdirSync(join(raiz, 'docs/mockups/inicio-capas'), { recursive: true });
    escribir('data/ingredientes/fotos-envases/brocoli.jpg');
    escribir('data/ingredientes/README.md');
    escribir('data/utencillos/fotos/wok.png');
    escribir('data/recetas/pasta/pasta.jpg');
    escribir('data/recetas/pasta/pasta.json');
    escribir('docs/mockups/inicio-capas/1.png');
    escribir('docs/mockups/inicio-capas/1.svg');
    escribir('docs/mockups/inicio-capas/11.png');
    escribir('docs/mockups/inicio-capas/11-sin-fondo.png');
    escribir('docs/mockups/inicio-capas/composicion-original.jpg');
  });

  afterEach(() => {
    rmSync(raiz, { recursive: true, force: true });
  });

  it('encuentra solo imágenes, bajando a las subcarpetas', () => {
    expect(buscarImagenes(raiz, 'data/ingredientes')).toEqual(['data/ingredientes/fotos-envases/brocoli.jpg']);
  });

  it('devuelve vacío si el directorio no existe, en vez de romper', () => {
    expect(buscarImagenes(raiz, 'data/no-existe')).toEqual([]);
  });

  it('planifica cada origen con el ancho de su uso', () => {
    const plan = planificarImagenes(raiz);
    const porDestino = new Map(plan.map((i) => [i.destino, i]));

    expect(porDestino.get('web/assets/recetas/pasta/pasta.webp')?.ancho).toBe(ANCHOS.plato);
    expect(porDestino.get('web/assets/ingredientes/fotos-envases/brocoli.webp')?.ancho).toBe(ANCHOS.miniatura);
    expect(porDestino.get('web/assets/utencillos/fotos/wok.webp')?.ancho).toBe(ANCHOS.miniatura);
    expect(porDestino.get('web/assets/inicio/1.webp')?.ancho).toBe(ANCHOS.escena);
  });

  it('deja afuera la capa 11 con fondo y la composición de referencia, y se queda con la recortada', () => {
    const destinos = planificarImagenes(raiz).map((i) => i.destino);

    expect(destinos).toContain('web/assets/inicio/11.webp');
    expect(destinos).not.toContain('web/assets/inicio/composicion-original.webp');
    // La 11 con fondo blanco y la ya recortada darían el mismo destino: solo va una.
    expect(destinos.filter((d) => d === 'web/assets/inicio/11.webp')).toHaveLength(1);
  });
});
