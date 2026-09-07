import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { Fetch } from './api';
import type { Avisador } from './cocina/sonido';
import { CLAVE_HISTORIAL, type Almacen } from './historial/almacen';
import { CLAVE_TEMA } from './tema';
import { CLAVE_EN_CURSO } from './cocina/enCurso';
import { fetchDeCatalogo, nunca, recetaDosEtapas, resumenSpaghetti } from './pruebas/datos';

const ruta = '/recetas/spaghetti-integral-brocoli-camarones';

function fetchCompleto(): Fetch {
  return fetchDeCatalogo({
    '/recetas': [resumenSpaghetti],
    [`${ruta}/dos-etapas`]: recetaDosEtapas,
    [`${ruta}/linea-de-tiempo`]: { ...recetaDosEtapas, version: resumenSpaghetti.versiones[0] },
  });
}

function memoria(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

const avisadorFalso: Avisador = { toque: vi.fn(), suave: vi.fn(), fuerte: vi.fn(), festejo: vi.fn() };
const crearAvisador = vi.fn(() => avisadorFalso);

function montar(extra: { almacen?: ReturnType<typeof memoria>; ahora?: () => number } = {}) {
  crearAvisador.mockClear();
  const almacen = extra.almacen ?? memoria();
  render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} almacen={almacen} nuevoId={() => 'id-1'} {...(extra.ahora === undefined ? {} : { ahora: extra.ahora })} />);
  return almacen;
}

/** En la mise en place se tilda cada cosa (ya no hay atajo) y se cocina. */
function tildarTodoYCocinar(): void {
  for (const b of screen.getAllByRole('button', { pressed: false })) fireEvent.click(b);
  fireEvent.click(screen.getByRole('button', { name: 'Todo listo → Cocinar' }));
}

async function hastaLaCocina(): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
  fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Comenzar · 21 min →' }));
  tildarTodoYCocinar();
}

