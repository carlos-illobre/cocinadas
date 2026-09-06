import { readFileSync } from 'node:fs';
import { crearApp } from './app.js';
import { leerConfig } from './config.js';
import { conectarBase } from './infra/db.js';
import { conectarNats } from './infra/nats.js';

/**
 * Raíz de composición. Excluida de la cobertura (docs/TESTING.md): solo lee la
 * configuración, arma las piezas y llama a `listen`. No hay decisiones acá.
 */
const NOMBRE = 'cocinadas';
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

const config = leerConfig(process.env);
const base = conectarBase(config.databaseUrl);
await base.verificar();
const nats = await conectarNats(config.natsUrl, NOMBRE);
const app = await crearApp({ nombre: NOMBRE, version, logLevel: config.logLevel, limitePorMinuto: config.limitePorMinuto });

app.addHook('onClose', async () => {
  await nats.drain();
  await base.cerrar();
});

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(senal, () => {
    void app.close().then(() => process.exit(0));
  });
}

await app.listen({ host: '0.0.0.0', port: config.puerto });
