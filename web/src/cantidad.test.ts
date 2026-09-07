import { describe, expect, it } from 'vitest';
import { cantidadLegible, fraccionesLegibles } from './cantidad';

describe('fraccionesLegibles', () => {
  it.each([
    ['½ pieza', '1/2 pieza'],
    ['1½ cda', '1 1/2 cda'],
    ['125 g (½ bandeja)', '125 g (1/2 bandeja)'],
    ['¼ cdta', '1/4 cdta'],
    ['100 g', '100 g'],
  ])('%s → %s', (entrada, salida) => {
    expect(fraccionesLegibles(entrada)).toBe(salida);
  });
});

describe('cantidadLegible', () => {
  it.each([
    ['½ cdta', '1/2 cucharadita (2,5 ml)'],
    ['¼ cdta', '1/4 cucharadita (1,25 ml)'],
    ['1 cdta (5 g)', '1 cucharadita (5 g)'],
    ['2 cdta', '2 cucharaditas (10 ml)'],
    ['1½ cda (22 ml)', '1 1/2 cucharadas (22 ml)'],
    ['1 cda', '1 cucharada (15 ml)'],
    ['½ unidad', '1/2 unidad'],
    ['0,8 L', '0,8 L'],
    ['5 g (1 cm)', '5 g (1 cm)'],
  ])('%s → %s', (entrada, salida) => {
    expect(cantidadLegible(entrada)).toBe(salida);
  });
});
