import { useEffect, useState } from 'react';
import { Ajustes } from './Ajustes';
import { versionesOrdenadas, type Receta, type RecetaResumen } from './api';
import { BarraInferior, type Pestana } from './BarraInferior';
import { avisadorDelNavegador, SIN_AVISADOR, type Avisador } from './cocina/sonido';
import { Cocina } from './Cocina';
import { almacenSeguro, guardarCocinada, listarCocinadas, type Almacen, type Cocinada } from './historial/almacen';
import { Historial } from './Historial';
import { Inicio } from './Inicio';
import { MiseEnPlace } from './MiseEnPlace';
import { Portada } from './Portada';
import { Recetas } from './Recetas';
import { consultarTodos, type EstadoServicio, type Fetch } from './salud';
import { aplicarTema, elOtro, guardarTema, leerTema, type Tema } from './tema';
import { experienciaDe } from './xp';
import './estilos.css';

export interface PropiedadesApp {
  /** Inyectable para las pruebas; por omisión, el fetch del navegador. */
  readonly fetchImpl?: Fetch;
  /** Inyectable para las pruebas; por omisión, el audio y la vibración del navegador. */
  readonly crearAvisador?: () => Avisador;
  /** Reloj inyectable para la cocina. */
  readonly ahora?: () => number;
  /** Dónde se guardan el tema y las cocinadas; por omisión, el localStorage del navegador. */
  readonly almacen?: Almacen;
  /** Genera el id de una cocinada; por omisión, un UUID del navegador. */
  readonly nuevoId?: () => string;
}

export type Pantalla =
  | { readonly nombre: 'inicio' }
  | { readonly nombre: 'recetas' }
  | { readonly nombre: 'portada'; readonly resumen: RecetaResumen; readonly version: string }
  | { readonly nombre: 'mise'; readonly receta: Receta }
  | { readonly nombre: 'cocina'; readonly receta: Receta }
  | { readonly nombre: 'historial' }
  | { readonly nombre: 'ajustes' }
  | { readonly nombre: 'servicios' };

const fetchNavegador: Fetch = (url) => fetch(url);
const VERSION_APP = '0.3.0';

function almacenDelNavegador(): Almacen {
  try {
    return almacenSeguro(globalThis.localStorage);
  } catch {
    return almacenSeguro(undefined);
  }
}

/**
 * El recorrido: inicio → recetas → portada → mise en place → cocina → resumen, más las
 * pestañas de progreso y ajustes. Sin enrutador: el estado de navegación cabe en un
 * objeto. Cuando haga falta compartir un enlace a una receta, se agrega el enrutador y
 * este objeto se mapea a la URL.
 */
export function App({ fetchImpl = fetchNavegador, crearAvisador = avisadorDelNavegador, ahora, almacen = almacenDelNavegador(), nuevoId = () => crypto.randomUUID() }: PropiedadesApp): React.JSX.Element {
  const [pantalla, setPantalla] = useState<Pantalla>({ nombre: 'inicio' });
  // El navegador solo deja sonar después de un gesto: el avisador se crea al tocar
  // «Empezar» en la pantalla de inicio, y de ahí en más se reutiliza.
  const [avisador, setAvisador] = useState<Avisador>(SIN_AVISADOR);
  const [cocinadas, setCocinadas] = useState<readonly Cocinada[]>(() => listarCocinadas(almacen));
  const [tema, setTema] = useState<Tema>(() => leerTema(almacen));

  useEffect(() => {
    aplicarTema(document.documentElement, tema);
  }, [tema]);

  const cambiarTema = () => {
    const otro = elOtro(tema);
    guardarTema(almacen, otro);
    setTema(otro);
  };

  const irA = (pestana: Pestana) => setPantalla({ nombre: pestana });

  const conBarra = (activa: Pestana, contenido: React.JSX.Element) => (
    <>
      {contenido}
      <BarraInferior activa={activa} alElegir={irA} />
    </>
  );

  switch (pantalla.nombre) {
    case 'inicio':
      return (
        <Inicio
          alEntrar={() => {
            setAvisador(crearAvisador());
            setPantalla({ nombre: 'recetas' });
          }}
        />
      );
    case 'recetas':
      return conBarra('recetas', <Recetas fetchImpl={fetchImpl} xp={experienciaDe(cocinadas)} alElegir={(resumen) => setPantalla({ nombre: 'portada', resumen, version: versionPorOmision(resumen) })} />);
    case 'portada':
      return (
        <Portada
          fetchImpl={fetchImpl}
          resumen={pantalla.resumen}
          version={pantalla.version}
          alCambiarVersion={(version) => setPantalla({ ...pantalla, version })}
          alVolver={() => setPantalla({ nombre: 'recetas' })}
          alEmpezar={(receta) => setPantalla({ nombre: 'mise', receta })}
        />
      );
    case 'mise':
      return <MiseEnPlace receta={pantalla.receta} alVolver={() => setPantalla(portadaDe(pantalla.receta))} alCocinar={() => setPantalla({ nombre: 'cocina', receta: pantalla.receta })} />;
    case 'cocina':
      return (
        <Cocina
          receta={pantalla.receta}
          avisador={avisador}
          {...(ahora === undefined ? {} : { ahora })}
          alVolver={() => setPantalla(portadaDe(pantalla.receta))}
          alTerminar={() => setPantalla({ nombre: 'historial' })}
          alGuardar={(cocinada) => setCocinadas(guardarCocinada(almacen, { ...cocinada, id: nuevoId() }))}
        />
      );
    case 'historial':
      return conBarra('historial', <Historial cocinadas={cocinadas} />);
    case 'ajustes':
      return conBarra('ajustes', <Ajustes tema={tema} alCambiarTema={cambiarTema} alVerEstado={() => setPantalla({ nombre: 'servicios' })} cocinadasGuardadas={cocinadas.length} version={VERSION_APP} />);
    case 'servicios':
      return <Servicios fetchImpl={fetchImpl} alVolver={() => setPantalla({ nombre: 'ajustes' })} />;
  }
}

function portadaDe(receta: Receta): Pantalla {
  return { nombre: 'portada', resumen: receta, version: receta.version.clave };
}

/** La versión más lenta es la que la receta recomienda para cocinar con calma. */
export function versionPorOmision(resumen: RecetaResumen): string {
  const primera = versionesOrdenadas(resumen)[0];
  return primera === undefined ? '1' : primera.clave;
}

export function Servicios({ fetchImpl = fetchNavegador, alVolver }: { readonly fetchImpl?: Fetch; readonly alVolver?: () => void }): React.JSX.Element {
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
    <main className="pantalla servicios-pantalla">
      <header className="cabecera">
        {alVolver !== undefined && (
          <button type="button" className="enlace volver" onClick={alVolver}>
            ‹ Ajustes
          </button>
        )}
        <img className="logo" src="/logo.png" alt="" width="240" height="90" />
        <p className="saludo">Cero desperdicio · sin sal · 1 porción</p>
        <h1>Templa</h1>
      </header>

      <div className="cuerpo">
        <section aria-labelledby="titulo-servicios">
          <h3 id="titulo-servicios" className="titulo-seccion">
            Servicios
          </h3>
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
      </div>
    </main>
  );
}
