/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Un solo React en memoria. Si react y react-dom se resuelven por rutas distintas (en
  // Windows pasa cuando pnpm instaló desde una ruta con otra capitalización que la real:
  // los enlaces de node_modules guardan la que se usó), los hooks fallan con «Cannot read
  // properties of null (reading 'useState')». Ver docs/TESTING.md, «Windows».
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/pruebas/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      // Exclusiones justificadas una por una (docs/TESTING.md):
      //   - main.tsx: raíz de composición; monta <App/> en el DOM y nada más.
      //   - catalogo/generar.ts: escribe a disco lo que planificar() decidió; sin
      //     decisiones propias, y corre en el build y no en el navegador.
      //   - pruebas/**: utilidades de las propias pruebas.
      //   - *.test.*: las pruebas no se miden a sí mismas.
      exclude: ['src/main.tsx', 'src/catalogo/generar.ts', 'src/pruebas/**', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        lines: 100,
        statements: 100,
        branches: 100,
        functions: 100,
      },
    },
  },
});
