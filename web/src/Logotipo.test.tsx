import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logotipo } from './Logotipo';

describe('Logotipo', () => {
  it('escribe el nombre como texto, no como imagen', () => {
    const { container } = render(<Logotipo />);

    expect(screen.getByText('Cocinadas')).toBeInTheDocument();
    // La olla sigue siendo imagen, pero decorativa: el nombre ya lo da el texto.
    const olla = container.querySelector('img.logotipo-olla');
    expect(olla).toHaveAttribute('src', 'icono-192.png');
    expect(olla).toHaveAttribute('alt', '');
    expect(container.querySelector('.logotipo')).not.toHaveAttribute('aria-hidden');
  });

  it('agrega la clase que le pasan sin perder la propia', () => {
    const { container } = render(<Logotipo className="inicio-logo" />);

    expect(container.querySelector('.logotipo')).toHaveClass('inicio-logo');
  });

  it('sin clase extra no deja un espacio colgando en el atributo', () => {
    const { container } = render(<Logotipo />);

    expect(container.querySelector('span')?.getAttribute('class')).toBe('logotipo');
  });

  it('decorativo se esconde de los lectores de pantalla, para no repetir el nombre', () => {
    const { container } = render(<Logotipo decorativo />);

    expect(container.querySelector('.logotipo')).toHaveAttribute('aria-hidden', 'true');
  });
});
