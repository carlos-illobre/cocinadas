import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MiseEnPlace } from './MiseEnPlace';
import { recetaDosEtapas } from './pruebas/datos';

const nada = () => undefined;

describe('MiseEnPlace', () => {
  it('lista utensilios e ingredientes con foto o ícono, y arranca con nada tildado', () => {
    render(<MiseEnPlace receta={recetaDosEtapas} alVolver={nada} alCocinar={nada} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeInTheDocument();
    expect(screen.getByText('Verificá que tenés todo antes de empezar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '6');
    expect(screen.getByRole('progressbar')).not.toHaveClass('completo');
    expect(screen.getByText('0 de 6 items')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Utensilios/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Ingredientes/ })).toBeInTheDocument();

    const items = screen.getAllByRole('button', { pressed: false });
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveTextContent('Wok Eternity 30 cm con su tapa');
    expect(items[0]?.querySelector('small')).toBeNull();
    expect(items[0]?.querySelector('img')).toHaveAttribute('src', '/api/catalogo/utensilios/wok-eternity-copper-30cm/foto');
    expect(items[1]?.querySelector('.mise-sin-foto')).toHaveTextContent('🔧');
    expect(items[3]?.querySelector('small')).toHaveTextContent('½ pieza');
    expect(items[3]?.querySelector('img')).toHaveAttribute('src', '/api/catalogo/ingredientes/brocoli-entero/foto');
    expect(items[4]?.querySelector('.mise-sin-foto')).toHaveTextContent('🥄');

    expect(screen.getByText('Marcá todos los items para continuar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Faltan 6 items' })).toBeDisabled();
  });

  it('tildar y destildar actualiza el progreso y el porcentaje', () => {
    render(<MiseEnPlace receta={recetaDosEtapas} alVolver={nada} alCocinar={nada} />);
    const wok = screen.getByRole('button', { name: /Wok Eternity/ });

    fireEvent.click(wok);
    expect(wok).toHaveAttribute('aria-pressed', 'true');
    expect(wok).toHaveClass('ok');
    expect(screen.getByText('1 de 6 items')).toBeInTheDocument();
    expect(screen.getByText('17%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar').querySelector('i')).toHaveStyle({ width: '17%' });
    expect(screen.getByRole('button', { name: 'Faltan 5 items' })).toBeDisabled();

    fireEvent.click(wok);
    expect(wok).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('0 de 6 items')).toBeInTheDocument();
  });

  it('con todo tildado se pone verde, habilita cocinar y avisa al tocar', () => {
    const alCocinar = vi.fn();
    render(<MiseEnPlace receta={recetaDosEtapas} alVolver={nada} alCocinar={alCocinar} />);

    for (const b of screen.getAllByRole('button', { pressed: false })) fireEvent.click(b);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '6');
    expect(screen.getByRole('progressbar')).toHaveClass('completo');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText('Marcá todos los items para continuar')).not.toBeInTheDocument();
    const cocinar = screen.getByRole('button', { name: 'Todo listo → Cocinar' });
    expect(cocinar).toBeEnabled();
    expect(cocinar).toHaveClass('verde');
    fireEvent.click(cocinar);
    expect(alCocinar).toHaveBeenCalledTimes(1);
  });

  it('una receta sin nada que preparar no habilita cocinar ni divide por cero', () => {
    render(<MiseEnPlace receta={{ ...recetaDosEtapas, utensilios: [], ingredientes: [] }} alVolver={nada} alCocinar={nada} />);
    expect(screen.getByText('0 de 0 items')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Faltan 0 items' })).toBeDisabled();
  });

  it('vuelve a la receta', () => {
    const alVolver = vi.fn();
    render(<MiseEnPlace receta={recetaDosEtapas} alVolver={alVolver} alCocinar={nada} />);
    fireEvent.click(screen.getByRole('button', { name: '‹ Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
