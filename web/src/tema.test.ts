import { describe, expect, it, vi } from 'vitest';
import type { Almacen } from './historial/almacen';
import { aplicarTema, CLAVE_TEMA, elOtro, esTema, guardarTema, leerTema } from './tema';

function memoria(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

describe('tema', () => {
  it.each(['claro', 'oscuro'])('%s es un tema', (v) => {
    expect(esTema(v)).toBe(true);
  });

  it.each([null, undefined, '', 'sistema', 'azul', 3])('%s no es un tema', (v) => {
    expect(esTema(v)).toBe(false);
  });

  it('lee la preferencia guardada, y claro si no hay o hay basura', () => {
    expect(leerTema(memoria())).toBe('claro');
    expect(leerTema(memoria({ [CLAVE_TEMA]: 'oscuro' }))).toBe('oscuro');
    expect(leerTema(memoria({ [CLAVE_TEMA]: 'violeta' }))).toBe('claro');
  });

  it('guarda la preferencia bajo su clave', () => {
    const a = memoria();
    guardarTema(a, 'oscuro');
    expect(a.datos.get(CLAVE_TEMA)).toBe('oscuro');
  });

  it('el otro tema es el contrario', () => {
    expect(elOtro('claro')).toBe('oscuro');
    expect(elOtro('oscuro')).toBe('claro');
  });

  it('aplica el tema como atributo del documento', () => {
    const setAttribute = vi.fn();
    aplicarTema({ setAttribute }, 'oscuro');
    expect(setAttribute).toHaveBeenCalledWith('data-tema', 'oscuro');
  });
});