describe('el recorrido de la app', () => {
  it('arranca en la pantalla de inicio sin consultar nada, sin barra y sin crear el avisador', () => {
    let consultas = 0;
    const fetchImpl: Fetch = () => {
      consultas += 1;
      return nunca('');
    };
    render(<App fetchImpl={fetchImpl} crearAvisador={crearAvisador} almacen={memoria()} />);

    expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(consultas).toBe(0);
    expect(crearAvisador).not.toHaveBeenCalled();
  });

  it('inicio → recetas → portada → mise en place → cocina → resumen → progreso, guardando la cocinada y sumando experiencia', async () => {
    const almacen = montar({ ahora: () => 1_000_000 });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    expect(crearAvisador).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('0 XP');
    expect(screen.getByRole('navigation', { name: 'Secciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recetas' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    // La versión por omisión es la más lenta: mise en place primero.
    expect(screen.getByRole('tab', { name: /Mise en place primero/ })).toHaveAttribute('aria-selected', 'true');
    // Sin barra en la portada ni en la mise en place ni en la cocina: una sola cosa por pantalla.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Comenzar · 21 min →' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeInTheDocument();

    // Volver de la mise en place lleva a la portada de la misma versión.
    fireEvent.click(screen.getByRole('button', { name: '‹ Volver' }));
    expect(screen.getByRole('tab', { name: /Mise en place primero/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(await screen.findByRole('button', { name: 'Comenzar · 21 min →' }));
    tildarTodoYCocinar();
    expect(screen.getByText('Etapa 1 · Preparación')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    // Volver desde la cocina lleva a la pantalla anterior, que es la mise en place; de
    // ahí a la portada, y de la portada a la lista.
    fireEvent.click(screen.getByRole('button', { name: '‹ Volver' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '‹ Volver' }));
    expect(screen.getByRole('tab', { name: /Mise en place primero/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a las recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();

    // Cocinar entero y guardar.
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Comenzar · 21 min →' }));
    tildarTodoYCocinar();
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultados 🏆' }));
    expect(screen.getByRole('heading', { level: 1, name: '¡Receta completada!' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar esta cocinada' }));
    const guardadas = JSON.parse(almacen.datos.get(CLAVE_HISTORIAL) ?? '[]') as { id: string; plato: string }[];
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0]).toMatchObject({ id: 'id-1', plato: 'spaghetti-integral-brocoli-camarones' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver el progreso' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Progreso' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Progreso' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Spaghetti integral');
    expect(crearAvisador).toHaveBeenCalledTimes(1);

    // Con el reloj quieto la cocinada dura 0 s contra 21 min previstos: fuera del margen,
    // sin bonus; 200 por completarla y 10 por cada uno de los 8 pasos, que no se pasaron.
    fireEvent.click(screen.getByRole('button', { name: 'Recetas' }));
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('280 XP');
  });

  it('el tema se aplica al documento, se guarda y se puede volver', () => {
    const almacen = montar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    expect(document.documentElement.getAttribute('data-tema')).toBe('claro');

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));
    expect(document.documentElement.getAttribute('data-tema')).toBe('oscuro');
    expect(almacen.datos.get(CLAVE_TEMA)).toBe('oscuro');

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }));
    expect(document.documentElement.getAttribute('data-tema')).toBe('claro');
    expect(almacen.datos.get(CLAVE_TEMA)).toBe('claro');
  });

  it('arranca con el tema ya guardado en el teléfono', () => {
    montar({ almacen: memoria({ [CLAVE_TEMA]: 'oscuro' }) });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    expect(document.documentElement.getAttribute('data-tema')).toBe('oscuro');
    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
  });

  it('el botón de atrás del teléfono vuelve a la pantalla anterior, y en la primera se va del sitio', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Aprendiz' })).toBeInTheDocument();

    // Lo que dispara el botón físico.
    fireEvent.popState(window);
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();

    fireEvent.popState(window);
    expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();

    // En la primera pantalla ya no hay a dónde volver: la app se queda como está y el
    // navegador se va del sitio.
    fireEvent.popState(window);
    expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();
  });

  it('volver con un botón de la pantalla no cuenta dos veces con el del teléfono', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');

    // El botón de la pantalla ya consume su entrada del historial…
    fireEvent.click(screen.getByRole('button', { name: 'Volver a las recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();

    // …así que el popstate que llega después no tiene que mover nada más.
    fireEvent.popState(window);
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();
  });

  it('salir de la cocina con el botón de atrás descarta la cocinada en curso', async () => {
    const almacen = montar();
    await hastaLaCocina();
    expect(almacen.datos.get(CLAVE_EN_CURSO)).toBeTruthy();

    fireEvent.popState(window);

    expect(screen.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeInTheDocument();
    expect(almacen.datos.get(CLAVE_EN_CURSO)).toBe('');
  });

  it('si quedó una cocinada a medio hacer, arranca en la cocina y no en la bienvenida', async () => {
    const almacen = montar();
    await hastaLaCocina();
    const guardado = almacen.datos.get(CLAVE_EN_CURSO) ?? '';
    expect(guardado).not.toBe('');
    cleanup();

    // Otra carga de la app con lo que quedó guardado: es lo que pasa al recargar o cuando
    // el teléfono descartó la pestaña.
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} almacen={memoria({ [CLAVE_EN_CURSO]: guardado })} nuevoId={() => 'id-1'} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 1 de 3');
    // Y el botón de atrás desde ahí lleva a la bienvenida, no fuera del sitio.
    fireEvent.popState(window);
    expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();
  });

  it('al retomar una cocinada, el avisador se crea con el primer toque', async () => {
    const almacen = montar();
    await hastaLaCocina();
    const guardado = almacen.datos.get(CLAVE_EN_CURSO) ?? '';
    cleanup();
    crearAvisador.mockClear();

    // Retomando no se pasa por «Entrar», así que no hubo gesto todavía.
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} almacen={memoria({ [CLAVE_EN_CURSO]: guardado })} nuevoId={() => 'id-1'} />);
    expect(crearAvisador).not.toHaveBeenCalled();

    fireEvent.pointerDown(document.body);

    // Sin esto, una cocinada retomada se quedaría sin alarmas.
    expect(crearAvisador).toHaveBeenCalledTimes(1);
  });

  it('las pestañas de la barra cambian de sección', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));

    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Progreso' })).toBeInTheDocument();
    expect(screen.getByText(/Todavía no hay cocinadas guardadas/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Aprendiz' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();
    await screen.findByRole('button', { name: /Spaghetti/ });
  });

  it('cada pantalla arranca arriba', () => {
    // Todas viven en el mismo documento, así que el desplazamiento no se reinicia solo.
    // Se nota al terminar la cocinada: el resumen aparecía al pie de la línea de tiempo,
    // con el festejo fuera de la vista.
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    montar();
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('arranca con las cocinadas ya guardadas en el teléfono y su experiencia', () => {
    const cocinada = { id: 'x', plato: 'p', nombre: 'Plato p', version: { clave: 'c', titulo: 'T' }, fecha: '2026-09-05T10:00:00Z', total_previsto_s: 100, total_real_s: 90, etapas: [], pasos: [], criticos: 0, criticosATiempo: 0 };
    montar({ almacen: memoria({ [CLAVE_HISTORIAL]: JSON.stringify([cocinada]) }) });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    // 90 s contra 100 s previstos, dentro del margen: 200 por completar y 100 de bonus.
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('300 XP');
    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(screen.getByText('Suman 1:30 de cocina', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Plato p');
  });

  it('cambiar el modo de preparación pide la otra receta', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    await screen.findByRole('button', { name: 'Comenzar · 21 min →' });

    fireEvent.click(screen.getByRole('tab', { name: /Flujo continuo/ }));

    expect(screen.getByRole('tab', { name: /Flujo continuo/ })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Comenzar · 16 min →' })).toBeInTheDocument());
  });

  it('sin reloj inyectado, la cocina usa el del navegador', async () => {
    montar();
    await hastaLaCocina();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 1 de 3');
  });

  it('usa el fetch, el avisador, el almacén y los ids del navegador cuando no se inyecta nada', async () => {
    const original = globalThis.fetch;
    const porRuta = fetchCompleto();
    globalThis.fetch = ((url: string) => porRuta(url)) as unknown as typeof fetch;
    try {
      render(<App />);
      await hastaLaCocina();
      for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
      for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Ver resultados 🏆' }));
      fireEvent.click(screen.getByRole('button', { name: 'Guardar esta cocinada' }));
      // Se guardó con el almacén y el id del navegador: aparece en Progreso.
      fireEvent.click(screen.getByRole('button', { name: 'Ver el progreso' }));
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Spaghetti integral');
    } finally {
      globalThis.fetch = original;
    }
  });

  it('si el localStorage del navegador no existe o lanza, la app arranca igual', () => {
    const roto = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    };
    vi.stubGlobal('localStorage', roto);
    try {
      render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} />);
      expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();
      // Y si el solo hecho de tocar localStorage lanza (marco aislado), también arranca.
      vi.unstubAllGlobals();
      const previo = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('acceso denegado');
        },
      });
      try {
        render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} />);
        expect(screen.getAllByRole('button', { name: 'Entrar sin cuenta' })).toHaveLength(2);
      } finally {
        if (previo) Object.defineProperty(globalThis, 'localStorage', previo);
        else delete (globalThis as { localStorage?: unknown }).localStorage;
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
