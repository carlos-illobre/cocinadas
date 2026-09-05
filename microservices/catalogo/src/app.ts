import Fastify, { type FastifyInstance } from 'fastify';
import type { Catalogo, Inventario } from './catalogo.js';
import { registrarRutas } from './rutas.js';

export interface OpcionesApp {
  readonly nombre: string;
  readonly version: string;
  readonly logLevel: string;
  /** Se inyecta para que la app no toque el disco: la prueba pasa una función fija. */
  readonly inventariar: () => Inventario;
  /** El catálogo ya cargado en memoria; la prueba pasa uno falso. */
  readonly catalogo: Catalogo;
}

/**
 * Arma la aplicación sin escucharla. `server.ts` es el único que llama a `listen`; acá
 * termina lo que se puede probar con `inject` sin abrir un puerto.
 */
export function crearApp(opciones: OpcionesApp): FastifyInstance {
  const app = Fastify({ logger: { level: opciones.logLevel } });

  app.get('/health', async () => ({
    estado: 'ok',
    servicio: opciones.nombre,
    version: opciones.version,
    catalogo: opciones.inventariar(),
  }));

  registrarRutas(app, opciones.catalogo);

  return app;
}
