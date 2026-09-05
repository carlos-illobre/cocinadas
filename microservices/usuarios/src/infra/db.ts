import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';

/**
 * Adaptador a PostgreSQL con Drizzle (ADR-005, ADR-008). Excluido de la cobertura
 * (docs/TESTING.md): configura el cliente real y no tiene ninguna decisión propia.
 *
 * `verificar` hace una consulta trivial al arrancar para que una DATABASE_URL mal
 * configurada corte el arranque (invariante 3) en vez de fallar en la primera petición.
 */
export interface Base {
  readonly db: NodePgDatabase;
  readonly verificar: () => Promise<void>;
  readonly cerrar: () => Promise<void>;
}

export function conectarBase(databaseUrl: string): Base {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  return {
    db,
    verificar: async () => {
      await db.execute(sql`select 1`);
    },
    cerrar: () => pool.end(),
  };
}
