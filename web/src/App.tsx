import { useEffect, useRef, useState } from 'react';
import { versionesOrdenadas, type Fetch, type Receta, type RecetaResumen } from './api';
import { BarraInferior, type Pestana } from './BarraInferior';
import { borrarEnCurso, recetaEnCurso } from './cocina/enCurso';
import { avisadorDelNavegador, SIN_AVISADOR, type Avisador } from './cocina/sonido';
import { Cocina } from './Cocina';
import { almacenSeguro, guardarCocinada, listarCocinadas, type Almacen, type Cocinada } from './historial/almacen';
import { Historial } from './Historial';
import { Inicio } from './Inicio';
import { MiseEnPlace } from './MiseEnPlace';
import { Perfil } from './Perfil';
import { Portada } from './Portada';
import { Recetas } from './Recetas';
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
  | { readonly nombre: 'perfil' };

const fetchNavegador: Fetch = (url) => fetch(url);

/** La pila sin su última pantalla; con una sola no se toca, porque no hay a dónde volver. */
function sinLaUltima(pila: readonly Pantalla[]): readonly Pantalla[] {
  return pila.length > 1 ? pila.slice(0, -1) : pila;
}
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
  // Si quedó una cocinada a medio hacer, se vuelve directo a la cocina. Es lo que pasa
  // cuando el teléfono descarta la pestaña o alguien recarga sin querer.
  const [pila, setPila] = useState<readonly Pantalla[]>(() => {
    const receta = recetaEnCurso(almacen, ahora === undefined ? Date.now() : ahora());
    return receta === null ? [{ nombre: 'inicio' }] : [{ nombre: 'inicio' }, { nombre: 'cocina', receta }];
  });
  const pantalla = pila[pila.length - 1] as Pantalla;
  // El botón de atrás del teléfono dispara `popstate`; sin la pila, la app no tendría a
  // dónde volver y el navegador se iría del sitio.
  const volviendoSolo = useRef(false);
  // El navegador solo deja sonar después de un gesto: el avisador se crea al tocar
  // «Empezar» en la pantalla de inicio, y de ahí en más se reutiliza.
  const [avisador, setAvisador] = useState<Avisador>(SIN_AVISADOR);
  const [cocinadas, setCocinadas] = useState<readonly Cocinada[]>(() => listarCocinadas(almacen));
  const [tema, setTema] = useState<Tema>(() => leerTema(almacen));

  useEffect(() => {
    aplicarTema(document.documentElement, tema);
  }, [tema]);

  // Atrás del teléfono: se descarta la pantalla de arriba de la pila. Cuando ya no queda
  // ninguna, no se hace nada y el navegador se va del sitio, que es lo esperable.
  useEffect(() => {
    const atrasDelTelefono = () => {
      if (volviendoSolo.current) {
        volviendoSolo.current = false;
        return;
      }
      setPila((prev) => {
        // Salir de la cocina con el botón de atrás es salir: la cocinada a medio hacer se
        // descarta igual que con «‹ Volver», para no retomarla sin querer más tarde.
        if (prev.length > 1 && (prev[prev.length - 1] as Pantalla).nombre === 'cocina') {
          borrarEnCurso(almacen);
        }
        return sinLaUltima(prev);
      });
    };
    window.addEventListener('popstate', atrasDelTelefono);
    return () => window.removeEventListener('popstate', atrasDelTelefono);
  }, [almacen]);

  // El navegador solo deja sonar después de un gesto. Al retomar una cocinada no se pasa
  // por «Entrar», así que el avisador se crea con el primer toque, sea el que sea: sin
  // esto, una cocinada retomada se queda sin alarmas.
  useEffect(() => {
    if (avisador !== SIN_AVISADOR) {
      return undefined;
    }
    const crear = () => setAvisador(crearAvisador());
    document.addEventListener('pointerdown', crear, { once: true });
    return () => document.removeEventListener('pointerdown', crear);
  }, [avisador, crearAvisador]);

  const cambiarTema = () => {
    const otro = elOtro(tema);
    guardarTema(almacen, otro);
    setTema(otro);
  };

  const experiencia = experienciaDe(cocinadas);

  /** Ir a una pantalla nueva: se apila y se agrega una entrada al historial. */
  const avanzar = (p: Pantalla) => {
    window.history.pushState(null, '');
    setPila((prev) => [...prev, p]);
  };

  /** Volver: se desapila acá y se consume la entrada del historial sin reaccionar a ella. */
  const atras = () => {
    volviendoSolo.current = true;
    setPila(sinLaUltima);
    window.history.back();
  };

  /** Cambiar algo de la pantalla actual sin apilar otra (elegir el modo de preparación). */
  const reemplazar = (p: Pantalla) => setPila((prev) => [...prev.slice(0, -1), p]);

  const irA = (pestana: Pestana) => avanzar({ nombre: pestana });

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
            avanzar({ nombre: 'recetas' });
          }}
        />
      );
    case 'recetas':
      return conBarra('recetas', <Recetas fetchImpl={fetchImpl} xp={experiencia} alElegir={(resumen) => avanzar({ nombre: 'portada', resumen, version: versionPorOmision(resumen) })} />);
    case 'portada':
      return (
        <Portada
          fetchImpl={fetchImpl}
          resumen={pantalla.resumen}
          version={pantalla.version}
          alCambiarVersion={(version) => reemplazar({ ...pantalla, version })}
          alVolver={atras}
          alEmpezar={(receta) => avanzar({ nombre: 'mise', receta })}
        />
      );
    case 'mise':
      return <MiseEnPlace receta={pantalla.receta} alVolver={atras} alCocinar={() => avanzar({ nombre: 'cocina', receta: pantalla.receta })} />;
    case 'cocina':
      return (
        <Cocina
          receta={pantalla.receta}
          avisador={avisador}
          {...(ahora === undefined ? {} : { ahora })}
          alVolver={atras}
          alTerminar={() => avanzar({ nombre: 'historial' })}
          cocinadas={cocinadas}
          almacen={almacen}
          alGuardar={(cocinada) => setCocinadas(guardarCocinada(almacen, { ...cocinada, id: nuevoId() }))}
        />
      );
    case 'historial':
      return conBarra('historial', <Historial cocinadas={cocinadas} />);
    case 'perfil':
      return conBarra('perfil', <Perfil cocinadas={cocinadas} xp={experiencia} tema={tema} alCambiarTema={cambiarTema} version={VERSION_APP} />);
  }
}

/** La versión más lenta es la que la receta recomienda para cocinar con calma. */
export function versionPorOmision(resumen: RecetaResumen): string {
  const primera = versionesOrdenadas(resumen)[0];
  return primera === undefined ? '1' : primera.clave;
}
