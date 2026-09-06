import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, Servicios, versionPorOmision } from './App';
import type { Avisador } from './cocina/sonido';
import { fetchDeCatalogo, nunca, recetaDosEtapas, resumenSinFoto, resumenSpaghetti } from './pruebas/datos';
import type { Fetch } from './salud';

const ruta = '/recetas/spaghetti-integral-brocoli-camarones';

function fetchCompleto(): Fetch {
  return fetchDeCatalogo({
    '/recetas': [resumenSpaghetti],
    [`${ruta}/dos-etapas`]: recetaDosEtapas,
    [`${ruta}/linea-de-tiempo`]: { ...recetaDosEtapas, version: resumenSpaghetti.versiones[0] },
  });
}

const avisadorFalso: Avisador = { suave: vi.fn(), fuerte: vi.fn() };
const crearAvisador = vi.fn(() => avisadorFalso);

describe('versionPorOmision', () => {
  it('elige la última versión declarada', () => {
    expect(versionPorOmision(resumenSpaghetti)).toBe('dos-etapas');
    expect(versionPorOmision(resumenSinFoto)).toBe('linea-de-tiempo');
  });

  it('cae en «1» si el resumen no trae versiones', () => {
    expect(versionPorOmision({ ...resumenSinFoto, versiones: [] })).toBe('1');
  });
});

describe('el recorrido de la app', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    crearAvisador.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('arranca en la pantalla de inicio sin consultar nada ni crear el avisador', () => {
    let consultas = 0;
    const fetchImpl: Fetch = () => {
      consultas += 1;
      return nunca('');
    };
    render(<App fetchImpl={fetchImpl} crearAvisador={crearAvisador} />);

    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument();
    expect(consultas).toBe(0);
    expect(crearAvisador).not.toHaveBeenCalled();
  });

  it('inicio → recetas → portada → cocina → resumen → recetas, y el avisador nace con el primer gesto', async () => {
    vi.useRealTimers();
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} ahora={() => 1_000_000} />);

    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(crearAvisador).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 2');

    fireEvent.click(await screen.findByRole('button', { name: 'Empezar Etapa 1' }));
    expect(screen.getByText('Etapa 1 · Preparación')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 1 de 3');

    // Volver desde la cocina lleva a la portada de la misma versión.
    fireEvent.click(screen.getByRole('button', { name: '‹ Portada' }));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 2');
    // Y desde la portada, a la lista; y otra vez adentro.
    fireEvent.click(screen.getByRole('button', { name: '‹ Recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));

    // Cocinar entero: tres pasos de la etapa 1, pausa, cinco de la etapa 2, resumen.
    fireEvent.click(await screen.findByRole('button', { name: 'Empezar Etapa 1' }));
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Empezar Etapa 2' }));
    for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByRole('button', { name: /Listo, siguiente|Seguir/ }));
    expect(screen.getByText('Plato listo · Dos etapas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Volver a las recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
    // El avisador no se vuelve a crear.
    expect(crearAvisador).toHaveBeenCalledTimes(1);
  });

  it('sin reloj inyectado, la cocina usa el del navegador', async () => {
    vi.useRealTimers();
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Empezar Etapa 1' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paso 1 de 3');
  });

  it('cambiar la pestaña de versión pide la otra receta', async () => {
    vi.useRealTimers();
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    await screen.findByRole('button', { name: 'Empezar Etapa 1' });

    fireEvent.click(screen.getByRole('tab', { name: /Versión 1/ }));

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 1');
    await waitFor(() => expect(screen.getByRole('button', { name: /Empezar/ })).toBeInTheDocument());
  });

  it('desde recetas se llega al estado del sistema y se vuelve', async () => {
    vi.useRealTimers();
    render(<App fetchImpl={fetchCompleto()} crearAvisador={crearAvisador} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Estado del sistema' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Templa' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '‹ Recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
  });

  it('usa el fetch y el avisador del navegador cuando no se inyecta ninguno', async () => {
    vi.useRealTimers();
    const original = globalThis.fetch;
    globalThis.fetch = (() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([resumenSpaghetti]) })) as unknown as typeof fetch;
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
      expect(await screen.findByRole('button', { name: /Spaghetti/ })).toBeInTheDocument();
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe('Servicios', () => {
  it('lista cada servicio con su versión o su fallo', async () => {
    const fetchImpl: Fetch = (url) =>
      url.includes('catalogo')
        ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ version: '0.1.0' }) })
        : Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) });
    render(<Servicios fetchImpl={fetchImpl} />);

    expect(screen.getByRole('status')).toHaveTextContent('Consultando…');
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const filas = screen.getAllByRole('listitem');
    expect(filas).toHaveLength(3);
    expect(filas[0]).toHaveClass('ok');
    expect(filas[0]).toHaveTextContent('v0.1.0');
    expect(filas[1]).toHaveClass('caido');
    expect(filas[1]).toHaveTextContent('HTTP 503');
    expect(screen.queryByRole('button', { name: '‹ Recetas' })).not.toBeInTheDocument();
  });

  it('usa el fetch del navegador cuando no se inyecta ninguno', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ version: '9.9.9' }) })) as unknown as typeof fetch;
    try {
      render(<Servicios />);
      await waitFor(() => expect(screen.getAllByText('v9.9.9')).toHaveLength(3));
    } finally {
      globalThis.fetch = original;
    }
  });

  it('si cambia el fetch, la respuesta tardía del anterior no pisa a la nueva', async () => {
    let resolverViejo: (v: Awaited<ReturnType<Fetch>>) => void = () => undefined;
    const viejo: Fetch = () =>
      new Promise((resolve) => {
        resolverViejo = resolve;
      });
    const nuevo: Fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ version: '2.0.0' }) });
    const { rerender } = render(<Servicios fetchImpl={viejo} />);
    rerender(<Servicios fetchImpl={nuevo} />);
    await waitFor(() => expect(screen.getAllByText('v2.0.0')).toHaveLength(3));

    resolverViejo({ ok: true, status: 200, json: () => Promise.resolve({ version: '1.0.0' }) });
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getAllByText('v2.0.0')).toHaveLength(3);
    expect(screen.queryByText('v1.0.0')).not.toBeInTheDocument();
  });

  it('ignora la respuesta si se desmonta antes de que llegue', async () => {
    let resolver: (v: Awaited<ReturnType<Fetch>>) => void = () => undefined;
    const fetchImpl: Fetch = () =>
      new Promise((resolve) => {
        resolver = resolve;
      });
    const { unmount } = render(<Servicios fetchImpl={fetchImpl} />);
    unmount();
    resolver({ ok: true, status: 200, json: () => Promise.resolve({ version: '1' }) });

    await Promise.resolve();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
