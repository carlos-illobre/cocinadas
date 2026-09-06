# Registros de decisiones de arquitectura

**Si hubo una alternativa razonable, hay un ADR.** El número se reserva al empezar a
escribirlo, no al mergear; este índice dice qué números están tomados. Un ADR viejo nunca
se reescribe: si una decisión posterior lo modifica, se le agrega una enmienda al final
que apunta al nuevo.

Formato: `ADR-NNN-titulo-en-kebab-case.md`, con contexto, opciones consideradas (incluida
la que parecía buena y no lo era), decisión, consecuencias positivas, negativas y lo que
no cambia, cuándo revisarla y referencias.

| N.º | Título | Estado | Fecha |
|---|---|---|---|
| [001](ADR-001-compose-unico-y-env-como-fuente-de-verdad.md) | Un solo `docker-compose.yml` y el `.env` como fuente de la verdad | Aceptado | 2026-09-05 |
| [002](ADR-002-tres-microservicios.md) | Tres microservicios: catalogo, usuarios, cocinadas | Superado por 015 | 2026-09-05 |
| [003](ADR-003-eventos-con-nats-jetstream.md) | Eventos entre servicios con NATS JetStream | Superado por 015 | 2026-09-05 |
| [004](ADR-004-mensajes-json-con-esquema-versionado.md) | Mensajes JSON con esquema versionado en el repositorio | Superado por 015 | 2026-09-05 |
| [005](ADR-005-postgresql-para-usuarios-y-cocinadas.md) | PostgreSQL para usuarios y cocinadas | Superado por 015 | 2026-09-05 |
| [006](ADR-006-catalogo-desde-el-repositorio-en-la-imagen.md) | El catálogo se lee de los JSON del repositorio y viaja dentro de la imagen | Enmendado por 015 | 2026-09-05 |
| [007](ADR-007-fastify.md) | Fastify como framework HTTP de los servicios | Superado por 015 | 2026-09-05 |
| [008](ADR-008-drizzle-orm.md) | Drizzle como capa de acceso a PostgreSQL | Superado por 015 | 2026-09-05 |
| [009](ADR-009-caddy-reverse-proxy-y-tls.md) | Caddy como reverse proxy con TLS automático | Enmendado por 015 y 016 | 2026-09-05 |
| [010](ADR-010-pnpm-vitest-y-stryker.md) | pnpm, Vitest y Stryker | Aceptado | 2026-09-05 |
| [011](ADR-011-despliegue-en-vm-oracle-con-imagenes-por-sha.md) | Despliegue en una VM de Oracle Cloud con imágenes multi-arquitectura por SHA | Enmendado por 015 | 2026-09-05 |
| [012](ADR-012-autorizacion-con-jwt.md) | Autorización con JWT emitido por usuarios y verificado localmente | Superado por 015 | 2026-09-05 |
| [013](ADR-013-frontend-spa-react-vite.md) | El frontend como SPA React + Vite en su propia imagen | Enmendado por 015 | 2026-09-05 |
| [014](ADR-014-endurecimiento-antes-de-publicar.md) | Endurecimiento antes de publicar a internet | Enmendado por 015 | 2026-09-06 |
| [015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md) | De cuatro servicios a una sola SPA estática | Enmendado por 016 | 2026-09-06 |
| [016](ADR-016-proxy-de-la-maquina-como-pieza-aparte.md) | El reverse proxy es una pieza de la máquina, no de la aplicación | Aceptado | 2026-09-06 |
