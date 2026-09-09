import { afterEach, describe, expect, it, vi } from 'vitest';
import { conTransicion } from './transicion';

describe('conTransicion', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'startViewTransition');
  });

  it('sin la API, el cambio es directo', () => {
    const cambio = vi.fn();
    conTransicion(cambio);
    expect(cambio).toHaveBeenCalledTimes(1);
  });

  it('con la API, el cambio corre dentro de la transición', () => {
    const cambio = vi.fn();
    const startViewTransition = vi.fn((f: () => void) => {
      f();
    });
    Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true });
    conTransicion(cambio);
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(cambio).toHaveBeenCalledTimes(1);
  });
});
