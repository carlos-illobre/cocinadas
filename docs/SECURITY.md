# Seguridad

Qué puede salir mal, qué lo mitiga en este esqueleto, y qué queda abierto. Lo que queda
abierto se dice con todas las letras: una lista de mitigaciones sin huecos es propaganda.

## Amenazas y mitigaciones

| Amenaza | Qué la mitiga | Estado |
|---|---|---|
| Secretos en el repositorio | `.env` y `deployment/*/.env` en el `.gitignore`; `.env.example` y `.env.oracle` solo con marcadores. `tests/integration/paridad-env.sh` no lee valores, solo nombres. | Mitigado. Falta un hook o un escaneo en el CI que rechace un commit con un secreto pegado en otro archivo. |
| Un servicio arranca «abierto» porque falta una variable de seguridad | Sin valores por omisión: `${JWT_SECRET:?}` en el compose y `obligatoria()` en `config.ts`. `config.ts` de usuarios y cocinadas rechaza un `JWT_SECRET` de menos de 32 caracteres. | Mitigado. |
| Sesiones falsificadas | JWT HS256 firmado con `JWT_SECRET`, verificado localmente por cada servicio (ADR-012). Vida corta. | Diseñado; la emisión y la verificación se implementan con `usuarios` y `cocinadas`. |
| Token robado | Vida corta del JWT; sin lista de revocación. | **Abierto**: un token vale hasta que expira. Revisar si aparece la baja de usuario. |
| Servicios internos alcanzables desde internet | Solo el proxy publica en la interfaz pública; los servicios se publican en `PUBLISH_ADDR=127.0.0.1` en producción. El firewall efectivo es la Security List de la VCN, no `ufw` (los puertos publicados por Docker no pasan por `INPUT`). | Mitigado por configuración; depende de que la Security List abra solo 80 y 443. `preflight.sh` lo recuerda. |
| Tráfico en claro | Caddy con Let's Encrypt en producción (ADR-009). HTTP/2 y HTTP/3. | Mitigado en producción. En desarrollo es HTTP a propósito (`SITE_ADDRESS=http://localhost`). |
| Contenedores corriendo como root | Todas las imágenes propias corren con el usuario `app` (uid 10001). PostgreSQL y NATS usan los usuarios de sus imágenes oficiales. | Mitigado para las imágenes propias. |
| Un contenedor se come toda la memoria de la VM | `mem_limit` por contenedor desde el `.env`; `preflight.sh` compara la suma con la memoria disponible. | Mitigado. Sin límite de CPU. |
| Entrada maliciosa por la API | Validación de esquemas JSON de Fastify en cada ruta (ADR-007); los eventos también se validan (ADR-004). | Diseñado; no hay rutas de dominio todavía. |
| Inyección SQL | Drizzle parametriza; el SQL literal con `sql\`...\`` también. Nunca concatenar. | Diseñado. |
| Fuerza bruta contra el inicio de sesión | — | **Abierto**: sin rate limit. Agregar `@fastify/rate-limit` en `usuarios` cuando exista el endpoint. |
| Dependencias con vulnerabilidades | Lockfiles fijados; `pnpm audit` no está en el CI. | **Abierto**: agregar `pnpm audit --prod` al pipeline, o Dependabot. |
| Cadena de suministro de imágenes | Imágenes base oficiales (`node:22-alpine`, `caddy:2-alpine`, `postgres:17-alpine`, `nats:2-alpine`) por etiqueta, no por digest. | **Abierto**: fijar por digest si se quiere reproducibilidad exacta. |
| Datos personales | Solo lo mínimo para la sesión y las cocinadas. Sin analítica de terceros. | Sin política de retención ni de borrado todavía. |
| Pérdida de datos | Volúmenes con nombre; `docs/DEPLOYMENT.md` dice qué se pierde con cada uno y cómo respaldarlo. | **Abierto**: el respaldo es manual. |

## Reglas que se sostienen en el código

- Ninguna variable de configuración tiene valor por omisión (ADR-001). La prueba de
  paridad falla si el compose tiene un `${VAR:-x}`.
- Nada sensible fuera del `.env`, ni en comentarios ni en documentación.
- Cada servicio verifica la autorización por sí mismo (ADR-012); no se confía en
  cabeceras que ponga el proxy.
- Distinguir «no hay» de «no pude preguntar»: cuando un servicio consulte a otro, un
  fallo de la consulta no se lee como «lista vacía».

## Qué hacer ante un incidente

1. Rotar `JWT_SECRET` en el `.env` de la instancia y `docker compose up -d usuarios
   cocinadas`: invalida todas las sesiones.
2. Rotar `POSTGRES_PASSWORD`: cambiarla en PostgreSQL (`ALTER USER`) y en el `.env`, y
   recrear los servicios con base.
3. Revisar `docker compose logs` del proxy: Caddy registra cada petición con origen.
4. Si hay que volver a una versión anterior del código: `deploy.py <sha>`.
