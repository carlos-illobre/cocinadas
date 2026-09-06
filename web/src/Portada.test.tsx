import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Portada } from './Portada';
import { fetchDeCatalogo, nunca, recetaDosEtapas, recetaUnaEtapa, resumenSinFoto, resumenSpaghetti } from './pruebas/datos';
import type { Fetch } from './api';

const nada = () => undefined;
const ruta = '/recetas/spaghetti-integral-brocoli-camarones';

describe('Portada', () => {
  it('muestra la foto a sangre, el título y los valores antes de que llegue la receta', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaghetti integral');
    expect(document.querySelector('.detalle-foto')).toHaveAttribute('src', `api/catalogo${String(resumenSpaghetti.foto)}`);
    expect(document.querySelector('.detalle-hero')).not.toHaveClass('sin-foto');

    const valores = document.querySelectorAll('.valor');
    expect(valores).toHaveLength(4);
    // El tiempo es el del modo elegido: mise en place primero, 21 min.
    expect(valores[0]).toHaveTextContent('21 min');
    expect(valores[0]).toHaveTextContent('Tiempo');
    expect(valores[1]).toHaveTextContent('1');
    expect(valores[1]).toHaveTextContent('Porciones');
    expect(valores[2]).toHaveTextContent('720 kcal');
    expect(valores[3]).toHaveTextContent('38 g');
    expect(valores[3]).toHaveTextContent('Proteína');

    expect(screen.getByRole('status')).toHaveTextContent('Abriendo la receta…');
    expect(screen.queryByRole('button', { name: /Comenzar/ })).not.toBeInTheDocument();
  });

  it('sin foto usa una cabecera lisa, y sin más de un modo no ofrece elegir', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSinFoto} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(document.querySelector('.detalle-foto')).toBeNull();
    expect(document.querySelector('.detalle-hero')).toHaveClass('sin-foto');
    expect(document.querySelectorAll('.valor')[0]).toHaveTextContent('25 min');
    expect(screen.queryByRole('tablist', { name: 'Modo de preparación' })).not.toBeInTheDocument();
  });

  it('si la versión pedida no existe, el tiempo es el del modo propuesto', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="inexistente" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(document.querySelectorAll('.valor')[0]).toHaveTextContent('21 min');
    expect(screen.queryAllByRole('tab', { selected: true })).toHaveLength(0);
  });

  it('un resumen sin versiones muestra 0 min', () => {
    render(<Portada fetchImpl={nunca} resumen={{ ...resumenSinFoto, versiones: [] }} version="x" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(document.querySelectorAll('.valor')[0]).toHaveTextContent('0 min');
  });

  it('el título pide elegir y el «?» explica qué se elige', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Seleccioná el modo de preparación' })).toBeInTheDocument();
    const ayuda = screen.getByRole('button', { name: 'Qué es el modo de preparación' });
    expect(ayuda).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/cambia el orden de los pasos/)).not.toBeInTheDocument();

    fireEvent.click(ayuda);
    expect(ayuda).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/cambia el orden de los pasos/)).toBeInTheDocument();

    fireEvent.click(ayuda);
    expect(screen.queryByText(/cambia el orden de los pasos/)).not.toBeInTheDocument();
  });

  it('sin más de un modo no hay título ni ayuda', () => {
    render(<Portada fetchImpl={nunca} resumen={resumenSinFoto} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(screen.queryByRole('button', { name: 'Qué es el modo de preparación' })).not.toBeInTheDocument();
  });

  it('los modos van de la más lenta a la más rápida, con ícono, tiempo y resumen, y avisan al elegir', () => {
    const alCambiarVersion = vi.fn();
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={alCambiarVersion} alVolver={nada} alEmpezar={nada} />);

    const modos = screen.getAllByRole('tab', { name: /Mise en place primero|Flujo continuo/ });
    expect(modos).toHaveLength(2);
    expect(modos[0]).toHaveTextContent('🎯');
    expect(modos[0]).toHaveTextContent('Mise en place primero');
    expect(modos[0]).toHaveTextContent('21 min');
    expect(modos[0]).toHaveTextContent('Primero se prepara todo sin apuro.');
    expect(modos[0]).toHaveAttribute('aria-selected', 'true');
    expect(modos[0]).toHaveClass('on');
    expect(modos[0]?.querySelector('.circulo')).toHaveTextContent('✓');
    expect(modos[1]).toHaveTextContent('⚡');
    expect(modos[1]).toHaveTextContent('Flujo continuo');
    expect(modos[1]).toHaveTextContent('16 min');
    expect(modos[1]).toHaveAttribute('aria-selected', 'false');
    expect(modos[1]?.className).toBe('modo');
    expect(modos[1]?.querySelector('.circulo')).toHaveTextContent('');

    fireEvent.click(modos[1] as HTMLElement);
    expect(alCambiarVersion).toHaveBeenCalledWith('linea-de-tiempo');
  });

  it('con la receta muestra ingredientes y utensilios, y el botón de comenzar', async () => {
    const alEmpezar = vi.fn();
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/dos-etapas`]: recetaDosEtapas });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={alEmpezar} />);

    const boton = await screen.findByRole('button', { name: 'Comenzar · 21 min →' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    const solapaIngredientes = screen.getByRole('tab', { name: 'Ingredientes' });
    expect(solapaIngredientes).toHaveAttribute('aria-selected', 'true');
    const ingredientes = document.querySelectorAll('.fila');
    expect(ingredientes).toHaveLength(3);
    expect(ingredientes[0]?.querySelector('.fila-nombre')).toHaveTextContent('Brócoli fresco entero');
    expect(ingredientes[0]?.querySelector('.fila-cantidad')).toHaveTextContent('½ pieza');
    expect(ingredientes[0]?.querySelector('img.fila-foto')).toHaveAttribute('src', 'api/catalogo/fotos/ingredientes/brocoli-entero.jpg');
    // Sin ficha con foto, el ícono de su tipo.
    expect(ingredientes[1]?.querySelector('.fila-foto.sin-foto')).toHaveTextContent('🥄');

    const solapaUtensilios = screen.getByRole('tab', { name: 'Utensilios' });
    fireEvent.click(solapaUtensilios);
    expect(solapaUtensilios).toHaveAttribute('aria-selected', 'true');
    expect(solapaIngredientes.className).toBe('');
    const utensilios = document.querySelectorAll('.fila');
    expect(utensilios).toHaveLength(3);
    expect(utensilios[0]).toHaveTextContent('Wok Eternity 30 cm con su tapa');
    expect(utensilios[0]?.querySelector('img.fila-foto')).toHaveAttribute('src', 'api/catalogo/fotos/utensilios/wok-eternity-copper-30cm.jpg');
    expect(utensilios[1]?.querySelector('.fila-foto.sin-foto')).toHaveTextContent('🔧');
    expect(utensilios[0]?.querySelector('.fila-cantidad')).toBeNull();
    fireEvent.click(solapaIngredientes);
    expect(solapaIngredientes).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(boton);
    expect(alEmpezar).toHaveBeenCalledWith(recetaDosEtapas);
  });

  it('con el modo rápido el botón dice su tiempo', async () => {
    const fetchImpl = fetchDeCatalogo({ [`${ruta}/linea-de-tiempo`]: recetaUnaEtapa });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(await screen.findByRole('button', { name: 'Comenzar · 16 min →' })).toBeInTheDocument();
  });

  it('vuelve a pedir la receta cuando cambia la versión', async () => {
    const fetchImpl = vi.fn(fetchDeCatalogo({ [`${ruta}/dos-etapas`]: recetaDosEtapas, [`${ruta}/linea-de-tiempo`]: recetaUnaEtapa }));
    const { rerender } = render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    await screen.findByRole('button', { name: 'Comenzar · 21 min →' });

    rerender(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="linea-de-tiempo" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);

    expect(screen.getByRole('status')).toHaveTextContent('Abriendo la receta…');
    expect(await screen.findByRole('button', { name: 'Comenzar · 16 min →' })).toBeInTheDocument();
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
    await screen.findByRole('button', { name: 'Comenzar · 16 min →' });

    resolverVieja({ ok: true, status: 200, json: () => Promise.resolve(recetaDosEtapas) });
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByRole('button', { name: 'Comenzar · 16 min →' })).toBeInTheDocument();
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
    await screen.findByRole('button', { name: 'Comenzar · 16 min →' });

    rechazarVieja(new Error('tarde'));
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error si la receta no se puede abrir', async () => {
    const fetchImpl = fetchDeCatalogo({}, { [`${ruta}/dos-etapas`]: 404 });
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo abrir la receta: el catálogo respondió HTTP 404');
    expect(screen.queryByRole('button', { name: /Comenzar/ })).not.toBeInTheDocument();
  });

  it('convierte a texto un fallo que no es un Error', async () => {
    const fetchImpl: Fetch = () => Promise.reject('se cortó');
    render(<Portada fetchImpl={fetchImpl} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={nada} alEmpezar={nada} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('se cortó');
  });

  it('vuelve a la lista', () => {
    const alVolver = vi.fn();
    render(<Portada fetchImpl={nunca} resumen={resumenSpaghetti} version="dos-etapas" alCambiarVersion={nada} alVolver={alVolver} alEmpezar={nada} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a las recetas' }));
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
    expect(document.querySelector('.fila')).toBeNull();
  });
});
