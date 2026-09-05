import { connect, type NatsConnection } from 'nats';

/**
 * Adaptador al broker. Excluido de la cobertura (docs/TESTING.md): configura el cliente
 * real y no tiene ninguna decisión propia. Si alguna vez aparece un `if` acá, se extrae a
 * un módulo medible.
 *
 * Se conecta al arrancar aunque el servicio todavía no publique nada: así un NATS_URL
 * mal configurado corta el arranque (invariante 3) en vez de fallar en la primera
 * publicación, meses después.
 */
export async function conectarNats(url: string, nombre: string): Promise<NatsConnection> {
  return connect({ servers: url, name: nombre, maxReconnectAttempts: -1 });
}
