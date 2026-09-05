import { readFileSync } from 'node:fs';
import { crearApp } from './app.js';
import { cargarCatalogo, inventariar } from './catalogo.js';
import { leerConfig } from './config.js';
import { conectarNats } from './infra/nats.js';

/**
 * Raíz de composición. Excluida de la cobertura (docs/TESTING.md): solo lee la
 * configuración, arma las piezas y llama a `listen`. No hay decisiones acá.
 */
const NOMBRE = 'catalogo';
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

const config = leerConfig(process.env);
const nats = await conectarNats(config.natsUrl, NOMBRE);
const catalogo = cargarCatalogo(config.directorioDatos, (mensaje) => console.warn(mensaje));
const app = crearApp({
  nombre: NOMBRE,
  version,
  logLevel: config.logLevel,
  inventariar: () => inventariar(config.directorioDatos),
  catalogo,
});

app.addHook('onClose', async () => {
  await nats.drain();
});

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(senal, () => {
    void app.close().then(() => process.exit(0));
  });
}

await app.listen({ host: '0.0.0.0', port: config.puerto });
