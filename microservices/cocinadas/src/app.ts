import Fastify, { type FastifyInstance } from 'fastify';

export interface OpcionesApp {
  readonly nombre: string;
  readonly version: string;
  readonly logLevel: string;
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
  }));

  return app;
}
