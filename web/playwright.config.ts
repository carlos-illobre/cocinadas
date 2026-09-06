import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra el sitio compilado, no contra `vite dev`.
 *
 * Es a propósito: lo que se publica es el resultado de `pnpm build`, con las rutas
 * relativas de `base: './'` y el catálogo ya escrito en `public/api/`. Levantar el
 * servidor de desarrollo probaría otra cosa.
 *
 * Un solo navegador y un solo tamaño: la app es solo para celular (CLAUDE.md), así que
 * probar en un escritorio de 1280 px sería probar una pantalla que nadie usa.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    // La traza del primer reintento es lo que se mira cuando algo falla solo en el CI.
    trace: 'on-first-retry',
  },
  projects: [{ name: 'celular', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
