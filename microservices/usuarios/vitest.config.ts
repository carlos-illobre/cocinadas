import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // `all` mide también los archivos que ninguna prueba importa: sin esto, un módulo
      // olvidado cuenta como cubierto por omisión y la compuerta deja de decir la verdad.
      all: true,
      include: ['src/**/*.ts'],
      // Exclusiones justificadas una por una (docs/TESTING.md). Solo adaptadores de
      // infraestructura sin ninguna decisión propia:
      //   - server.ts: raíz de composición; solo lee la configuración, arma la app y llama
      //     a listen. Cualquier decisión que aparezca acá se extrae a un módulo medible.
      //   - infra/**: clientes de sistemas externos (NATS y PostgreSQL). Configuran el cliente real y
      //     no se pueden ejercitar sin él.
      exclude: ['src/server.ts', 'src/infra/**'],
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
