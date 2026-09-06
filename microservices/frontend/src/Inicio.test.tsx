import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Inicio } from './Inicio';

describe('Inicio', () => {
  it('muestra el logo, el lema y las dos formas de entrar', () => {
    render(<Inicio alEntrar={() => undefined} />);

    expect(screen.getByRole('img', { name: 'Templa' })).toHaveAttribute('src', '/logo.png');
    expect(screen.getByText('Tu receta, al punto justo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar sin cuenta' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('arma la escena con el fondo en JPEG y los vegetales en WebP, anclados arriba y abajo', () => {
    const { container } = render(<Inicio alEntrar={() => undefined} />);

    expect(container.querySelector('img.inicio-fondo')).toHaveAttribute('src', '/inicio/1.jpg');
    const arriba = [...container.querySelectorAll('.inicio-capas.arriba img')];
    const abajo = [...container.querySelectorAll('.inicio-capas.abajo img')];
    expect(arriba.map((c) => c.getAttribute('src'))).toEqual(['/inicio/2.webp', '/inicio/3.webp', '/inicio/4.webp', '/inicio/5.webp', '/inicio/6.webp']);
    // La hoja (10) va antes que los tallarines (9), así queda debajo.
    expect(abajo.map((c) => c.getAttribute('src'))).toEqual(['/inicio/7.webp', '/inicio/8.webp', '/inicio/10.webp', '/inicio/9.webp']);
    // Decorativas: el nombre del producto lo da el logo.
    expect([...arriba, ...abajo].every((c) => c.getAttribute('alt') === '')).toBe(true);
    expect(container.querySelector('.inicio-escena')).toHaveAttribute('aria-hidden', 'true');
  });

  it('entrar sin cuenta avisa a quien la monta', () => {
    const alEntrar = vi.fn();
    render(<Inicio alEntrar={alEntrar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar sin cuenta' }));

    expect(alEntrar).toHaveBeenCalledTimes(1);
  });

  it('Google todavía no puede entrar, y lo dice sin sacar a nadie de la pantalla', () => {
    const alEntrar = vi.fn();
    render(<Inicio alEntrar={alEntrar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(screen.getByRole('status')).toHaveTextContent('falta el servicio de usuarios');
    expect(alEntrar).not.toHaveBeenCalled();
  });
});
