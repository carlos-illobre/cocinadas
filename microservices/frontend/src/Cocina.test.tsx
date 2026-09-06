import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Receta } from './api';
import type { Avisador } from './cocina/sonido';
import { Cocina } from './Cocina';
import { recetaDosEtapas, recetaUnaEtapa } from './pruebas/datos';

const T0 = 1_000_000;

function armar(receta: Receta = recetaDosEtapas) {
  let ahoraMs = T0;
  const avisador: Avisador = { toque: vi.fn(), suave: vi.fn(), fuerte: vi.fn() };
  const alVolver = vi.fn();
  const alTerminar = vi.fn();
  const alGuardar = vi.fn();
  const vista = render(<Cocina receta={receta} avisador={avisador} alVolver={alVolver} alTerminar={alTerminar} alGuardar={alGuardar} ahora={() => ahoraMs} tic_ms={500} />);
  /** Adelanta el reloj y deja correr los tics. */
  const pasar = (segundos: number) => {
    ahoraMs += segundos * 1000;
    act(() => {
      vi.advanceTimersByTime(segundos * 1000);
    });
  };
  const listo = () => fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
  return { ...vista, avisador, alVolver, alTerminar, alGuardar, pasar, listo };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Cocina · etapa tranquila', () => {
  it('arranca en el primer paso, con el reloj de la etapa en cero y sin procesos', () => {
    armar();
    expect(screen.getByText('Etapa 1 · Preparación')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 1 de 3');
    expect(screen.getByText('0:00', { selector: '.clock' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pesar y poner a descongelar los camarones');
    expect(screen.getByText('Ahora · con las manos')).toBeInTheDocument();
    expect(screen.getByText('0:00 → 0:30')).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    // El primer paso no tiene ingrediente con foto: no dibuja imagen en el título.
    expect(document.querySelector('.ttl img')).toBeNull();
  });

  it('el tic avanza el cronómetro del paso y el reloj de la etapa', () => {
    const { pasar } = armar();
    pasar(12);
    expect(screen.getByText('0:12', { selector: '.clock' })).toBeInTheDocument();
    expect(screen.getByText('de 0:30 previstos')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('pasado de tiempo: muestra el exceso titilando, la marca de lo previsto y la nota tranquilizadora', () => {
    const { pasar } = armar();
    pasar(40);
    expect(screen.getByText('+0:10')).toHaveClass('over');
    expect(document.querySelector('.track .ov')).toHaveStyle({ width: '25%' });
    expect(document.querySelector('.track .mk')).toHaveAttribute('data-t', '0:30');
    expect(screen.getByText('✓ Sin apuro: en esta etapa pasarse no cambia el plato')).toHaveClass('ok');
  });

  it('los sub-pasos se tildan y destildan', () => {
    armar();
    const sub = screen.getByRole('button', { name: 'Tarar el bol.' });
    expect(sub).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(sub);
    expect(sub).toHaveAttribute('aria-pressed', 'true');
    expect(sub.closest('li')).toHaveClass('ok');
    fireEvent.click(sub);
    expect(sub).toHaveAttribute('aria-pressed', 'false');
  });

  it('el botón «?» muestra y oculta el porqué, y se cierra al pasar de paso', () => {
    const { listo } = armar();
    const porQue = screen.getByRole('button', { name: 'Por qué' });
    expect(screen.queryByText(/En agua fría/)).not.toBeInTheDocument();
    fireEvent.click(porQue);
    expect(porQue).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('SEGURIDAD')).toBeInTheDocument();
    expect(screen.getByText(/En agua fría se mantiene/)).toBeInTheDocument();
    listo();
    expect(screen.queryByText(/En agua fría/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Por qué' }));
    expect(screen.getByText('NUTRICIÓN')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Por qué' }));
    expect(screen.queryByText('NUTRICIÓN')).not.toBeInTheDocument();
  });

  it('«Listo» pasa al siguiente, anota el desvío en el riel y arranca el proceso que el paso dispara', () => {
    const { pasar, listo } = armar();
    pasar(34);
    listo();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 2 de 3');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Lavar y cortar el brócoli');
    expect(document.querySelector('.ttl img')).toHaveAttribute('src', '/api/catalogo/ingredientes/brocoli-entero/foto');
    // El paso nuevo arranca en cero.
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    const filas = document.querySelectorAll('.row');
    expect(filas[0]).toHaveClass('done');
    expect(filas[0]?.querySelector('.d')).toHaveTextContent('+0:04');
    expect(filas[0]?.querySelector('.d')).toHaveClass('plus');
    expect(filas[1]).toHaveClass('cur');
    expect(filas[1]).toHaveAttribute('aria-current', 'step');
    expect(filas[2]).toHaveClass('wait');
    expect(screen.getByText('1 de 3 hechos')).toBeInTheDocument();

    const proceso = screen.getByRole('timer', { name: 'Camarones en agua fría' });
    expect(proceso).toHaveClass('cold');
    expect(within(proceso).getByText('10:00')).toBeInTheDocument();
    expect(within(proceso).getByText('No usar agua tibia.')).toBeInTheDocument();
    expect(screen.getByText('Corre solo')).toBeInTheDocument();
  });

it('el gantt dibuja una barra por paso y un carril por proceso, y se va llenando', () => {
    const { pasar } = armar();
    const barras = [...document.querySelectorAll('.gantt .barra')];
    expect(barras).toHaveLength(3);
    // El primer paso dura 30 s y queda en el alto mínimo; el segundo dura 150 s y crece.
    expect(barras[0]).toHaveStyle({ top: '4px', height: '38px' });
    expect(barras[1]).toHaveStyle({ top: '50px' });
    // La espera lleva su propio rayado.
    expect(barras[2]).toHaveClass('espera');
    // Nada hecho todavía: ninguna barra pintada.
    expect(barras[0]?.querySelector('i')).toHaveStyle({ height: '0%' });

    const carril = document.querySelector('.gantt .carril');
    expect(carril).toHaveClass('cold');
    expect(carril).toHaveTextContent('Camarones en agua fría');

    // A la mitad del primer paso, su barra va por la mitad.
    pasar(15);
    expect(document.querySelector('.gantt .barra i')).toHaveStyle({ height: '50%' });
  });

  it('un proceso no crítico que vence da un aviso suave y desaparece', () => {
    const { pasar, listo, avisador } = armar();
    listo();
    pasar(300);
    expect(screen.getByRole('timer')).toBeInTheDocument();
    pasar(301);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(avisador.suave).toHaveBeenCalledTimes(1);
    expect(avisador.fuerte).not.toHaveBeenCalled();
    pasar(5);
    expect(avisador.suave).toHaveBeenCalledTimes(1);
  });

  it('en una espera muestra cuánto falta para que venza lo que corre y el botón dice «Seguir»', () => {
    const { pasar, listo } = armar();
    listo();
    pasar(150);
    listo();
    expect(screen.getByText('Espera · preparate')).toBeInTheDocument();
    expect(screen.getByText('para que venza lo que corre')).toBeInTheDocument();
    expect(screen.getByText('7:30', { selector: '.big' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguir ✓' })).toBeInTheDocument();
  });

  it('una espera sin procesos corriendo muestra su propio cronómetro', () => {
    const { pasar, listo } = armar();
    listo();
    listo();
    pasar(601); // vence el proceso no crítico
    expect(screen.queryByText('para que venza lo que corre')).not.toBeInTheDocument();
    // Lleva 601 s en una espera de 120: cronómetro propio, pasado de tiempo.
    expect(screen.getByText('+8:01')).toHaveClass('over');
  });

  it('un desvío negativo y uno exacto se muestran con su signo', () => {
    const { pasar, listo } = armar();
    pasar(30);
    listo(); // 0:00 exacto
    pasar(100);
    listo(); // 150 previsto → −0:50
    const filas = document.querySelectorAll('.row');
    expect(filas[0]?.querySelector('.d')).toHaveTextContent('0:00');
    expect(filas[0]?.querySelector('.d')?.className).toBe('d');
    expect(filas[1]?.querySelector('.d')).toHaveTextContent('−0:50');
    expect(filas[1]?.querySelector('.d')).toHaveClass('minus');
  });

  it('si la receta deja un hueco antes del paso, muestra la cuenta regresiva para empezar y el botón «Ya lo hice»', () => {
    const receta: Receta = {
      ...recetaDosEtapas,
      etapas: recetaDosEtapas.etapas.map((et, i) => (i === 0 ? { ...et, pasos: et.pasos.map((p, j) => (j === 1 ? { ...p, inicio_s: 60 } : p)) } : et)),
    };
    const { pasar, listo } = armar(receta);
    pasar(30);
    listo(); // p1 termina a los 30; p2 empieza a los 60: hueco de 30 s
    expect(screen.getByText('Todavía no · empieza en')).toBeInTheDocument();
    expect(screen.getByText('0:30', { selector: '.big' })).toBeInTheDocument();
    expect(screen.getByText('para empezar este paso')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ya lo hice ✓' })).toBeInTheDocument();
    pasar(31);
    expect(screen.getByText('Ahora · con las manos')).toBeInTheDocument();
    expect(screen.getByText('de 2:30 previstos')).toBeInTheDocument();
  });

  it('«Reiniciar el paso» vuelve el cronómetro a cero y destilda los sub-pasos, sin tocar los procesos', () => {
    const { pasar, listo } = armar();
    listo(); // arranca los camarones
    pasar(50);
    fireEvent.click(screen.getByRole('button', { name: 'Lavar.' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar el paso' }));

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('button', { name: 'Lavar.' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('timer', { name: 'Camarones en agua fría' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 2 de 3');
  });

  it('volver avisa a quien la monta', () => {
    const { alVolver } = armar();
    fireEvent.click(screen.getByRole('button', { name: '‹ Portada' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});

function terminarEtapa1(c: ReturnType<typeof armar>): void {
  c.pasar(34);
  c.listo();
  c.pasar(150);
  c.listo();
  c.pasar(120);
  c.listo();
}

describe('Cocina · fin de etapa y etapa crítica', () => {
  it('al cerrar la etapa 1 muestra la pausa con el tiempo real, el desvío y el botón de la etapa 2', () => {
    const c = armar();
    terminarEtapa1(c);
    expect(screen.getByText('Etapa 1 · Preparación · lista')).toBeInTheDocument();
    expect(screen.getByText('5:04', { selector: '.big' })).toBeInTheDocument();
    expect(screen.getByText('previsto 11:00')).toBeInTheDocument();
    expect(screen.getByText('−5:56 respecto de lo previsto.')).toHaveClass('menos');
    expect(screen.getByText('Puede haber pausa.')).toBeInTheDocument();
    expect(screen.getByText('Cuando el agua rompe hervor.')).toBeInTheDocument();
    // Los pasos hechos de la etapa, con su desvío.
    const hechos = document.querySelectorAll('.row.done');
    expect(hechos).toHaveLength(3);
    expect(hechos[0]).toHaveTextContent('Pesar y poner a descongelar los camarones');
    expect(hechos[0]?.querySelector('.d')).toHaveTextContent('+0:04');
    expect(hechos[1]?.querySelector('.d')).toHaveTextContent('0:00');
    expect(hechos[2]?.querySelector('.d')).toHaveTextContent('0:00');

    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    expect(screen.getByText('Etapa 2 · Cocción y plato')).toBeInTheDocument();
    expect(document.querySelector('main')).toHaveClass('critica');
    expect(document.querySelector('.now')).toHaveClass('hot');
    expect(screen.getByText('0:00', { selector: '.clock' })).toBeInTheDocument();
  });

  it('una etapa terminada justo a tiempo lo dice, y pasada de tiempo también', () => {
    const c = armar(recetaUnaEtapa);
    // Una sola etapa: no hay pausa, así que se prueba con la de dos etapas y tiempos exactos.
    c.unmount();
    const d = armar();
    d.pasar(30);
    d.listo();
    d.pasar(150);
    d.listo();
    d.pasar(480);
    d.listo(); // 660 s exactos
    expect(screen.getByText('Justo a tiempo.')).toHaveClass('igual');
    d.unmount();
    const e = armar();
    e.pasar(700);
    e.listo();
    e.listo();
    e.listo();
    expect(screen.getByText('+0:40 respecto de lo previsto.')).toHaveClass('mas');
  });

  it('en la etapa crítica, pasarse muestra qué se arruina; los procesos de fuego van en coral y avisan antes de vencer', () => {
    const c = armar();
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.pasar(30);
    c.listo(); // Wok al fuego
    c.pasar(60); // Champiñones: 45 previstos → +0:15
    expect(screen.getByText('+0:15')).toHaveClass('over');
    expect(screen.getByText('Pasado 0:15: Maillard.')).not.toHaveClass('ok');
    c.listo(); // arranca brócoli tapado (180 s, crítico)
    const brocoli = screen.getByRole('timer', { name: 'Brócoli tapado' });
    expect(brocoli).toHaveClass('hot');
    expect(brocoli.querySelector('img')).toHaveAttribute('src', '/api/catalogo/ingredientes/brocoli-entero/foto');
    expect(screen.getByText('En el fuego')).toBeInTheDocument();
    c.pasar(151);
    expect(screen.getByRole('timer', { name: 'Brócoli tapado' })).toHaveClass('warn');
    expect(within(screen.getByRole('timer', { name: 'Brócoli tapado' })).getByText('0:29')).toBeInTheDocument();
  });

  it('un proceso crítico vencido dispara la alarma con sonido repetido; atenderla en una espera sigue con el paso que corresponde', () => {
    const c = armar();
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.listo(); // Wok
    c.listo(); // Champiñones → brócoli 180 s
    c.listo(); // Pasta → pasta 420 s; ahora en la espera e2-p4
    expect(screen.getByText('Espera · preparate')).toBeInTheDocument();
    expect(screen.getAllByRole('timer')).toHaveLength(2);
    c.pasar(180);
    const alarma = screen.getByRole('alertdialog');
    expect(alarma).toHaveTextContent('Brócoli tapado');
    expect(alarma).toHaveTextContent('Más tiempo lo pasa.');
    expect(alarma).toHaveTextContent('Esperar el vapor');
    expect(alarma).toHaveTextContent('No destapar.');
    expect(alarma).toHaveTextContent('1:00');
    expect(c.avisador.fuerte).toHaveBeenCalledTimes(1);
    c.pasar(4);
    expect(c.avisador.fuerte).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'Atendido · seguir con esperar el vapor' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Mantecar');
    // La pasta sigue; el brócoli ya no.
    expect(screen.getAllByRole('timer')).toHaveLength(1);
    expect(screen.getByRole('timer', { name: 'Spaghetti en el jarro' })).toBeInTheDocument();
    c.pasar(4);
    expect(c.avisador.fuerte).toHaveBeenCalledTimes(3);
  });

  it('si la alarma llega en un paso que no es espera, atenderla solo la apaga', () => {
    const c = armar();
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.listo();
    c.listo(); // brócoli 180 s, en Pasta al jarro
    c.pasar(180);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Atendido/ }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pasta al jarro');
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('la alarma de un proceso sin paso siguiente ni foto solo dice «Atendido»', () => {
    const receta: Receta = {
      ...recetaDosEtapas,
      ingredientes: recetaDosEtapas.ingredientes.filter((i) => i.id !== 'brocoli-entero'),
      etapas: recetaDosEtapas.etapas.map((e, i) =>
        i === 1
          ? {
              ...e,
              procesos: e.procesos.map((p) => (p.id === 'e2-brocoli' ? { ...p, al_terminar: null, tipo: 'rarisimo' } : p)),
              pasos: e.pasos.map((p) => (p.id === 'e2-p4' ? { ...p, acciones: [] } : p)),
            }
          : e,
      ),
    };
    const c = armar(receta);
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.listo();
    c.listo();
    // Sin foto y con un tipo desconocido, el proceso muestra el marcador genérico.
    const proceso = screen.getByRole('timer', { name: 'Brócoli tapado' });
    expect(proceso.querySelector('img')).toBeNull();
    expect(proceso.querySelector('.ph-vacio')).toHaveTextContent('·');
    c.pasar(180);
    expect(screen.getByRole('button', { name: 'Atendido' })).toBeInTheDocument();
    expect(screen.queryByText('Esperar el vapor')).not.toBeInTheDocument();
  });

  it('la alarma muestra la foto del ingrediente del paso siguiente y su primera acción vacía si no tiene', () => {
    const receta: Receta = {
      ...recetaDosEtapas,
      etapas: recetaDosEtapas.etapas.map((e, i) =>
        i === 1 ? { ...e, pasos: e.pasos.map((p) => (p.id === 'e2-p4' ? { ...p, acciones: [], ingredientes: ['brocoli-entero'] } : p)) } : e,
      ),
    };
    const c = armar(receta);
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.listo();
    c.listo();
    c.pasar(180);
    const alarma = screen.getByRole('alertdialog');
    expect(alarma.querySelector('img')).toHaveAttribute('src', '/api/catalogo/ingredientes/brocoli-entero/foto');
  });
});

describe('Cocina · final', () => {
  it('al terminar la última etapa muestra el resumen con totales, etapas, críticos y el paso a paso', () => {
    const c = armar();
    terminarEtapa1(c);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    c.pasar(30);
    c.listo(); // 0:00
    c.pasar(45);
    c.listo(); // crítico a tiempo
    c.pasar(50);
    c.listo(); // crítico +0:05
    c.pasar(60);
    c.listo(); // espera
    c.pasar(30);
    c.listo(); // Mantecar, crítico −0:30 → fin

    expect(screen.getByText('Plato listo · Mise en place primero')).toBeInTheDocument();
    expect(screen.getByText('8:39', { selector: '.big' })).toBeInTheDocument();
    expect(screen.getByText('−12:21')).toHaveClass('menos');
    const kpis = document.querySelectorAll('.kpi');
    expect(kpis).toHaveLength(3);
    expect(kpis[0]).toHaveTextContent('Etapa 1');
    expect(kpis[0]).toHaveTextContent('5:04');
    expect(kpis[1]).toHaveTextContent('3:35');
    expect(kpis[2]).toHaveTextContent('2 / 3');
    expect(kpis[2]).toHaveTextContent('1 pasados');
    const filas = document.querySelectorAll('.sum .row');
    expect(filas).toHaveLength(8);
    expect(filas[3]?.querySelector('.d')).toHaveTextContent('0:00');
    expect(filas[5]?.querySelector('.d')).toHaveClass('plus');
    expect(filas[7]?.querySelector('.d')).toHaveClass('minus');

    // Guardar: manda la cocinada completa y cambia los botones.
    expect(screen.getByRole('button', { name: 'Salir sin guardar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar esta cocinada' }));
    expect(c.alGuardar).toHaveBeenCalledTimes(1);
    const guardada = c.alGuardar.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(guardada).toMatchObject({
      plato: 'spaghetti-integral-brocoli-camarones',
      version: { clave: 'dos-etapas', titulo: 'Mise en place primero' },
      total_previsto_s: 1260,
      total_real_s: 519,
      criticos: 3,
      criticosATiempo: 2,
    });
    expect(guardada['fecha']).toBe(new Date(T0 + 519 * 1000).toISOString());
    expect((guardada['pasos'] as unknown[]).length).toBe(8);
    expect((guardada['etapas'] as unknown[]).length).toBe(2);
    expect(screen.getByText('✓ Guardada en este teléfono. Se ve en Progreso.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar esta cocinada' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver el progreso' }));
    expect(c.alTerminar).toHaveBeenCalledTimes(1);
  });

  it('se puede salir sin guardar', () => {
    const c = armar(recetaUnaEtapa);
    c.listo();
    c.listo();
    c.listo();
    fireEvent.click(screen.getByRole('button', { name: 'Salir sin guardar' }));
    expect(c.alGuardar).not.toHaveBeenCalled();
    expect(c.alTerminar).toHaveBeenCalledTimes(1);
  });

  it('con todos los críticos a tiempo lo dice, y con el total pasado marca el exceso', () => {
    const c = armar(recetaUnaEtapa);
    c.pasar(1000);
    c.listo();
    c.listo();
    c.listo();
    expect(screen.getByText('+0:40')).toHaveClass('mas');
    expect(screen.getByText('ninguno pasado')).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });
});
