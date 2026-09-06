import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Portada } from './Portada';
import { fetchDeCatalogo, nunca, recetaDosEtapas, recetaUnaEtapa, resumenSinFoto, resumenSpaghetti } from './pruebas/datos';
import type { Fetch } from './salud';

const nada = () => undefined;
const ruta = '/recetas/spaghetti-integral-brocoli-camarones';

describe('Portada', () => {
  it('muestra título, porciones, momento, foto y valores antes de que llegue la receta', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    expect(screen.getByText('1 porción · cena')).toBeInTheDocument();
    expect(document.querySelector('img.plato-hero')).toHaveAttribute('src', `/api/catalogo${ruta}/foto`);
    expect(screen.getByText('720 kcal')).toBeInTheDocument();
    expect(screen.getByText('38 g proteína')).toBeInTheDocument();
    expect(screen.getByText('17 g fibra')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Abriendo la receta…');
  });

  it('sin foto no dibuja la imagen, y con más de una porción lo dice en plural', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSinFoto} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(document.querySelector('img.plato-hero')).toBeNull();
    expect(screen.getByText('2 porciones · almuerzo')).toBeInTheDocument();
  });

  it('la pestaña marca la versión elegida y avisa al cambiarla', () => {
    const alCambiarVersion = vi.fn();
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={alCambiarVersion} alVolver={nada} alEmpezar={nada} />);

    const pestanas = screen.getAllByRole('tab');
    expect(pestanas).toHaveLength(2);
    expect(pestanas[0]).toHaveAttribute('aria-selected', 'false');
    expect(pestanas[0]?.className).toBe('');
    expect(pestanas[1]).toHaveAttribute('aria-selected', 'true');
    expect(pestanas[1]).toHaveClass('on');
    expect(pestanas[1]).toHaveTextContent('Versión 2 · Dos etapas');
    expect(pestanas[1]).toHaveTextContent('11 + 10 min');

    fireEvent.click(pestanas[0] as HTMLElement);
    expect(alCambiarVersion).toHaveBeenCalledWith('linea-de-tiempo');
  });

  it('pide la receta de la versión elegida y muestra ingredientes y etapas', async () => {
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/dos-etapas`]: recetaDosEtapas });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByText('Ingredientes')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const ingredientes = screen.getAllByRole('listitem');
    expect(ingredientes).toHaveLength(3);
    expect(ingredientes[0]?.querySelector('img.ph')).toHaveAttribute('src', '/api/catalogo/ingredientes/brocoli-entero/foto');
    expect(ingredientes[0]).toHaveTextContent('½ pieza');
    expect(ingredientes[0]).toHaveAttribute('title', 'Brócoli fresco entero: ½ pieza, Flores, tallo y hojas');
    expect(ingredientes[1]?.querySelector('.ph-vacio')).toHaveTextContent(/^A$/);
    expect(ingredientes[2]?.querySelector('.ph-vacio')).toHaveTextContent(/^A$/);

    const etapas = screen.getAllByRole('article');
    expect(etapas).toHaveLength(2);
    expect(etapas[0]).toHaveClass('stage');
    expect(etapas[0]).not.toHaveClass('hot');
    expect(etapas[0]).toHaveTextContent('Etapa 1 · Preparación');
    expect(etapas[0]).toHaveTextContent('11 min');
    expect(etapas[0]).toHaveTextContent('Al abrir el freezer.');
    expect(etapas[0]).toHaveTextContent('3 pasos · 1 procesos en paralelo');
    expect(etapas[0]).not.toHaveTextContent('tiempo crítico');
    expect(etapas[0]).toHaveTextContent('Después puede haber pausa.');
    expect(etapas[1]).toHaveClass('hot');
    expect(etapas[1]).toHaveTextContent('5 pasos · 2 procesos en paralelo · 3 con tiempo crítico');
    expect(etapas[1]).not.toHaveTextContent('pausa');
  });

  it('el botón nombra la primera etapa cuando hay más de una, y dice el primer paso', async () => {
    const alEmpezar = vi.fn();
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/dos-etapas`]: recetaDosEtapas });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={alEmpezar} />);

    const boton = await screen.findByRole('button', { name: 'Empezar Etapa 1' });
    expect(screen.getByText('Primer paso: pesar y poner a descongelar los camarones')).toBeInTheDocument();

    fireEvent.click(boton);
    expect(alEmpezar).toHaveBeenCalledWith(recetaDosEtapas);
  });

  it('con una sola etapa el botón dice el tiempo total', async () => {
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/linea-de-tiempo`]: recetaUnaEtapa });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByRole('button', { name: 'Empezar · 16 min' })).toBeInTheDocument();
  });

  it('una etapa sin pasos no rompe la portada', async () => {
    const etapa = { ...(recetaDosEtapas.etapas[0] as (typeof recetaDosEtapas.etapas)[number]), pasos: [] };
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/dos-etapas`]: { ...recetaDosEtapas, etapas: [etapa] } });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByRole('button', { name: 'Empezar · 21 min' })).toBeInTheDocument();
    expect(screen.getByText('Primer paso:')).toBeInTheDocument();
  });

  it('una receta sin etapas ni pasos no rompe la portada', async () => {
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/dos-etapas`]: { ...recetaDosEtapas, etapas: [] } });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByRole('button', { name: 'Empezar · 21 min' })).toBeInTheDocument();
    expect(screen.getByText('Primer paso:')).toBeInTheDocument();
  });

  it('vuelve a pedir la receta cuando cambia la versión', async () => {
    const fetchImpl = vi.fn(fetchDeCatalogo({ [`${ruta}/dos-etapas`]: recetaDosEtapas, [`${ruta}/linea-de-tiempo`]: recetaUnaEtapa }));
    const { rerender } = render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    await screen.findByRole('button', { name: 'Empezar Etapa 1' });

    rerender(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(screen.getByRole('status')).toHaveTextContent('Abriendo la receta…');
    expect(await screen.findByRole('button', { name: 'Empezar · 16 min' })).toBeInTheDocument();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('la respuesta tardía de la versión anterior no pisa a la versión nueva', async () => {
    let resolverVieja: (v: { ok: boolean; status: number; json: () => Promise<unknown> }) => void = () => undefined;
    const fetchImpl: Fetch = (url) =>
      url.endsWith('/dos-etapas')
        ? new Promise((resolve) => {
            resolverVieja = resolve;
          })
        : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(recetaUnaEtapa) });
    const { rerender } = render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    rerender(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    await screen.findByRole('button', { name: 'Empezar · 16 min' });

    resolverVieja({ ok: true, status: 200, json: () => Promise.resolve(recetaDosEtapas) });
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByRole('button', { name: 'Empezar · 16 min' })).toBeInTheDocument();
  });

  it('un fallo tardío de la versión anterior tampoco pisa a la nueva', async () => {
    let rechazarVieja: (e: unknown) => void = () => undefined;
    const fetchImpl: Fetch = (url) =>
      url.endsWith('/dos-etapas')
        ? new Promise((_, reject) => {
            rechazarVieja = reject;
          })
        : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(recetaUnaEtapa) });
    const { rerender } = render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    rerender(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    await screen.findByRole('button', { name: 'Empezar · 16 min' });

    rechazarVieja(new Error('tarde'));
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error si la receta no se puede abrir', async () => {
    const fetchImpl = fetchDeCatalogo({}, { [`${ruta}/dos-etapas`]: 404 });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo abrir la receta: el catálogo respondió HTTP 404');
  });

  it('convierte a texto un fallo que no es un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject('se cortó');
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('se cortó');
  });

  it('vuelve a la lista', () => {
    const alVolver = vi.fn();
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={alVolver} alEmpezar={nada} />);

    fireEvent.click(screen.getByRole('button', { name: '‹ Recetas' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('ignora la respuesta si se desmonta antes de que llegue', async () => {
    let resolver: (v: { ok: boolean; status: number; json: () => Promise<unknown> }) => void = () => undefined;
    const fetchImpl: Fetch = () =>
      new Promise((resolve) => {
        resolver = resolve;
      });
    const { unmount } = render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    unmount();
    resolver({ ok: true, status: 200, json: () => Promise.resolve(recetaDosEtapas) });

    await Promise.resolve();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
