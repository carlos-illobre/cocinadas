# Seguridad

Qué puede salir mal, qué lo mitiga y qué queda abierto. Lo que queda abierto se dice con
todas las letras: una lista de mitigaciones sin huecos es propaganda.

**La superficie es chica a propósito** (ADR-015): lo único que corre en el servidor es un
Caddy sirviendo archivos. No hay base de datos con credenciales, ni broker, ni proceso que
interprete el cuerpo de una petición. La contracara es que las cocinadas viven sin cifrar
en el `localStorage` de cada teléfono: quien tenga el teléfono desbloqueado las ve.

## Amenazas y mitigaciones

| Amenaza | Qué la mitiga | Estado |
|---|---|---|
| Secretos en el repositorio | `.env` y `deployment/*/.env` en el `.gitignore`; `.env.example` y `.env.oracle` solo con marcadores. `tests/integration/paridad-env.sh` no lee valores, solo nombres. | Mitigado. Falta un hook o un escaneo en el CI que rechace un commit con un secreto pegado en otro archivo. |
| El contenedor arranca «abierto» porque falta una variable | Sin valores por omisión: todo es `${VAR:?}` en el compose, y una variable ausente corta el arranque. | Mitigado. |
| Sesiones falsificadas | — | **No aplica hoy**: no hay sesiones ni cuentas. Vuelve a aplicar el día que el historial salga del celular (ADR-015, «el camino de vuelta»). |
| Servicios internos alcanzables desde internet | No hay servicios internos: un solo contenedor, y lo único que publica es el 80 y el 443. El firewall efectivo es la Security List de la VCN, no `ufw` (los puertos publicados por Docker no pasan por `INPUT`). | Mitigado; depende de que la Security List abra solo 80 y 443. `preflight.sh` lo recuerda. |
| Tráfico en claro | Caddy con Let's Encrypt en producción (ADR-009). HTTP/2 y HTTP/3. | Mitigado en producción. En desarrollo es HTTP a propósito (`SITE_ADDRESS=http://localhost`). |
| Contenedores corriendo como root | La imagen propia corre con el usuario `app` (uid 10001), con `cap_drop: ALL` salvo `NET_BIND_SERVICE`, `no-new-privileges` y el sistema de archivos de solo lectura. | Mitigado. |
| Un contenedor se come toda la memoria de la VM | `mem_limit` y `cpus` desde el `.env`; `preflight.sh` compara el techo con la memoria disponible. | Mitigado. |
| Entrada maliciosa por la API | No hay API: el servidor solo devuelve archivos, no interpreta cuerpos ni parámetros. | **No aplica hoy**. El día que haya un endpoint que escriba, vuelve a hacer falta validación de esquemas y límite de peticiones. |
| Inyección SQL | No hay base de datos. | **No aplica hoy**. |
| XSS con contenido del catálogo | El catálogo lo escribimos nosotros y se genera en el build; React escapa el texto y no se usa `dangerouslySetInnerHTML`. La CSP no permite scripts inline. | Mitigado. |
| Dependencias con vulnerabilidades | Lockfiles fijados; `pnpm audit` no está en el CI. | **Abierto**: agregar `pnpm audit --prod` al pipeline, o Dependabot. |
| Cadena de suministro de imágenes | Imágenes base oficiales (`node:22-alpine` para compilar, `caddy:2-alpine` para servir) por etiqueta, no por digest. | **Abierto**: fijar por digest si se quiere reproducibilidad exacta. |
| Datos personales | No se recoge ninguno: no hay cuentas, no hay servidor que guarde nada, no hay analítica de terceros. | Mitigado por diseño. |
| Pérdida de datos | En el servidor no hay nada que perder: el único volumen guarda certificados, que se reemiten solos. En el teléfono, borrar los datos del sitio borra el historial. | **Abierto del lado del usuario**: sin exportar ni sincronizar, el historial se pierde con el teléfono. Es lo que ADR-015 deja preparado para revertir. |

## Reglas que se sostienen en el código

- Ninguna variable de configuración tiene valor por omisión (ADR-001). La prueba de
  paridad falla si el compose tiene un `${VAR:-x}`.
- Nada sensible fuera del `.env`, ni en comentarios ni en documentación.
- Distinguir «no hay» de «no pude preguntar»: un fallo al leer el catálogo o el
  `localStorage` no se muestra como «no hay recetas» ni como «no cocinaste nunca».

## Qué hacer ante un incidente

No hay secretos de aplicación que rotar: el `.env` de la instancia no tiene ninguno.

1. Revisar `docker compose logs web`: Caddy registra cada petición con su origen. Subir el
   detalle es `LOG_LEVEL=DEBUG` en el `.env` y recrear el contenedor.
2. Si hay que volver a una versión anterior del código: `deploy.py <sha>`.
3. Si el certificado quedó comprometido: borrar el volumen `cocinadas_caddy-datos` y
   recrear el contenedor; Caddy vuelve a pedirlo a Let's Encrypt.
