import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';

export interface OpcionesApp {
  readonly nombre: string;
  readonly version: string;
  readonly logLevel: string;
  /** Peticiones por minuto y por IP; pasado eso, 429. */
  readonly limitePorMinuto: number;
}

/**
 * Arma la aplicación sin escucharla. `server.ts` es el único que llama a `listen`; acá
 * termina lo que se puede probar con `inject` sin abrir un puerto.
 */
export async function crearApp(opciones: OpcionesApp): Promise<FastifyInstance> {
  // `trustProxy` hace que la IP del cliente sea la que el reverse proxy puso en
  // X-Forwarded-For, y no la del proxy: sin esto el límite de abajo contaría todas las
  // peticiones juntas y el primero que se pasara dejaría a todos afuera. Solo se confía
  // en esa cabecera cuando la conexión viene de una dirección privada, que es la red del
  // compose; el servicio no se publica fuera de la máquina, así que nadie más puede
  // inventársela.
  // El tipo explícito evita que TypeScript elija la sobrecarga de HTTP/2 al ver `trustProxy`.
  const opcionesServidor: FastifyServerOptions = { logger: { level: opciones.logLevel }, trustProxy: ['loopback', 'linklocal', 'uniquelocal'] };
  const app = Fastify(opcionesServidor);

  // Límite por IP: sin esto, un bucle desde una sola máquina satura la VM. El contador
  // vive en memoria del proceso, que alcanza porque hay una sola instancia de cada
  // servicio; con varias habría que moverlo a un almacén compartido.
  // Con `await`: el plugin agrega su hook al cargarse, y una ruta declarada antes de que
  // eso pase no lo tendría. Por eso `crearApp` es asíncrona.
  await app.register(rateLimit, {
    max: opciones.limitePorMinuto,
    timeWindow: '1 minute',
    // El healthcheck del contenedor pega cada 15 s desde adentro y no tiene que gastar
    // cupo ni quedar afuera si alguien satura desde la red.
    allowList: ['127.0.0.1', '::1'],
  });

  app.get('/health', async () => ({
    estado: 'ok',
    servicio: opciones.nombre,
    version: opciones.version,
  }));

  return app;
}
