import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FotoAmpliable } from './FotoAmpliable';

describe('FotoAmpliable', () => {
  /** La grande que se está bajando: un `<img hidden>` que existe hasta que carga. */
  const grandeOculta = (): HTMLImageElement | null => document.querySelector('img[hidden]');

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

  it('se amplía al instante con la chica, y la grande la reemplaza cuando llega', () => {
    render(<FotoAmpliable src="chica.webp" srcGrande="grande.webp" nombre="Wok" className="ph" />);
    expect(grandeOculta()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Wok' }));
    const ampliada = screen.getByRole('button', { name: 'Cerrar la foto de Wok' });
    expect(ampliada.querySelector('img')).toHaveAttribute('src', 'chica.webp');
    expect(grandeOculta()).toHaveAttribute('src', 'grande.webp');
    fireEvent.load(grandeOculta() as HTMLImageElement);
    expect(ampliada.querySelector('img')).toHaveAttribute('src', 'grande.webp');
    expect(grandeOculta()).toBeNull();
  });

  it('baja la grande apenas la chica se ve, así al tocarla ya está', () => {
    render(<FotoAmpliable src="chica.webp" srcGrande="grande.webp" nombre="Wok" className="ph" />);
    const chica = screen.getByRole('button', { name: 'Ver la foto de Wok' }).querySelector('img') as HTMLImageElement;
    fireEvent.load(chica);
    fireEvent.load(grandeOculta() as HTMLImageElement);
    fireEvent.click(chica);
    expect(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }).querySelector('img')).toHaveAttribute('src', 'grande.webp');
  });

  it('si la grande no llega, la ampliada se queda con la chica', () => {
    render(<FotoAmpliable src="chica.webp" srcGrande="grande.webp" nombre="Wok" className="ph" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Wok' }));
    fireEvent.error(grandeOculta() as HTMLImageElement);
    expect(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }).querySelector('img')).toHaveAttribute('src', 'chica.webp');
  });

  it('sin la API, la miniatura no lleva nombre de transición: solo lo lleva la grande, que es la única a la vez', () => {
    render(<FotoAmpliable src="api/catalogo/fotos/ingredientes/brocoli.webp" srcGrande="grande.webp" nombre="Brócoli" className="ph" />);
    const chica = screen.getByRole('button', { name: 'Ver la foto de Brócoli' }).querySelector('img') as HTMLImageElement;
    // Una miniatura quieta no lleva nombre: si lo llevara, flotaría sobre el fondo en las transiciones de las otras.
    expect(chica.style.viewTransitionName).toBe('none');
    fireEvent.click(chica);
    const grande = screen.getByRole('button', { name: 'Cerrar la foto de Brócoli' }).querySelector('img') as HTMLImageElement;
    expect(grande.style.viewTransitionName).toBe('foto-api-catalogo-fotos-ingredientes-brocoli-webp');
    expect(chica.style.viewTransitionName).toBe('none');
  });

  describe('con la View Transitions API', () => {
    afterEach(() => {
      Reflect.deleteProperty(document, 'startViewTransition');
    });

    it('abre y cierra dentro de una transición, y la miniatura lleva el nombre solo mientras dura', async () => {
      let terminar = (): void => undefined;
      const startViewTransition = vi.fn((cambio: () => void) => {
        cambio();
        return { finished: new Promise<void>((resolve) => { terminar = resolve; }) };
      });
      Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true });
      render(<FotoAmpliable src="chica.webp" nombre="Wok" className="ph" />);
      const chica = screen.getByRole('button', { name: 'Ver la foto de Wok' }).querySelector('img') as HTMLImageElement;

      fireEvent.click(screen.getByRole('button', { name: 'Ver la foto de Wok' }));
      // Abierta: el nombre pasa a la grande.
      expect(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }).querySelector('img')?.style.viewTransitionName).toBe('foto-chica-webp');
      expect(chica.style.viewTransitionName).toBe('none');
      await act(async () => { terminar(); await Promise.resolve(); });

      fireEvent.click(screen.getByRole('button', { name: 'Cerrar la foto de Wok' }));
      // Cerrando: la miniatura vuelve a llevar el nombre mientras dura la transición…
      expect(chica.style.viewTransitionName).toBe('foto-chica-webp');
      await act(async () => { terminar(); await Promise.resolve(); });
      // …y lo suelta cuando termina.
      expect(chica.style.viewTransitionName).toBe('none');
      expect(startViewTransition).toHaveBeenCalledTimes(2);
    });
  });
});
