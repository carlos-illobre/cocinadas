import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BotonTema } from './BotonTema';

describe('BotonTema', () => {
  it('muestra la luna en claro y el sol en oscuro, dice a cuál se pasa, y avisa', () => {
    const alCambiar = vi.fn();
    const { rerender } = render(<BotonTema tema="claro" alCambiar={alCambiar} />);
    const boton = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    expect(boton).toHaveTextContent('🌙');
    fireEvent.click(boton);
    expect(alCambiar).toHaveBeenCalledTimes(1);

    rerender(<BotonTema tema="oscuro" alCambiar={alCambiar} />);
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toHaveTextContent('☀️');
  });
});
