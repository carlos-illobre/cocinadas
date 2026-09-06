import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grafico, Historial } from './Historial';
import { progresoPorReceta, type Cocinada } from './historial/almacen';

function cocinada(id: string, fecha: string, real: number, plato = 'pasta', extra: Partial<Cocinada> = {}): Cocinada {
  return {
    id,
    plato,
    nombre: plato === 'pasta' ? 'Spaghetti integral con brócoli' : 'Merluza al limón',
    version: { clave: 'dos-etapas', titulo: 'Mise en place primero' },
    fecha,
    total_previsto_s: 1260,
    total_real_s: real,
    etapas: [],
    pasos: [],
    criticos: 6,
    criticosATiempo: 5,
    ...extra,
  };
}

describe('Historial', () => {
  it('sin cocinadas explica cómo empezar', () => {
    render(<Historial cocinadas={[]} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Progreso' })).toBeInTheDocument();
    expect(screen.getByText(/Todavía no hay cocinadas guardadas/)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('con una receta muestra el gráfico, mejor, promedio y los intentos del más reciente al primero', () => {
    const lista = [cocinada('1', '2026-09-01T10:00:00Z', 1400), cocinada('2', '2026-09-03T10:00:00Z', 1260), cocinada('3', '2026-09-05T10:00:00Z', 1200)];
    render(<Historial cocinadas={lista} />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Spaghetti integral con brócoli');
    expect(screen.getByRole('img', { name: /Tiempo total de cada intento/ })).toBeInTheDocument();

    const kpis = document.querySelectorAll('.kpi');
    expect(kpis[0]).toHaveTextContent('20:00');
    expect(kpis[0]).toHaveTextContent('objetivo 21:00');
    expect(kpis[1]).toHaveTextContent('21:27');
    expect(kpis[1]).toHaveTextContent('3 intentos');

    const intentos = screen.getAllByRole('listitem');
    expect(intentos).toHaveLength(3);
    expect(intentos[0]).toHaveTextContent('20:00');
    expect(intentos[0]?.querySelector('.d')).toHaveClass('minus');
    expect(intentos[0]?.querySelector('.d')).toHaveTextContent('−1:00');
    expect(intentos[1]?.querySelector('.d')).toHaveTextContent('justo');
    expect(intentos[2]?.querySelector('.d')).toHaveClass('plus');
    expect(intentos[2]?.querySelector('.d')).toHaveTextContent('+2:20');
    expect(intentos[0]).toHaveTextContent('críticos a tiempo 5 / 6');
  });

  it('con un solo intento lo dice en singular', () => {
    render(<Historial cocinadas={[cocinada('1', '2026-09-01T10:00:00Z', 1400)]} />);
    expect(document.querySelectorAll('.kpi')[1]).toHaveTextContent('1 intento');
  });

  it('con varias recetas ofrece elegir cuál ver', () => {
    const lista = [cocinada('1', '2026-09-01T10:00:00Z', 1400), cocinada('9', '2026-09-02T10:00:00Z', 900, 'merluza', { total_previsto_s: 1000 })];
    render(<Historial cocinadas={lista} />);

    const pestanas = screen.getAllByRole('tab');
    expect(pestanas).toHaveLength(2);
    expect(pestanas[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Spaghetti');

    fireEvent.click(pestanas[1] as HTMLElement);
    expect(pestanas[1]).toHaveAttribute('aria-selected', 'true');
    expect(pestanas[1]).toHaveClass('on');
    expect(pestanas[0]?.className).toBe('');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Merluza');
    expect(document.querySelectorAll('.kpi')[0]).toHaveTextContent('15:00');
  });
});

describe('Grafico', () => {
  it('dibuja una barra por intento, verde dentro del objetivo y coral pasado, con el eje en minutos redondos', () => {
    const [p] = progresoPorReceta([cocinada('1', '2026-09-01T10:00:00Z', 1400), cocinada('2', '2026-09-03T10:00:00Z', 1200)]);
    const { container } = render(<Grafico progreso={p as NonNullable<typeof p>} />);

    const barras = container.querySelectorAll('.grafico-barra');
    expect(barras).toHaveLength(2);
    expect(barras[0]).toHaveClass('pasado');
    expect(barras[1]).not.toHaveClass('pasado');
    // Techo de 25 min (máximo 23:20 redondeado a múltiplo de 5), marcas en 0, 13 y 25.
    const ejes = [...container.querySelectorAll('.grafico-eje')].map((e) => e.textContent);
    expect(ejes).toEqual(expect.arrayContaining(['0 min', '13 min', '25 min', 'objetivo', '1', '2']));
    expect([...container.querySelectorAll('.grafico-valor')].map((e) => e.textContent)).toEqual(['23:20', '20:00']);
  });

  it('con tiempos cortos el techo mínimo es 1 min', () => {
    const [p] = progresoPorReceta([cocinada('1', '2026-09-01T10:00:00Z', 20, 'pasta', { total_previsto_s: 30 })]);
    const { container } = render(<Grafico progreso={p as NonNullable<typeof p>} />);
    expect([...container.querySelectorAll('.grafico-eje')].map((e) => e.textContent)).toEqual(expect.arrayContaining(['0 min', '1 min']));
  });
});
