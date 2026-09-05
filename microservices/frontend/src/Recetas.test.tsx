import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Recetas } from './Recetas';
import { fetchDeCatalogo, nunca, resumenSinFoto, resumenSpaghetti } from './pruebas/datos';
import type { Fetch } from './salud';

describe('Recetas', () => {
  it('muestra el estado de carga mientras espera al catálogo', () => {
    render(<Recetas fetchImpl={nunca} alElegir={() => undefined} alVerEstado={() => undefined} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Recetas' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Buscando recetas…');
  });

  it('lista cada plato con foto o inicial, tiempo, valores y cantidad de versiones', async () => {
    const fetchImpl = fetchDeCatalogo({ '/recetas': [resumenSpaghetti, resumenSinFoto] });
    render(<Recetas fetchImpl={fetchImpl} alElegir={() => undefined} alVerEstado={() => undefined} />);

    const tarjetas = await screen.findAllByRole('button', { name: /versi/ });
    expect(tarjetas).toHaveLength(2);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    expect(tarjetas[0]).toHaveTextContent('Spaghetti integral con brócoli, champiñones y camarones al limón');
    expect(tarjetas[0]).toHaveTextContent('16 min · 720 kcal · 38 g proteína');
    expect(tarjetas[0]).toHaveTextContent('2 versiones');
    expect(tarjetas[0]?.querySelector('img.plato')).toHaveAttribute('src', '/api/catalogo/recetas/spaghetti-integral-brocoli-camarones/foto');

    expect(tarjetas[1]).toHaveTextContent('25 min · 600 kcal · 40 g proteína');
    expect(tarjetas[1]).toHaveTextContent('1 versión');
    expect(tarjetas[1]?.querySelector('img.plato')).toBeNull();
    expect(tarjetas[1]?.querySelector('.plato-vacio')).toHaveTextContent(/^M$/);
  });

  it('un plato sin versiones muestra 0 min sin romperse', async () => {
    const fetchImpl = fetchDeCatalogo({ '/recetas': [{ ...resumenSinFoto, versiones: [] }] });
    render(<Recetas fetchImpl={fetchImpl} alElegir={() => undefined} alVerEstado={() => undefined} />);

    const [tarjeta] = await screen.findAllByRole('button', { name: /versi/ });
    expect(tarjeta).toHaveTextContent('0 min');
    expect(tarjeta).toHaveTextContent('0 versiones');
  });

  it('avisa a quien la monta con el resumen elegido', async () => {
    const alElegir = vi.fn();
    const fetchImpl = fetchDeCatalogo({ '/recetas': [resumenSpaghetti] });
    render(<Recetas fetchImpl={fetchImpl} alElegir={alElegir} alVerEstado={() => undefined} />);

    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));

    expect(alElegir).toHaveBeenCalledWith(resumenSpaghetti);
  });

  it('muestra el error con su detalle si el catálogo falla', async () => {
    const fetchImpl = fetchDeCatalogo({}, { '/recetas': 503 });
    render(<Recetas fetchImpl={fetchImpl} alElegir={() => undefined} alVerEstado={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo leer el catálogo: el catálogo respondió HTTP 503 a /recetas');
  });

  it('convierte a texto un fallo que no es un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject('se cortó');
    render(<Recetas fetchImpl={fetchImpl} alElegir={() => undefined} alVerEstado={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('se cortó');
  });

  it('ofrece ver el estado del sistema', () => {
    const alVerEstado = vi.fn();
    render(<Recetas fetchImpl={nunca} alElegir={() => undefined} alVerEstado={alVerEstado} />);

    fireEvent.click(screen.getByRole('button', { name: 'Estado del sistema' }));

    expect(alVerEstado).toHaveBeenCalledTimes(1);
  });

  it('si cambia el fetch, la respuesta tardía del anterior no pisa a la nueva', async () => {
    let resolverViejo: (v: { ok: boolean; status: number; json: () => Promise<unknown> }) => void = () => undefined;
    const viejo: Fetch = () =>
      new Promise((resolve) => {
        resolverViejo = resolve;
      });
    const nuevo = fetchDeCatalogo({ '/recetas': [resumenSinFoto] });
    const { rerender } = render(<Recetas fetchImpl={viejo} alElegir={() => undefined} alVerEstado={() => undefined} />);
    rerender(<Recetas fetchImpl={nuevo} alElegir={() => undefined} alVerEstado={() => undefined} />);
    await screen.findByRole('button', { name: /Merluza/ });

    resolverViejo({ ok: true, status: 200, json: () => Promise.resolve([resumenSpaghetti]) });
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByRole('button', { name: /Merluza/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Spaghetti/ })).not.toBeInTheDocument();
  });

  it('un fallo tardío del fetch anterior tampoco pisa a la lista nueva', async () => {
    let rechazarViejo: (e: unknown) => void = () => undefined;
    const viejo: Fetch = () =>
      new Promise((_, reject) => {
        rechazarViejo = reject;
      });
    const nuevo = fetchDeCatalogo({ '/recetas': [resumenSinFoto] });
    const { rerender } = render(<Recetas fetchImpl={viejo} alElegir={() => undefined} alVerEstado={() => undefined} />);
    rerender(<Recetas fetchImpl={nuevo} alElegir={() => undefined} alVerEstado={() => undefined} />);
    await screen.findByRole('button', { name: /Merluza/ });

    rechazarViejo(new Error('tarde'));
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ignora la respuesta si se desmonta antes de que llegue', async () => {
    let resolver: (v: { ok: boolean; status: number; json: () => Promise<unknown> }) => void = () => undefined;
    const fetchImpl: Fetch = () =>
      new Promise((resolve) => {
        resolver = resolve;
      });
    const { unmount } = render(<Recetas fetchImpl={fetchImpl} alElegir={() => undefined} alVerEstado={() => undefined} />);
    unmount();
    resolver({ ok: true, status: 200, json: () => Promise.resolve([resumenSpaghetti]) });

    await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument());
  });
});
