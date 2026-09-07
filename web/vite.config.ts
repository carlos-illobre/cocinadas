/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Rutas relativas en todo lo que emite el build. GitHub Pages sirve el sitio de un
  // repositorio en `/<repo>/` y no en la raíz, así que con rutas absolutas el navegador
  // pediría `/logo.png` en vez de `/cocinadas/logo.png`. Con `./` el mismo bundle sirve
  // igual en una subcarpeta, en la raíz de un dominio propio o abierto desde el disco,
  // sin que el nombre del repositorio aparezca en ningún lado.
  //
  // Esto funciona porque la app NO cambia la URL: `avanzar` en App.tsx hace
  // `pushState(null, '')` sin tercer argumento, así que la barra de direcciones se queda
  // siempre en la base y toda ruta relativa se resuelve contra el mismo lugar. El día que
  // haya enlaces profundos de verdad (/receta/...), esto hay que revisarlo.
  base: './',
  // Un solo React en memoria. Si react y react-dom se resuelven por rutas distintas (en
  // Windows pasa cuando pnpm instaló desde una ruta con otra capitalización que la real:
  // los enlaces de node_modules guardan la que se usó), los hooks fallan con «Cannot read
  // properties of null (reading 'useState')». Ver docs/TESTING.md, «Windows».
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/pruebas/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'herramientas/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      // `herramientas/` son los scripts de build: corren en Node, no en el navegador,
      // pero su lógica se mide con la misma compuerta (docs/TESTING.md).
      include: ['src/**/*.{ts,tsx}', 'herramientas/**/*.ts'],
      // Exclusiones justificadas una por una (docs/TESTING.md):
      //   - main.tsx: raíz de composición; monta <App/> en el DOM y nada más.
      //   - herramientas/catalogo/generar.ts: escribe a disco lo que planificar() decidió; sin
      //     decisiones propias, y corre en el build y no en el navegador.
      //   - herramientas/imagenes/optimizar.ts: maneja el navegador que convierte las imágenes y
      //     escribe los archivos. Qué convertir y a cuánto lo decide plan.ts, que sí se
      //     mide. Corre a mano con `pnpm optimizar`, no en el build.
      //   - pruebas/**: utilidades de las propias pruebas.
      //   - *.test.*: las pruebas no se miden a sí mismas.
      exclude: ['src/main.tsx', 'herramientas/catalogo/generar.ts', 'herramientas/imagenes/optimizar.ts', 'src/pruebas/**', '**/*.test.{ts,tsx}'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 100,
        statements: 100,
        branches: 100,
        functions: 100,
      },
    },
  },
});
