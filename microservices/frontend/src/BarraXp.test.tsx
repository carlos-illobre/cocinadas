import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarraXp } from './BarraXp';

describe('BarraXp', () => {
  it('sin experiencia muestra el primer nivel vacío', () => {
    render(<BarraXp xp={0} />);
    expect(screen.getByText('Nivel 1 — Aprendiz')).toBeInTheDocument();
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('0 XP');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar').querySelector('i')).toHaveStyle({ width: '0%' });
    expect(screen.getByText('500 XP')).toBeInTheDocument();
  });

  it('a mitad del segundo nivel la barra va por la mitad', () => {
    render(<BarraXp xp={1000} />);
    expect(screen.getByText('Nivel 2 — Cocinero')).toBeInTheDocument();
    expect(document.querySelector('.xp-puntos')).toHaveTextContent('1000 XP');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('progressbar').querySelector('i')).toHaveStyle({ width: '50%' });
    expect(screen.getByText('1500 XP')).toBeInTheDocument();
  });
});
