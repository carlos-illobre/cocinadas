/**
 * Avisos sonoros y vibración. El navegador solo deja sonar después de un gesto del
 * usuario: el contexto de audio se crea al tocar «Empezar», no antes.
 *
 * Se inyectan el constructor de AudioContext y la función de vibrar para poder probar
 * la lógica sin navegador; en producción se usan los del `window`.
 */
export interface Oscilador {
  frequency: { value: number };
  type: string;
  connect(destino: unknown): void;
  start(cuando?: number): void;
  stop(cuando?: number): void;
}

export interface Ganancia {
  gain: { value: number };
  connect(destino: unknown): void;
}

export interface ContextoAudio {
  readonly currentTime: number;
  readonly destination: unknown;
  readonly state: string;
  createOscillator(): Oscilador;
  createGain(): Ganancia;
  resume(): Promise<void>;
}

export interface Avisador {
  /** Un «tin» corto: un proceso no crítico venció, o un paso llegó a su tiempo. */
  suave(): void;
  /** Tres notas insistentes, para repetir mientras la alarma esté en pantalla. */
  fuerte(): void;
}

export const SIN_AVISADOR: Avisador = { suave: () => undefined, fuerte: () => undefined };

function nota(ctx: ContextoAudio, frecuencia: number, desde_s: number, duracion_s: number, volumen: number): void {
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frecuencia;
  gan.gain.value = volumen;
  osc.connect(gan);
  gan.connect(ctx.destination);
  osc.start(ctx.currentTime + desde_s);
  osc.stop(ctx.currentTime + desde_s + duracion_s);
}

/**
 * Crea el avisador. Si el navegador no tiene AudioContext (o falla al crearlo), devuelve
 * uno mudo: la app sigue funcionando con las alertas visuales y la vibración.
 */
export function crearAvisador(
  Contexto: (new () => ContextoAudio) | undefined,
  vibrar: ((patron: number | readonly number[]) => unknown) | undefined,
): Avisador {
  if (Contexto === undefined) {
    return {
      suave: () => vibrar?.(120),
      fuerte: () => vibrar?.([300, 120, 300, 120, 300]),
    };
  }
  const ctx = new Contexto();
  const despertar = (): void => {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
  };
  return {
    suave() {
      despertar();
      nota(ctx, 880, 0, 0.15, 0.25);
      vibrar?.(120);
    },
    fuerte() {
      despertar();
      nota(ctx, 988, 0, 0.18, 0.5);
      nota(ctx, 1319, 0.22, 0.18, 0.5);
      nota(ctx, 988, 0.44, 0.3, 0.5);
      vibrar?.([300, 120, 300, 120, 300]);
    },
  };
}

/** El avisador del navegador real. Excluido de la cobertura: solo lee `window`. */
export function avisadorDelNavegador(): Avisador {
  const w = window as unknown as { AudioContext?: new () => ContextoAudio; webkitAudioContext?: new () => ContextoAudio };
  const vibrar = typeof navigator.vibrate === 'function' ? (p: number | readonly number[]) => navigator.vibrate(p as number | number[]) : undefined;
  try {
    return crearAvisador(w.AudioContext ?? w.webkitAudioContext, vibrar);
  } catch {
    return crearAvisador(undefined, vibrar);
  }
}
