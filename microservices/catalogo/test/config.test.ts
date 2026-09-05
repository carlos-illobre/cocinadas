import { describe, expect, it } from 'vitest';
import { leerConfig, obligatoria, puertoDesde } from '../src/config.js';

const completo = {
  PUERTO: '3001',
  LOG_LEVEL: 'info',
  NATS_URL: 'nats://nats:4222',
  DIRECTORIO_DATOS: '/datos',
};

describe('obligatoria', () => {
  it('devuelve el valor cuando está', () => {
    expect(obligatoria({ X: 'a' }, 'X')).toBe('a');
  });

  it('corta si la variable está ausente, nombrándola', () => {
    expect(() => obligatoria({}, 'X')).toThrow('falta X en el entorno');
  });

  it('corta también si está declarada pero vacía', () => {
    expect(() => obligatoria({ X: '' }, 'X')).toThrow('falta X en el entorno');
  });
});

describe('puertoDesde', () => {
  it('acepta un puerto válido', () => {
    expect(puertoDesde('3001')).toBe(3001);
  });

  // Los bordes exactos: sin estas dos, un `< 1` que se convierta en `<= 1` (o el `>`
  // del otro extremo) sobrevive al mutation testing.
  it.each(['1', '65535'])('acepta el borde %s', (valor) => {
    expect(puertoDesde(valor)).toBe(Number(valor));
  });

  it.each(['abc', '0', '65536', '3.5', '-1'])('rechaza %s', (valor) => {
    expect(() => puertoDesde(valor)).toThrow(`PUERTO inválido: ${valor}`);
  });
});

describe('leerConfig', () => {
  it('arma la configuración completa', () => {
    expect(leerConfig(completo)).toEqual({
      puerto: 3001,
      logLevel: 'info',
      natsUrl: 'nats://nats:4222',
      directorioDatos: '/datos',
    });
  });

  it.each(Object.keys(completo))('falla si falta %s', (nombre) => {
    const entorno: Record<string, string | undefined> = { ...completo };
    delete entorno[nombre];
    expect(() => leerConfig(entorno)).toThrow(`falta ${nombre} en el entorno`);
  });
});
