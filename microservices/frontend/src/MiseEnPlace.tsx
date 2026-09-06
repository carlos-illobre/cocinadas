import { useState } from 'react';
import { BASE_CATALOGO, type Receta } from './api';

export interface PropiedadesMiseEnPlace {
  readonly receta: Receta;
  readonly alVolver: () => void;
  readonly alCocinar: () => void;
}

/**
 * La mise en place del prototipo de Figma: cabecera oscura con el progreso, una lista de
 * utensilios y otra de ingredientes para tildar, y el botón de cocinar fijo al pie, que
 * se habilita recién con todo tildado. La receta es un POE: empezar sin el zester en la
 * mano es como se pierde el tiempo crítico.
 */
export function MiseEnPlace({ receta, alVolver, alCocinar }: PropiedadesMiseEnPlace): React.JSX.Element {
  const [tildados, setTildados] = useState<ReadonlySet<string>>(new Set());
  const utensilios: readonly Item[] = receta.utensilios.map((u, i) => ({ clave: `u-${i}`, nombre: u.nombre, detalle: null, foto: u.foto, icono: '🔧' }));
  const ingredientes: readonly Item[] = receta.ingredientes.map((x, i) => ({ clave: `i-${i}`, nombre: x.nombre, detalle: x.cantidad, foto: x.foto, icono: '🥄' }));
  const total = utensilios.length + ingredientes.length;
  const hechos = tildados.size;
  const porcentaje = total === 0 ? 0 : Math.round((hechos / total) * 100);
  const completo = total > 0 && hechos === total;

  const alternar = (clave: string): void =>
    setTildados((t) => {
      const n = new Set(t);
      if (n.has(clave)) n.delete(clave);
      else n.add(clave);
      return n;
    });

  return (
    <main className="pantalla mise-en-place">
      <header className="cabecera">
        <button type="button" className="enlace volver" onClick={alVolver}>
          ‹ Volver
        </button>
        <h1>Mise en place</h1>
        <p className="saludo">Verificá que tenés todo antes de empezar</p>
        <div className={completo ? 'mise-progreso completo' : 'mise-progreso'} role="progressbar" aria-label="Preparado" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hechos}>
          <div className="xp-fila">
            <span className="xp-nivel">
              {hechos} de {total} items
            </span>
            <span className="mise-porcentaje">{porcentaje}%</span>
          </div>
          <div className="barra">
            <i style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </header>

      <div className="cuerpo">
        <Lista titulo="Utensilios" icono="🔧" items={utensilios} tildados={tildados} alternar={alternar} />
        <Lista titulo="Ingredientes" icono="🥕" items={ingredientes} tildados={tildados} alternar={alternar} />
      </div>

      <div className="cta-fija">
        {!completo && <p className="hint">Marcá todos los items para continuar</p>}
        <button type="button" className={completo ? 'btn verde' : 'btn primary'} disabled={!completo} onClick={alCocinar}>
          {completo ? 'Todo listo → Cocinar' : `Faltan ${total - hechos} items`}
        </button>
      </div>
    </main>
  );
}

interface Item {
  readonly clave: string;
  readonly nombre: string;
  /** La cantidad, en los ingredientes; null en los utensilios. */
  readonly detalle: string | null;
  readonly foto: string | null;
  /** Lo que se muestra cuando no hay foto. */
  readonly icono: string;
}

function Lista({ titulo, icono, items, tildados, alternar }: { readonly titulo: string; readonly icono: string; readonly items: readonly Item[]; readonly tildados: ReadonlySet<string>; readonly alternar: (clave: string) => void }): React.JSX.Element {
  return (
    <section aria-labelledby={`titulo-${titulo}`}>
      <h3 id={`titulo-${titulo}`} className="titulo-seccion">
        <span aria-hidden="true">{icono}</span> {titulo}
      </h3>
      <ul className="lista-mise">
        {items.map((x) => {
          const hecho = tildados.has(x.clave);
          return (
            <li key={x.clave}>
              <button type="button" className={hecho ? 'mise ok' : 'mise'} aria-pressed={hecho} onClick={() => alternar(x.clave)}>
                {x.foto === null ? (
                  <span className="mise-foto mise-sin-foto" aria-hidden="true">
                    {x.icono}
                  </span>
                ) : (
                  <img className="mise-foto" src={`${BASE_CATALOGO}${x.foto}`} alt="" />
                )}
                <span className="mise-texto">
                  <b>{x.nombre}</b>
                  {x.detalle !== null && <small>{x.detalle}</small>}
                </span>
                <span className="circulo" aria-hidden="true">
                  {hecho ? '✓' : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
