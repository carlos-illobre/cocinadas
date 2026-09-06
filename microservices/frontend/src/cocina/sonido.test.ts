import { describe, expect, it, vi } from 'vitest';
import { avisadorDelNavegador, crearAvisador, SIN_AVISADOR, type ContextoAudio, type Ganancia, type Oscilador } from './sonido';

interface Grabado {
  readonly frecuencia: number;
  readonly desde: number;
  readonly hasta: number;
  readonly volumen: number;
}

function contextoFalso(estado = 'running'): { Contexto: new () => ContextoAudio; notas: Grabado[]; resumidos: () => number } {
  const notas: Grabado[] = [];
  let resumidos = 0;
  class Falso implements ContextoAudio {
    readonly currentTime = 10;
    readonly destination = { nombre: 'parlante' };
    readonly state = estado;
    createOscillator(): Oscilador {
      const o = { frequency: { value: 0 }, type: '', conectado: null as unknown, start: (c?: number) => { o.desde = c ?? 0; }, stop: (c?: number) => {
        notas.push({ frecuencia: o.frequency.value, desde: o.desde, hasta: c ?? 0, volumen: (o.conectado as Ganancia).gain.value });
      }, connect: (d: unknown) => { o.conectado = d; }, desde: 0 };
      return o;
    }
    createGain(): Ganancia {
      return { gain: { value: 0 }, connect: () => undefined };
    }
    resume(): Promise<void> {
      resumidos += 1;
      return Promise.resolve();
    }
  }
  return { Contexto: Falso, notas, resumidos: () => resumidos };
}

describe('crearAvisador', () => {
  it('sin AudioContext, solo vibra', () => {
    const vibrar = vi.fn();
    const a = crearAvisador(undefined, vibrar);
    a.suave();
    a.fuerte();
    expect(vibrar).toHaveBeenNthCalledWith(1, 120);
    expect(vibrar).toHaveBeenNthCalledWith(2, [300, 120, 300, 120, 300]);
  });

  it('sin AudioContext ni vibración, no rompe', () => {
    const a = crearAvisador(undefined, undefined);
    expect(() => {
      a.suave();
      a.fuerte();
    }).not.toThrow();
  });

  it('el aviso suave es una nota corta de 880 Hz y una vibración', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).suave();
    expect(notas).toEqual([{ frecuencia: 880, desde: 10, hasta: 10.15, volumen: 0.25 }]);
    expect(vibrar).toHaveBeenCalledWith(120);
  });

  it('el aviso fuerte son tres notas seguidas y una vibración larga', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).fuerte();
    expect(notas.map((n) => [n.frecuencia, Number(n.desde.toFixed(2)), Number(n.hasta.toFixed(2))])).toEqual([
      [988, 10, 10.18],
      [1319, 10.22, 10.4],
      [988, 10.44, 10.74],
    ]);
    expect(notas.every((n) => n.volumen === 0.5)).toBe(true);
    expect(vibrar).toHaveBeenCalledWith([300, 120, 300, 120, 300]);
  });

  it('con audio pero sin vibración, suena igual', () => {
    const { Contexto, notas } = contextoFalso();
    const a = crearAvisador(Contexto, undefined);
    a.suave();
    a.fuerte();
    expect(notas).toHaveLength(4);
  });

  it('despierta el contexto si el navegador lo dejó suspendido', () => {
    const suspendido = contextoFalso('suspended');
    const a = crearAvisador(suspendido.Contexto, undefined);
    a.suave();
    a.fuerte();
    expect(suspendido.resumidos()).toBe(2);

    const activo = contextoFalso('running');
    crearAvisador(activo.Contexto, undefined).suave();
    expect(activo.resumidos()).toBe(0);
  });

  it('el avisador mudo no hace nada', () => {
    expect(() => {
      SIN_AVISADOR.suave();
      SIN_AVISADOR.fuerte();
    }).not.toThrow();
  });
});

describe('avisadorDelNavegador', () => {
  const w = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown };

  it('sin AudioContext ni vibrate en el navegador, devuelve uno que no rompe', () => {
    delete w.AudioContext;
    delete w.webkitAudioContext;
    const a = avisadorDelNavegador();
    expect(() => {
      a.suave();
      a.fuerte();
    }).not.toThrow();
  });

  it('usa el AudioContext del navegador y la vibración si existen', () => {
    const { Contexto, notas } = contextoFalso();
    w.AudioContext = Contexto;
    const vibrar = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrar, configurable: true });
    try {
      avisadorDelNavegador().suave();
      expect(notas).toHaveLength(1);
      expect(vibrar).toHaveBeenCalledWith(120);
    } finally {
      delete w.AudioContext;
      Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true });
    }
  });

  it('acepta el AudioContext con prefijo de Safari viejo', () => {
    const { Contexto, notas } = contextoFalso();
    w.webkitAudioContext = Contexto;
    try {
      avisadorDelNavegador().suave();
      expect(notas).toHaveLength(1);
    } finally {
      delete w.webkitAudioContext;
    }
  });

  it('si crear el contexto falla, cae al avisador mudo con vibración', () => {
    class Rompe {
      constructor() {
        throw new Error('sin audio');
      }
    }
    w.AudioContext = Rompe;
    try {
      expect(() => avisadorDelNavegador().fuerte()).not.toThrow();
    } finally {
      delete w.AudioContext;
    }
  });
});
