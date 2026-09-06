import { describe, expect, it, vi } from 'vitest';
import { avisadorDelNavegador, crearAvisador, SIN_AVISADOR, type ContextoAudio, type Ganancia, type Oscilador } from './sonido';

interface Grabado {
  readonly frecuencia: number;
  readonly tipo: string;
  readonly desde: number;
  readonly hasta: number;
  readonly volumen: number;
}

interface GananciaFalsa extends Ganancia {
  pico: number;
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
        const g = o.conectado as GananciaFalsa;
        notas.push({ frecuencia: o.frequency.value, tipo: o.type, desde: o.desde, hasta: (c ?? 0) - 0.02, volumen: g.pico });
      }, connect: (d: unknown) => { o.conectado = d; }, desde: 0 };
      return o;
    }
    createGain(): Ganancia {
      const g: GananciaFalsa = {
        pico: 0,
        gain: {
          setValueAtTime: () => undefined,
          linearRampToValueAtTime: (valor: number) => {
            g.pico = Math.max(g.pico, valor);
          },
        },
        connect: () => undefined,
      };
      return g;
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
    a.toque();
    a.suave();
    a.fuerte();
    a.festejo();
    expect(vibrar).toHaveBeenNthCalledWith(1, 120);
    expect(vibrar).toHaveBeenNthCalledWith(2, [300, 120, 300, 120, 300]);
    expect(vibrar).toHaveBeenNthCalledWith(3, [80, 60, 80, 60, 200]);
  });

  it('sin AudioContext ni vibración, no rompe', () => {
    const a = crearAvisador(undefined, undefined);
    expect(() => {
      a.toque();
      a.suave();
      a.fuerte();
      a.festejo();
    }).not.toThrow();
  });

  it('el toque es una nota corta y sola, sin vibrar', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).toque();
    expect(notas.map((n) => [n.frecuencia, n.tipo, Number(n.hasta.toFixed(2)), n.volumen])).toEqual([[660, 'sine', 10.07, 0.18]]);
    expect(vibrar).not.toHaveBeenCalled();
  });

  it('el aviso suave son dos notas que suben y una vibración', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).suave();
    expect(notas.map((n) => [n.frecuencia, Number(n.desde.toFixed(2))])).toEqual([
      [880, 10],
      [1175, 10.13],
    ]);
    expect(notas.every((n) => n.volumen === 0.3)).toBe(true);
    expect(vibrar).toHaveBeenCalledWith(120);
  });

  it('el aviso fuerte alterna dos tonos cuatro veces y vibra largo', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).fuerte();
    expect(notas.map((n) => [n.frecuencia, Number(n.desde.toFixed(2)), n.tipo])).toEqual([
      [988, 10, 'triangle'],
      [1319, 10.2, 'triangle'],
      [988, 10.4, 'triangle'],
      [1319, 10.6, 'triangle'],
    ]);
    expect(notas.every((n) => n.volumen === 0.55)).toBe(true);
    expect(vibrar).toHaveBeenCalledWith([300, 120, 300, 120, 300]);
  });

  it('el festejo es un arpegio que sube y cierra con una nota larga', () => {
    const { Contexto, notas } = contextoFalso();
    const vibrar = vi.fn();
    crearAvisador(Contexto, vibrar).festejo();
    expect(notas.map((n) => [n.frecuencia, Number(n.desde.toFixed(2))])).toEqual([
      [523, 10],
      [659, 10.11],
      [784, 10.22],
      [1047, 10.33],
    ]);
    expect(Number((notas[3] as { hasta: number }).hasta.toFixed(2))).toBe(10.83);
    expect(vibrar).toHaveBeenCalledWith([80, 60, 80, 60, 200]);
  });

  it('con audio pero sin vibración, suena igual', () => {
    const { Contexto, notas } = contextoFalso();
    const a = crearAvisador(Contexto, undefined);
    a.toque();
    a.suave();
    a.fuerte();
    a.festejo();
    expect(notas).toHaveLength(11);
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
      SIN_AVISADOR.toque();
      SIN_AVISADOR.suave();
      SIN_AVISADOR.fuerte();
      SIN_AVISADOR.festejo();
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
      a.toque();
      a.suave();
      a.fuerte();
      a.festejo();
    }).not.toThrow();
  });

  it('usa el AudioContext del navegador y la vibración si existen', () => {
    const { Contexto, notas } = contextoFalso();
    w.AudioContext = Contexto;
    const vibrar = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrar, configurable: true });
    try {
      avisadorDelNavegador().suave();
      expect(notas).toHaveLength(2);
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
      expect(notas).toHaveLength(2);
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
