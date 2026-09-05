import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App, Cocina, Servicios, versionPorOmision } from './App';
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
  it('arranca en la pantalla de inicio sin consultar nada', () => {
    let consultas = 0;
    const fetchImpl: Fetch = () => {
      consultas += 1;
      return nunca('');
    };
    render(<App fetchImpl={fetchImpl} />);

    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument();
    expect(consultas).toBe(0);
  });

  it('inicio → recetas → portada → cocina, y vuelve por el mismo camino', async () => {
    render(<App fetchImpl={fetchCompleto()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    // La versión por omisión es la última: dos etapas.
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 2');

    fireEvent.click(await screen.findByRole('button', { name: 'Empezar Etapa 1' }));
    expect(screen.getByText('Cocina · en construcción')).toBeInTheDocument();
    expect(screen.getByText('Versión 2 · Dos etapas · 11 + 10 min.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '‹ Portada' }));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 2');

    fireEvent.click(screen.getByRole('button', { name: '‹ Recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
  });

  it('cambiar la pestaña de versión pide la otra receta', async () => {
    render(<App fetchImpl={fetchCompleto()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));
    await screen.findByRole('button', { name: 'Empezar Etapa 1' });

    fireEvent.click(screen.getByRole('tab', { name: /Versión 1/ }));

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Versión 1');
    await waitFor(() => expect(screen.getByRole('button', { name: /Empezar/ })).toBeInTheDocument());
  });

  it('desde recetas se llega al estado del sistema y se vuelve', async () => {
    render(<App fetchImpl={fetchCompleto()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Estado del sistema' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Templa' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '‹ Recetas' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
  });

  it('usa el fetch del navegador cuando no se inyecta ninguno', async () => {
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

describe('Cocina (provisoria)', () => {
  it('dice qué receta y versión se eligió', () => {
    render(<Cocina receta={recetaDosEtapas} alVolver={() => undefined} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    expect(screen.getByText('Versión 2 · Dos etapas · 11 + 10 min.')).toBeInTheDocument();
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
    // Sin alVolver no hay botón de volver.
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
