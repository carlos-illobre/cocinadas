import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLAVE_EN_CURSO } from '../cocina/enCurso';
import { Recuperacion } from './Recuperacion';

function Revienta(): never {
  throw new Error('índice fuera de rango');
}

describe('Recuperacion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('sin errores no se nota', () => {
    render(
      <Recuperacion>
        <p>todo bien</p>
      </Recuperacion>,
    );
    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });

  it('ante un error descarta la cocinada en curso, lo dice y ofrece recargar', () => {
    // React vuelca el error en la consola además de pasarlo al límite: se silencia acá.
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem(CLAVE_EN_CURSO, '{"guardadoEn_ms":1,"estado":{"etapa":99}}');
    const recargar = vi.fn();
    render(
      <Recuperacion recargar={recargar}>
        <Revienta />
      </Recuperacion>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('La app se rompió al dibujar');
    expect(localStorage.getItem(CLAVE_EN_CURSO)).toBe('');
    expect(consola).toHaveBeenCalledWith('la app se rompió al dibujar', expect.any(Error), expect.any(String));
    fireEvent.click(screen.getByRole('button', { name: 'Volver a empezar' }));
    expect(recargar).toHaveBeenCalledTimes(1);
  });

  it('si el localStorage lanza, igual muestra la salida', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    render(
      <Recuperacion recargar={() => undefined}>
        <Revienta />
      </Recuperacion>,
    );
    expect(screen.getByRole('button', { name: 'Volver a empezar' })).toBeInTheDocument();
  });

  it('sin recargar inyectado, recarga la página', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reload = vi.fn();
    Object.defineProperty(window, 'location', { value: { reload }, configurable: true });
    render(
      <Recuperacion>
        <Revienta />
      </Recuperacion>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Volver a empezar' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
