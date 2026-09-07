import { useState } from 'react';
import { cantidadLegible } from '../cantidad';
import { FotoAmpliable } from '../componentes/FotoAmpliable';
import { BASE_CATALOGO, urlFoto, type Receta } from '../api';

export interface PropiedadesMiseEnPlace {
  readonly receta: Receta;
  readonly alVolver: () => void;
  readonly alCocinar: () => void;
}

/**
 * La mise en place: cabecera oscura con el progreso, una lista de
 * utensilios y otra de ingredientes para tildar, y el botón de cocinar fijo al pie, que
 * se habilita recién con todo tildado. La receta es un POE: empezar sin el zester en la
 * mano es como se pierde el tiempo crítico.
 */
export function MiseEnPlace({ receta, alVolver, alCocinar }: PropiedadesMiseEnPlace): React.JSX.Element {
  const [tildados, setTildados] = useState<ReadonlySet<string>>(new Set());
  const utensilios: readonly Item[] = receta.utensilios.map((u, i) => ({ clave: `u-${i}`, nombre: u.nombre, detalle: null, foto: u.foto, fotoGrande: u.foto_grande, icono: '🔧' }));
  const ingredientes: readonly Item[] = receta.ingredientes.map((x, i) => ({ clave: `i-${i}`, nombre: x.nombre, detalle: cantidadLegible(x.cantidad), foto: x.foto, fotoGrande: x.foto_grande, icono: '🥄' }));
  const total = utensilios.length + ingredientes.length;
  const hechos = tildados.size;
  const alternarTodos = (): void => {
    setTildados(hechos < total ? new Set([...utensilios, ...ingredientes].map((x) => x.clave)) : new Set());
  };
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
      </header>

      {/* La barra va fuera del <header> y fija arriba: un `sticky` solo se pega mientras su
          padre está a la vista, y la cabecera se va con el scroll. */}
      <div className="fijo">
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
      </div>

      <div className="cuerpo">
        <Lista titulo="Utensilios" icono="🔧" items={utensilios} tildados={tildados} alternar={alternar} />
        <Lista titulo="Ingredientes" icono="🥕" items={ingredientes} tildados={tildados} alternar={alternar} />
      </div>

      <div className="cta-fija">
        {/* Un toque marca todo; con todo marcado, otro lo desmarca. */}
        <button type="button" className="enlace marcar-todos" onClick={alternarTodos}>
          {completo ? 'Desmarcar todos' : 'Marcá todos los items para continuar'}
        </button>
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
  readonly fotoGrande: string | null;
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
            <li key={x.clave} className={hecho ? 'mise-item ok' : 'mise-item'}>
              {/* La foto va al costado del botón de tildar y no adentro: es un botón ella
                  también (se amplía al tocarla), y un botón no puede contener otro. */}
              {x.foto === null ? (
                <span className="mise-foto mise-sin-foto" aria-hidden="true">
                  {x.icono}
                </span>
              ) : (
                <FotoAmpliable src={`${BASE_CATALOGO}${x.foto}`} srcGrande={urlFoto(x.fotoGrande)} nombre={x.nombre} className="mise-foto" />
              )}
              <button type="button" className={hecho ? 'mise ok' : 'mise'} aria-pressed={hecho} onClick={() => alternar(x.clave)}>
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
