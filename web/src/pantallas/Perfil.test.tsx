import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Cocinada } from '../historial/almacen';
import { Perfil } from './Perfil';

function cocinada(fecha: string, real: number, extra: Partial<Cocinada> = {}): Cocinada {
  return {
    id: fecha,
    plato: 'pasta',
    nombre: 'Spaghetti',
    version: { clave: 'dos-etapas', titulo: 'Mise en place primero' },
    fecha,
    total_previsto_s: 1200,
    total_real_s: real,
    etapas: [],
    pasos: [],
    criticos: 3,
    criticosATiempo: 1,
    ...extra,
  };
}

function montar(cocinadas: readonly Cocinada[], xp: number, tema: 'claro' | 'oscuro' = 'claro') {
  const alCambiarTema = vi.fn();
  render(<Perfil cocinadas={cocinadas} xp={xp} tema={tema} alCambiarTema={alCambiarTema} version="0.3.0" />);
  return { alCambiarTema };
}

describe('Perfil', () => {
  it('sin cocinadas muestra el primer nivel, los números en cero y ningún logro', () => {
    montar([], 0);

    expect(screen.getByRole('heading', { level: 1, name: 'Aprendiz' })).toBeInTheDocument();
    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('500 XP para el nivel siguiente')).toBeInTheDocument();

    const numeros = document.querySelectorAll('.numero');
    expect(numeros[0]).toHaveTextContent('Recetas cocinadas');
    expect(numeros[0]?.querySelector('b')).toHaveTextContent('0');
    expect(numeros[1]?.querySelector('b')).toHaveTextContent('0');
    expect(numeros[3]?.querySelector('b')).toHaveTextContent('0/4');

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(document.querySelectorAll('.logro.pendiente')).toHaveLength(4);
    expect(screen.queryByText('Conseguido ✓')).not.toBeInTheDocument();
    expect(screen.getByText('Todavía no hay cocinadas guardadas.', { exact: false })).toBeInTheDocument();
  });

  it('con cocinadas cuenta recetas, minutos, experiencia y logros', () => {
    montar([cocinada('2026-09-01T10:00:00', 1200), cocinada('2026-09-02T10:00:00', 1800)], 190);

    expect(screen.getByRole('heading', { level: 1, name: 'Aprendiz' })).toBeInTheDocument();
    const numeros = document.querySelectorAll('.numero');
    expect(numeros[0]?.querySelector('b')).toHaveTextContent('2');
    // 1200 + 1800 s son 50 min.
    expect(numeros[1]?.querySelector('b')).toHaveTextContent('50');
    expect(numeros[2]?.querySelector('b')).toHaveTextContent('190');
    // Primera receta y «en tiempo» (una clavó los 1200 s previstos).
    expect(numeros[3]?.querySelector('b')).toHaveTextContent('2/4');
    expect(screen.getAllByText('Conseguido ✓')).toHaveLength(2);
    expect(screen.getByText('Suman 50:00 de cocina, guardadas en este teléfono.', { exact: false })).toBeInTheDocument();
  });

  it('el interruptor de tema dice a cuál se cambia y avisa', () => {
    const { alCambiarTema } = montar([], 0, 'oscuro');
    const boton = screen.getByRole('button', { name: 'Cambiar a modo claro' });
    fireEvent.click(boton);
    expect(alCambiarTema).toHaveBeenCalledTimes(1);
  });

  it('muestra la versión de la app', () => {
    montar([], 0);
    expect(screen.getByText('Cocinadas 0.3.0')).toBeInTheDocument();
  });
});
