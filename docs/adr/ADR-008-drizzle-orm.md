# ADR-008: Drizzle como capa de acceso a PostgreSQL

**Estado:** Superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)
**Fecha:** 2026-09-05

---

## Contexto

`usuarios` y `cocinadas` acceden a PostgreSQL (ADR-005) desde TypeScript. Hace falta
tipado de las consultas, migraciones versionadas y que la consulta de progreso (funciones
de ventana, agregaciones) se pueda escribir sin pelear con la herramienta. El usuario
eligió Drizzle entre las tres opciones planteadas (SQL directo con `node-postgres` era la
recomendada).

Medido en este esqueleto (`du -sh` en `node_modules/.pnpm`):

| Paquete | Tamaño |
|---|---|
| `drizzle-orm@0.44` | 16 MB |
| `pg@8.23` | 149 KB |
| `fastify@5.12` | 3,7 MB |

## Opciones consideradas

### 1. SQL directo con `node-postgres` y migraciones `.sql` numeradas

Sin capa intermedia: lo que se lee es lo que corre; la consulta de progreso es SQL puro.
Era la recomendación. El usuario la descartó a favor del tipado inferido del esquema:
con SQL a mano, los tipos de cada fila se declaran aparte y se desfasan.

### 2. Prisma

Cliente generado, consola, migraciones. Parecía la opción cómoda. No lo es para este
despliegue: usa un motor de consultas propio (binario nativo por plataforma) que engorda
la imagen y complica el build multi-arquitectura (ADR-011), y su lenguaje de consultas
abstrae el SQL justo donde acá hace falta escribirlo (funciones de ventana). No se midió
acá; según su documentación, el motor agrega decenas de MB por plataforma.

### 3. Drizzle ORM

Esquema en TypeScript con tipos inferidos, `drizzle-kit` para generar migraciones SQL a
partir del esquema, y `sql\`...\`` para escribir SQL literal tipado cuando el query
builder no alcanza. Sin motor nativo: 16 MB de JavaScript sobre `pg`.

## Decisión

Drizzle ORM sobre `node-postgres` (`pg`), con `drizzle-kit` para generar las migraciones
SQL en `microservices/<servicio>/drizzle/` y aplicarlas al arrancar el servicio
(`migrate()` de Drizzle). Cada servicio tiene su esquema de PostgreSQL y su carpeta de
migraciones; nunca comparten tablas (ADR-005).

Las consultas de agregación (el progreso) se escriben con `sql\`...\`` de Drizzle, no con
el query builder, para que el SQL sea legible tal cual.

El adaptador (`src/infra/db.ts`) queda fuera de la cobertura: solo crea el pool y el
cliente. Las consultas de dominio se prueban contra un PostgreSQL real en integración.

## Consecuencias

### Positivas

- Tipos de fila inferidos del esquema; un cambio de columna se ve en compilación.
- Migraciones generadas y versionadas; se aplican solas al arrancar.
- Sin binarios nativos: la misma imagen para amd64 y arm64 sin sorpresas.

### Negativas

- Una herramienta más que aprender (query builder, `drizzle-kit`), y sus cambios de
  versión antes de 1.0 pueden traer rupturas.
- 16 MB en cada imagen de servicio con base.
- Aplicar migraciones al arrancar significa que dos réplicas del mismo servicio
  arrancando a la vez compiten; hoy hay una sola réplica (VM única).

### Lo que no cambia

La base es PostgreSQL y el SQL sigue siendo SQL; Drizzle no lo esconde.

## Cuándo revisar esta decisión

- Si Drizzle cambia su API de forma incompatible y migrar cuesta más que volver a SQL
  directo.
- Si aparece más de una réplica por servicio: las migraciones pasan a un paso previo al
  arranque.

## Referencias

- [ADR-005](ADR-005-postgresql-para-usuarios-y-cocinadas.md), [ADR-011](ADR-011-despliegue-en-vm-oracle-con-imagenes-por-sha.md).

---

## Enmienda (2026-09-06): superado por [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)

Sin base de datos no hay capa de acceso a la base. Drizzle se fue sin haber definido una
sola tabla.
