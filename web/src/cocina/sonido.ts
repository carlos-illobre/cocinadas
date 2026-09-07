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

interface Nota {
  readonly frecuencia: number;
  readonly desde_s: number;
  readonly duracion_s: number;
  readonly volumen: number;
  readonly tipo: string;
}

interface Aviso {
  readonly notas: readonly Nota[];
  readonly vibracion: number | readonly number[] | null;
}

/** Cada aviso son sus notas y su vibración; el resto es tocarlas. */
const AVISOS: Readonly<Record<keyof Avisador, Aviso>> = {
  toque: { notas: [{ frecuencia: 660, desde_s: 0, duracion_s: 0.07, volumen: 0.18, tipo: 'sine' }], vibracion: null },
  suave: {
    notas: [
      { frecuencia: 880, desde_s: 0, duracion_s: 0.12, volumen: 0.3, tipo: 'sine' },
      { frecuencia: 1175, desde_s: 0.13, duracion_s: 0.16, volumen: 0.3, tipo: 'sine' },
    ],
    vibracion: 120,
  },
  // Dos tonos que se alternan, como un despertador: se oyen sobre el ruido de la cocina.
  fuerte: {
    notas: [988, 1319, 988, 1319].map((frecuencia, i) => ({ frecuencia, desde_s: i * 0.2, duracion_s: 0.16, volumen: 0.55, tipo: 'triangle' })),
    vibracion: [300, 120, 300, 120, 300],
  },
  // Do, mi, sol, do: sube y cierra arriba, que es como suena un festejo.
  festejo: {
    notas: [523, 659, 784, 1047].map((frecuencia, i) => ({ frecuencia, desde_s: i * 0.11, duracion_s: i === 3 ? 0.5 : 0.14, volumen: 0.35, tipo: 'sine' })),
    vibracion: [80, 60, 80, 60, 200],
  },
};

/**
 * Crea el avisador. Si el navegador no tiene AudioContext (o falla al crearlo), queda
 * uno mudo: la app sigue funcionando con las alertas visuales y la vibración.
 */
export function crearAvisador(
  Contexto: (new () => ContextoAudio) | undefined,
  vibrar: ((patron: number | readonly number[]) => unknown) | undefined,
): Avisador {
  const ctx = Contexto === undefined ? null : new Contexto();
  const tocar = ({ notas, vibracion }: Aviso): void => {
    if (ctx !== null) {
      // El contexto arranca suspendido hasta un gesto; se reanuda al primer aviso.
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      notas.forEach((n) => nota(ctx, n.frecuencia, n.desde_s, n.duracion_s, n.volumen, n.tipo));
    }
    if (vibracion !== null) {
      vibrar?.(vibracion);
    }
  };
  return {
    toque: () => tocar(AVISOS.toque),
    suave: () => tocar(AVISOS.suave),
    fuerte: () => tocar(AVISOS.fuerte),
    festejo: () => tocar(AVISOS.festejo),
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
