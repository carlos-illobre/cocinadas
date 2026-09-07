import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FotoAmpliable } from './FotoAmpliable';

describe('FotoAmpliable', () => {
  it('se amplía al tocar la miniatura y se cierra tocando en cualquier lado', () => {
    render(<FotoAmpliable src="api/catalogo/fotos/ingredientes/brocoli.webp" nombre="Brócoli fresco entero" className="ph" />);
    expect(screen.queryByRole('button', { name: /Cerrar la foto/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver la foto de Brócoli fresco entero' }).querySelector('img.ph')).toHaveAttribute('src', 'api/catalogo/fotos/ingredientes/brocoli.webp');

    fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Brócoli fresco entero' }));
    const ampliada = screen.getByRole('button', { name: 'Cerrar la foto de Brócoli fresco entero' });
    expect(ampliada.querySelector('img')).toHaveAttribute('alt', 'Brócoli fresco entero');
    expect(ampliada).toHaveTextContent('Tocá para cerrar');

    fireEvent.click(ampliada);
    expect(screen.queryByRole('button', { name: /Cerrar la foto/ })).not.toBeInTheDocument();
  });

  it('ampliada usa la versión grande si la hay', () => {
    render(<FotoAmpliable src="chica.webp" srcGrande="grande.webp" nombre="Wok" className="ph" />);
    expect(screen.getByRole('button', { name: 'Ver la foto de Wok' }).querySelector('img')).toHaveAttribute('src', 'chica.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Wok' }));
    expect(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }).querySelector('img')).toHaveAttribute('src', 'grande.webp');
  });
});
