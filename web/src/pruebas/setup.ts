import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom no implementa `scrollTo` y lo dice por consola en cada montaje de una pantalla:
// la app lo llama al cambiar de pantalla o de fase. Un doble mudo; las pruebas que
// necesitan comprobar la llamada lo espían igual.
window.scrollTo = vi.fn();
