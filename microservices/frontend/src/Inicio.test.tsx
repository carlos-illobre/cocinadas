import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Inicio } from './Inicio';

describe('Inicio', () => {
  it('muestra el logo con el nombre del producto, el lema y el botón', () => {
    render(<Inicio alEmpezar={() => undefined} />);

    expect(screen.getByRole('img', { name: 'Templa' })).toHaveAttribute('src', '/logo.png');
    expect(screen.getByText('Tu receta, al punto justo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument();
  });

  it('usa la foto de la mesada como fondo decorativo', () => {
    const { container } = render(<Inicio alEmpezar={() => undefined} />);
    const fondo = container.querySelector('img.inicio-fondo');

    expect(fondo).toHaveAttribute('src', '/inicio.jpg');
    expect(fondo).toHaveAttribute('alt', '');
  });

  it('avisa una sola vez al tocar Empezar', () => {
    const alEmpezar = vi.fn();
    render(<Inicio alEmpezar={alEmpezar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));

    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });
});
