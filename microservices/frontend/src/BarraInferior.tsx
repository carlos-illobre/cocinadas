export type Pestana = 'recetas' | 'historial' | 'ajustes';

export interface PropiedadesBarra {
  readonly activa: Pestana;
  readonly alElegir: (pestana: Pestana) => void;
}

const PESTANAS: readonly { readonly valor: Pestana; readonly nombre: string; readonly icono: React.JSX.Element }[] = [
  {
    valor: 'recetas',
    nombre: 'Recetas',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
        <path d="M4 19a2 2 0 0 0 2 2h14" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
  },
  {
    valor: 'historial',
    nombre: 'Progreso',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
      </svg>
    ),
  },
  {
    valor: 'ajustes',
    nombre: 'Ajustes',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

/**
 * La barra de pestañas del pie, siempre al alcance del pulgar. No aparece mientras se
 * cocina ni en la alarma: ahí la pantalla es una sola cosa.
 */
export function BarraInferior({ activa, alElegir }: PropiedadesBarra): React.JSX.Element {
  return (
    <nav className="tabbar" aria-label="Secciones">
      {PESTANAS.map((p) => (
        <button key={p.valor} type="button" className={p.valor === activa ? 'on' : ''} aria-current={p.valor === activa ? 'page' : undefined} onClick={() => alElegir(p.valor)}>
          {p.icono}
          {p.nombre}
        </button>
      ))}
    </nav>
  );
}
