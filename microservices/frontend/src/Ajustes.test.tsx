import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Ajustes } from './Ajustes';

const nada = () => undefined;

describe('Ajustes', () => {
  it('muestra la versión, las cocinadas y el estado de los servicios', () => {
    render(<Ajustes tema="claro" alCambiarTema={nada} alVerEstado={nada} cocinadasGuardadas={0} version="0.3.0" />);

    expect(screen.getByText('Templa 0.3.0')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay cocinadas guardadas.', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Estado de los servicios ›' })).toBeInTheDocument();
  });

  it('en claro ofrece pasar a oscuro, y en oscuro a claro', () => {
    const alCambiarTema = vi.fn();
    const { rerender } = render(<Ajustes tema="claro" alCambiarTema={alCambiarTema} alVerEstado={nada} cocinadasGuardadas={0} version="0.3.0" />);
    const aOscuro = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    expect(aOscuro.querySelector('.boton-tema-icono')).toHaveTextContent('🌙');
    fireEvent.click(aOscuro);
    expect(alCambiarTema).toHaveBeenCalledTimes(1);

    rerender(<Ajustes tema="oscuro" alCambiarTema={alCambiarTema} alVerEstado={nada} cocinadasGuardadas={0} version="0.3.0" />);
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' }).querySelector('.boton-tema-icono')).toHaveTextContent('☀️');
  });

  it.each([
    [1, 'Hay 1 cocinada guardada en este teléfono.'],
    [4, 'Hay 4 cocinadas guardadas en este teléfono.'],
  ])('cuenta las cocinadas guardadas (%i)', (n, texto) => {
    render(<Ajustes tema="claro" alCambiarTema={nada} alVerEstado={nada} cocinadasGuardadas={n} version="0.3.0" />);
    expect(screen.getByText(texto, { exact: false })).toBeInTheDocument();
  });

  it('abre el estado de los servicios', () => {
    const alVerEstado = vi.fn();
    render(<Ajustes tema="claro" alCambiarTema={nada} alVerEstado={alVerEstado} cocinadasGuardadas={0} version="0.3.0" />);
    fireEvent.click(screen.getByRole('button', { name: 'Estado de los servicios ›' }));
    expect(alVerEstado).toHaveBeenCalledTimes(1);
  });
});
