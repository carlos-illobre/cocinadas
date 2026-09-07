export type Pestana = 'recetas' | 'historial' | 'perfil';

export interface PropiedadesBarra {
  readonly activa: Pestana;
  readonly alElegir: (pestana: Pestana) => void;
}

/** Los mismos íconos del prototipo de Figma. */
const PESTANAS: readonly { readonly valor: Pestana; readonly nombre: string; readonly icono: string }[] = [
  { valor: 'recetas', nombre: 'Recetas', icono: '\u{1F3E0}' },
  { valor: 'historial', nombre: 'Progreso', icono: '\u{1F4CA}' },
  { valor: 'perfil', nombre: 'Perfil', icono: '\u{1F464}' },
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
          <span className="tabbar-icono" aria-hidden="true">
            {p.icono}
          </span>
          {p.nombre}
        </button>
      ))}
    </nav>
  );
}
