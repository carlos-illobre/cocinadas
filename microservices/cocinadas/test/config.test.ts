import { describe, expect, it } from 'vitest';
import { LARGO_MINIMO_SECRETO, leerConfig, limiteDesde, obligatoria, puertoDesde, secretoDesde } from '../src/config.js';

const secreto = 'x'.repeat(LARGO_MINIMO_SECRETO);
const completo = {
  PUERTO: '3003',
  LOG_LEVEL: 'info',
  RATE_LIMIT_POR_MINUTO: '120',
  NATS_URL: 'nats://nats:4222',
  DATABASE_URL: 'postgres://u:p@postgres:5432/db',
  JWT_SECRET: secreto,
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
    expect(puertoDesde('3003')).toBe(3003);
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

describe('secretoDesde', () => {
  it('acepta un secreto del largo mínimo', () => {
    expect(secretoDesde(secreto)).toBe(secreto);
  });

  it('rechaza uno más corto, diciendo cuánto tiene y cuánto hace falta', () => {
    const corto = 'x'.repeat(LARGO_MINIMO_SECRETO - 1);
    expect(() => secretoDesde(corto)).toThrow(
      `JWT_SECRET demasiado corto: tiene ${LARGO_MINIMO_SECRETO - 1} caracteres y el mínimo es ${LARGO_MINIMO_SECRETO}`,
    );
  });
});

describe('limiteDesde', () => {
  it('acepta un límite razonable', () => {
    expect(limiteDesde('120')).toBe(120);
  });

  it.each(['0', '-1', '1.5', 'muchas', ''])('corta con %s, que dejaría la API sin protección', (valor) => {
    expect(() => limiteDesde(valor)).toThrow('RATE_LIMIT_POR_MINUTO inválido');
  });

  it('el borde: 1 es válido', () => {
    expect(limiteDesde('1')).toBe(1);
  });
});

describe('leerConfig', () => {
  it('arma la configuración completa', () => {
    expect(leerConfig(completo)).toEqual({
      puerto: 3003,
      logLevel: 'info',
      limitePorMinuto: 120,
      natsUrl: 'nats://nats:4222',
      databaseUrl: 'postgres://u:p@postgres:5432/db',
      jwtSecret: secreto,
    });
  });

  it.each(Object.keys(completo))('falla si falta %s', (nombre) => {
    const entorno: Record<string, string | undefined> = { ...completo };
    delete entorno[nombre];
    expect(() => leerConfig(entorno)).toThrow(`falta ${nombre} en el entorno`);
  });
});
