import { useEffect, useState } from 'react';
import type { Receta, RecetaResumen } from './api';
import { Inicio } from './Inicio';
import { Portada } from './Portada';
import { Recetas } from './Recetas';
import { consultarTodos, type EstadoServicio, type Fetch } from './salud';
import './estilos.css';

export interface PropiedadesApp {
  /** Inyectable para las pruebas; por omisión, el fetch del navegador. */
  readonly fetchImpl?: Fetch;
}

export type Pantalla =
  | { readonly nombre: 'inicio' }
  | { readonly nombre: 'recetas' }
  | { readonly nombre: 'portada'; readonly resumen: RecetaResumen; readonly version: string }
  | { readonly nombre: 'cocina'; readonly receta: Receta }
  | { readonly nombre: 'servicios' };

const fetchNavegador: Fetch = (url) => fetch(url);

/**
 * El recorrido: inicio → recetas → portada (con la versión elegida) → cocina. Sin
 * enrutador: son cuatro pantallas y el estado de navegación cabe en un objeto. Cuando haga
 * falta compartir un enlace a una receta, se agrega el enrutador y este objeto se mapea a
 * la URL.
 */
export function App({ fetchImpl = fetchNavegador }: PropiedadesApp): React.JSX.Element {
  const [pantalla, setPantalla] = useState<Pantalla>({ nombre: 'inicio' });

  switch (pantalla.nombre) {
    case 'inicio':
      return <Inicio alEmpezar={() => setPantalla({ nombre: 'recetas' })} />;
    case 'recetas':
      return (
        <Recetas
          fetchImpl={fetchImpl}
          alElegir={(resumen) => setPantalla({ nombre: 'portada', resumen, version: versionPorOmision(resumen) })}
          alVerEstado={() => setPantalla({ nombre: 'servicios' })}
        />
      );
    case 'portada':
      return (
        <Portada
          fetchImpl={fetchImpl}
          resumen={pantalla.resumen}
          version={pantalla.version}
          alCambiarVersion={(version) => setPantalla({ ...pantalla, version })}
          alVolver={() => setPantalla({ nombre: 'recetas' })}
          alEmpezar={(receta) => setPantalla({ nombre: 'cocina', receta })}
        />
      );
    case 'cocina':
      return <Cocina receta={pantalla.receta} alVolver={() => setPantalla({ nombre: 'portada', resumen: pantalla.receta, version: pantalla.receta.version.clave })} />;
    case 'servicios':
      return <Servicios fetchImpl={fetchImpl} alVolver={() => setPantalla({ nombre: 'recetas' })} />;
  }
}

/** La versión con más etapas es la que la receta recomienda para cocinar con calma: la última. */
export function versionPorOmision(resumen: RecetaResumen): string {
  const ultima = resumen.versiones[resumen.versiones.length - 1];
  return ultima === undefined ? '1' : ultima.clave;
}

/**
 * La pantalla de cocina (cronómetros, carriles paralelos, alarmas) es el próximo cambio.
 * Hasta entonces, esta pantalla dice qué receta y versión se eligió y deja volver.
 */
export function Cocina({ receta, alVolver }: { readonly receta: Receta; readonly alVolver: () => void }): React.JSX.Element {
  return (
    <main className="pantalla">
      <button type="button" className="enlace volver" onClick={alVolver}>
        ‹ Portada
      </button>
      <p className="eyebrow">Cocina · en construcción</p>
      <h1>{receta.nombre}</h1>
      <p className="lead">
        Versión {receta.version.numero} · {receta.version.titulo} · {receta.tiempo_total_texto}.
      </p>
      <p className="lead">La pantalla de cocina, con los cronómetros por paso y las alarmas, es el próximo cambio.</p>
    </main>
  );
}

export function Servicios({ fetchImpl = fetchNavegador, alVolver }: PropiedadesApp & { readonly alVolver?: () => void }): React.JSX.Element {
  const [estados, setEstados] = useState<readonly EstadoServicio[] | null>(null);

  useEffect(() => {
    let vigente = true;
    void consultarTodos(fetchImpl).then((resultado) => {
      if (vigente) {
        setEstados(resultado);
      }
    });
    return () => {
      vigente = false;
    };
  }, [fetchImpl]);

  return (
    <main className="pantalla">
      {alVolver !== undefined && (
        <button type="button" className="enlace volver" onClick={alVolver}>
          ‹ Recetas
        </button>
      )}
      <img className="logo" src="/logo.png" alt="" width="240" height="90" />
      <p className="eyebrow">Cero desperdicio · sin sal · 1 porción</p>
      <h1>Templa</h1>
      <p className="lead">La receta como línea de tiempo viva.</p>

      <section aria-labelledby="titulo-servicios">
        <h2 id="titulo-servicios" className="eyebrow">
          Servicios
        </h2>
        {estados === null ? (
          <p role="status">Consultando…</p>
        ) : (
          <ul className="servicios">
            {estados.map((e) => (
              <li key={e.servicio} className={e.estado === 'ok' ? 'ok' : 'caido'}>
                <span className="nombre">{e.servicio}</span>
                <span className="detalle">{e.estado === 'ok' ? `v${e.version}` : e.detalle}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
