import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Recuperacion } from './componentes/Recuperacion';

/**
 * Raíz de composición. Excluida de la cobertura (docs/TESTING.md): monta la aplicación
 * en el DOM y nada más.
 */
const raiz = document.getElementById('raiz');
if (raiz === null) {
  throw new Error('falta el elemento #raiz en index.html');
}

createRoot(raiz).render(
  <StrictMode>
    <Recuperacion>
      <App />
    </Recuperacion>
  </StrictMode>,
);
