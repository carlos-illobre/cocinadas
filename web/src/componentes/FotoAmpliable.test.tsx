import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('la miniatura y la grande comparten el nombre de transición, y solo una lo lleva a la vez', () => {
    render(<FotoAmpliable src="api/catalogo/fotos/ingredientes/brocoli.webp" srcGrande="grande.webp" nombre="Brócoli" className="ph" />);
    const chica = screen.getByRole('button', { name: 'Ver la foto de Brócoli' }).querySelector('img') as HTMLImageElement;
    expect(chica.style.viewTransitionName).toBe('foto-api-catalogo-fotos-ingredientes-brocoli-webp');
    fireEvent.click(chica);
    const grande = screen.getByRole('button', { name: 'Cerrar la foto de Brócoli' }).querySelector('img') as HTMLImageElement;
    expect(grande.style.viewTransitionName).toBe('foto-api-catalogo-fotos-ingredientes-brocoli-webp');
    expect(chica.style.viewTransitionName).toBe('none');
  });

  describe('con la View Transitions API', () => {
    afterEach(() => {
      Reflect.deleteProperty(document, 'startViewTransition');
    });

    it('abre y cierra dentro de una transición cuando el navegador la tiene', () => {
      const startViewTransition = vi.fn((cambio: () => void) => {
        cambio();
      });
      Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true });
      render(<FotoAmpliable src="chica.webp" nombre="Wok" className="ph" />);
      fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Wok' }));
      expect(screen.getByRole('button', { name: 'Cerrar la foto de Wok' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }));
      expect(screen.queryByRole('button', { name: /Cerrar la foto/ })).not.toBeInTheDocument();
      expect(startViewTransition).toHaveBeenCalledTimes(2);
    });
  });
});
