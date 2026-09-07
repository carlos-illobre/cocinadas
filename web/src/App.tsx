import { versionPorOmision, type Fetch } from './api';
import { BarraInferior, type Pestana } from './componentes/BarraInferior';
import { BotonTema } from './componentes/BotonTema';
import { avisadorDelNavegador, type Avisador } from './cocina/sonido';
import { useAvisador } from './ganchos/useAvisador';
import { usePila } from './ganchos/usePila';
import { useTema } from './ganchos/useTema';
import { almacenSeguro, guardarCocinada, listarCocinadas, type Almacen, type Cocinada } from './historial/almacen';
import { Cocina } from './pantallas/cocina/Cocina';
import { Historial } from './pantallas/Historial';
import { Inicio } from './pantallas/Inicio';
import { MiseEnPlace } from './pantallas/MiseEnPlace';
import { Perfil } from './pantallas/Perfil';
import { Portada } from './pantallas/Portada';
import { Recetas } from './pantallas/Recetas';
import { experienciaDe } from './progreso/xp';
import { useState } from 'react';
import './estilos.css';

interface PropiedadesApp {
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
 * pestañas de historial y perfil. El botón del tema flota sobre todas menos la de entrada.
 */
export function App({ fetchImpl = fetchNavegador, crearAvisador = avisadorDelNavegador, ahora, almacen = almacenDelNavegador(), nuevoId = () => crypto.randomUUID() }: PropiedadesApp): React.JSX.Element {
  const { pantalla, avanzar, atras, reemplazar } = usePila(almacen, ahora ?? Date.now);
  const { avisador, despertar } = useAvisador(crearAvisador);
  const { tema, cambiarTema } = useTema(almacen);
  const [cocinadas, setCocinadas] = useState<readonly Cocinada[]>(() => listarCocinadas(almacen));
  const experiencia = experienciaDe(cocinadas);

  const conBarra = (activa: Pestana, contenido: React.JSX.Element) => (
    <>
      {contenido}
      <BarraInferior activa={activa} alElegir={(pestana) => avanzar({ nombre: pestana })} />
    </>
  );

  const pantallaActual = (): React.JSX.Element => {
    switch (pantalla.nombre) {
      case 'inicio':
        return (
          <Inicio
            alEntrar={() => {
              despertar();
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
        return conBarra('perfil', <Perfil cocinadas={cocinadas} xp={experiencia} version={VERSION_APP} />);
    }
  };

  return (
    <>
      {pantalla.nombre !== 'inicio' && <BotonTema tema={tema} alCambiar={cambiarTema} />}
      {pantallaActual()}
    </>
  );
}
