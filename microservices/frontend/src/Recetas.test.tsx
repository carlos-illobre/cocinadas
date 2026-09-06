import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Recetas } from './Recetas';
import { fetchDeCatalogo, nunca, resumenSinFoto, resumenSpaghetti } from './pruebas/datos';
import type { Fetch } from './salud';

describe('Recetas', () => {
  it('saluda, muestra la experiencia y el estado de carga mientras espera al catálogo', () => {
    render(<Recetas fetchImpl={nunca} xp={0} alElegir={() => undefined} />);

    expect(screen.getByRole('heading', { level: 1, name: '¿Qué cocinamos hoy?' })).toBeInTheDocument();
    expect(screen.getByText('Nivel 1 — Aprendiz')).toBeInTheDocument();
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('0 XP');
    expect(screen.getByRole('heading', { level: 2, name: 'Recetas' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Buscando recetas…');
    expect(screen.queryByText(/disponible/)).not.toBeInTheDocument();
  });

  it('una tarjeta por plato, con foto o inicial, y el tiempo del modo propuesto, porciones y calorías', async () => {
    const fetchImpl = fetchDeCatalogo({ '/recetas': [resumenSpaghetti, resumenSinFoto] });
    render(<Recetas fetchImpl={fetchImpl} xp={620} alElegir={() => undefined} />);

    const tarjetas = await screen.findAllByRole('button', { name: /porc/ });
    expect(tarjetas).toHaveLength(2);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('2 disponibles')).toBeInTheDocument();
    expect(screen.getByText('Nivel 2 — Cocinero')).toBeInTheDocument();

    expect(tarjetas[0]?.querySelector('.tarjeta-titulo')).toHaveTextContent('Spaghetti integral con brócoli, champiñones y camarones al limón');
    // 21 min: el modo más lento es el propuesto, aunque no sea el primero de la lista.
    expect(tarjetas[0]).toHaveTextContent('21 min');
    expect(tarjetas[0]).toHaveTextContent('1 porc');
    expect(tarjetas[0]).toHaveTextContent('720 kcal');
    expect(tarjetas[0]?.querySelector('img.tarjeta-foto')).toHaveAttribute('src', '/api/catalogo/recetas/spaghetti-integral-brocoli-camarones/foto');

    expect(tarjetas[1]).toHaveTextContent('25 min');
    expect(tarjetas[1]).toHaveTextContent('2 porc');
    expect(tarjetas[1]?.querySelector('img')).toBeNull();
    expect(tarjetas[1]?.querySelector('.tarjeta-sin-foto')).toHaveTextContent(/^M$/);
  });

  it('con un solo plato lo dice en singular, y sin versiones muestra 0 min sin romperse', async () => {
    const fetchImpl = fetchDeCatalogo({ '/recetas': [{ ...resumenSinFoto, versiones: [] }] });
    render(<Recetas fetchImpl={fetchImpl} xp={0} alElegir={() => undefined} />);

    const [tarjeta] = await screen.findAllByRole('button', { name: /porc/ });
    expect(tarjeta).toHaveTextContent('0 min');
    expect(screen.getByText('1 disponible')).toBeInTheDocument();
  });

  it('avisa a quien la monta con el resumen elegido', async () => {
    const alElegir = vi.fn();
    const fetchImpl = fetchDeCatalogo({ '/recetas': [resumenSpaghetti] });
    render(<Recetas fetchImpl={fetchImpl} xp={0} alElegir={alElegir} />);

    fireEvent.click(await screen.findByRole('button', { name: /Spaghetti/ }));

    expect(alElegir).toHaveBeenCalledWith(resumenSpaghetti);
  });

  it('muestra el error con su detalle si el catálogo falla', async () => {
    const fetchImpl = fetchDeCatalogo({}, { '/recetas': 503 });
    render(<Recetas fetchImpl={fetchImpl} xp={0} alElegir={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo leer el catálogo: el catálogo respondió HTTP 503 a /recetas');
  });

  it('convierte a texto un fallo que no es un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject('se cortó');
    render(<Recetas fetchImpl={fetchImpl} xp={0} alElegir={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('se cortó');
  });

  it('si cambia el fetch, la respuesta tardía del anterior no pisa a la nueva', async () => {
    let resolverViejo: (v: { ok: boolean; status: number; json: () => Promise<unknown> }) => void = () => undefined;
    const viejo: Fetch = () =>
      new Promise((resolve) => {
        resolverViejo = resolve;
      });
    const nuevo = fetchDeCatalogo({ '/recetas': [resumenSinFoto] });
    const { rerender } = render(<Recetas fetchImpl={viejo} xp={0} alElegir={() => undefined} />);
    rerender(<Recetas fetchImpl={nuevo} xp={0} alElegir={() => undefined} />);
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
    const { rerender } = render(<Recetas fetchImpl={viejo} xp={0} alElegir={() => undefined} />);
    rerender(<Recetas fetchImpl={nuevo} xp={0} alElegir={() => undefined} />);
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
    const { unmount } = render(<Recetas fetchImpl={fetchImpl} xp={0} alElegir={() => undefined} />);
    unmount();
    resolver({ ok: true, status: 200, json: () => Promise.resolve([resumenSpaghetti]) });

    await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument());
  });
});
