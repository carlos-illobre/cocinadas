import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grafico } from './Grafico';
import { Historial } from './Historial';
import { progresoPorReceta, type Cocinada } from '../historial/almacen';

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
  it('un punto por intento, unidos por una línea, con el objetivo como línea del medio y una escala simétrica', () => {
    const p = progresoPorReceta([cocinada('a', '2026-09-01T10:00:00', 1400), cocinada('b', '2026-09-02T10:00:00', 1200)])[0];
    const { container } = render(<Grafico progreso={p as NonNullable<typeof p>} />);

    const puntos = container.querySelectorAll('.grafico-punto');
    expect(puntos).toHaveLength(2);
    // 1400 contra 1260 previstos es un 11 %: lejos. 1200 es un 5 %: cerca.
    expect(puntos[0]).toHaveClass('lejos');
    expect(puntos[1]).not.toHaveClass('lejos');
    expect(container.querySelectorAll('.grafico-linea')).toHaveLength(1);
    expect(container.querySelectorAll('.grafico-objetivo')).toHaveLength(1);

    // La escala: el desvío mayor es 140 s; con el 25 % de aire son 175 a cada lado del objetivo.
    const ejes = [...container.querySelectorAll('.grafico-eje')].map((e) => e.textContent);
    expect(ejes).toEqual(expect.arrayContaining(['23:55', '21:00', '18:05', 'objetivo', '1', '2']));
    expect([...container.querySelectorAll('.grafico-valor')].map((e) => e.textContent)).toEqual(['23:20', '20:00']);

    // El objetivo queda exactamente en el medio del alto útil, y el punto pasado por arriba.
    const objetivo = Number(container.querySelector('.grafico-objetivo')?.getAttribute('y1'));
    const [arriba, abajo] = [puntos[0], puntos[1]].map((c) => Number(c?.getAttribute('cy')));
    expect(arriba).toBeLessThan(objetivo);
    expect(abajo).toBeGreaterThan(objetivo);
  });

  it('con un solo intento no hay línea que unir, y la escala tiene un piso para que el objetivo no quede en el borde', () => {
    const p = progresoPorReceta([cocinada('a', '2026-09-01T10:00:00', 1260)])[0];
    const { container } = render(<Grafico progreso={p as NonNullable<typeof p>} />);
    expect(container.querySelectorAll('.grafico-linea')).toHaveLength(0);
    // Desvío 0: el rango cae al piso, el 10 % del objetivo (126 s).
    expect([...container.querySelectorAll('.grafico-eje')].map((e) => e.textContent)).toEqual(expect.arrayContaining(['23:06', '21:00', '18:54']));
  });
});
