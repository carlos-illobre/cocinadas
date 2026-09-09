import { describe, expect, it } from 'vitest';
import type { Almacen } from './historial/almacen';
import { CLAVE_SILENCIO, guardarSilencio, leerSilencio } from './silencio';

function memoria(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

describe('silencio', () => {
  it('sin nada guardado, o con basura, los sonidos están prendidos', () => {
    expect(leerSilencio(memoria())).toBe(false);
    expect(leerSilencio(memoria({ [CLAVE_SILENCIO]: 'cualquier cosa' }))).toBe(false);
  });

  it('se guarda y se lee', () => {
    const almacen = memoria();
    guardarSilencio(almacen, true);
    expect(leerSilencio(almacen)).toBe(true);
    guardarSilencio(almacen, false);
    expect(leerSilencio(almacen)).toBe(false);
  });
});
