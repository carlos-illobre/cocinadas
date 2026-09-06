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
  gain: {
    setValueAtTime(valor: number, cuando: number): void;
    linearRampToValueAtTime(valor: number, cuando: number): void;
  };
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
  /** Un toque seco al dar un paso por hecho: confirma sin interrumpir. */
  toque(): void;
  /** Un «tin» corto: un proceso no crítico venció, o un paso llegó a su tiempo. */
  suave(): void;
  /** Notas insistentes, para repetir mientras la alarma esté en pantalla. */
  fuerte(): void;
  /** Un arpegio corto: el plato está listo. */
  festejo(): void;
}

export const SIN_AVISADOR: Avisador = { toque: () => undefined, suave: () => undefined, fuerte: () => undefined, festejo: () => undefined };

/**
 * Una nota con entrada y salida suaves. Sin esa rampa el oscilador arranca y corta de
 * golpe, y en el parlante del teléfono se escucha un chasquido en vez de un tono.
 */
function nota(ctx: ContextoAudio, frecuencia: number, desde_s: number, duracion_s: number, volumen: number, tipo: string): void {
  const t0 = ctx.currentTime + desde_s;
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  gan.gain.setValueAtTime(0, t0);
  gan.gain.linearRampToValueAtTime(volumen, t0 + 0.012);
  gan.gain.linearRampToValueAtTime(0, t0 + duracion_s);
  osc.connect(gan);
  gan.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duracion_s + 0.02);
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
      toque: () => undefined,
      suave: () => vibrar?.(120),
      fuerte: () => vibrar?.([300, 120, 300, 120, 300]),
      festejo: () => vibrar?.([80, 60, 80, 60, 200]),
    };
  }
  const ctx = new Contexto();
  const despertar = (): void => {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
  };
  return {
    toque() {
      despertar();
      nota(ctx, 660, 0, 0.07, 0.18, 'sine');
    },
    suave() {
      despertar();
      nota(ctx, 880, 0, 0.12, 0.3, 'sine');
      nota(ctx, 1175, 0.13, 0.16, 0.3, 'sine');
      vibrar?.(120);
    },
    fuerte() {
      // Dos tonos que se alternan, como un despertador: se oyen sobre el ruido de la cocina.
      despertar();
      for (let i = 0; i < 4; i += 1) {
        nota(ctx, i % 2 === 0 ? 988 : 1319, i * 0.2, 0.16, 0.55, 'triangle');
      }
      vibrar?.([300, 120, 300, 120, 300]);
    },
    festejo() {
      // Do, mi, sol, do: sube y cierra arriba, que es como suena un festejo.
      despertar();
      [523, 659, 784, 1047].forEach((f, i) => nota(ctx, f, i * 0.11, i === 3 ? 0.5 : 0.14, 0.35, 'sine'));
      vibrar?.([80, 60, 80, 60, 200]);
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
