# ADR-014 · Endurecimiento antes de publicar a internet

- **Estado**: Aceptado
- **Fecha**: 2026-09-06

## Contexto

La aplicación queda expuesta en una VM de Oracle con IP pública. Hoy no hay cuentas ni
datos de usuario en el servidor —las cocinadas viven en el teléfono— así que el riesgo no
es que roben información: es que la tiren abajo. Una VM chica se cae por tres motivos
mucho antes que por un ataque elaborado: el disco lleno de logs, un servicio que se come
la CPU, y una avalancha de peticiones.

Además, cuando existan `usuarios` y `cocinadas` de verdad va a haber datos que proteger, y
las defensas que hay que tener puestas antes son las mismas.

## Decisión

Siete medidas, todas en configuración y ninguna en la lógica de la aplicación:

1. **Los logs tienen techo.** `json-file` sin límite guarda todo para siempre; el techo por
   contenedor es `LOG_MAX_SIZE × LOG_MAX_FILES`, hoy 1 MB.
2. **Techo de CPU por contenedor** (`cpus`), además del de memoria que ya estaba. Es un
   techo, no una reserva: la suma puede pasar los núcleos.
3. **Límite de peticiones por IP** en los tres servicios, con `@fastify/rate-limit`. El
   contador vive en memoria del proceso, que alcanza con una sola instancia de cada uno.
   Para que cuente por cliente y no por el proxy, Fastify confía en `X-Forwarded-For`
   solo cuando la conexión viene de una dirección privada.
4. **Cabeceras de seguridad** en el reverse proxy: HSTS, `nosniff`, política de referente,
   permisos de dispositivos y una política de contenido que solo deja cargar lo propio y
   las tipografías de Google.
5. **Contenedores endurecidos**: sin privilegios nuevos, sin capacidades (salvo la de
   atarse a puertos bajos, que Caddy necesita) y con el sistema de archivos de solo
   lectura donde el servicio no escribe. PostgreSQL queda sin `cap_drop` porque su
   arranque cambia dueño y permisos del directorio de datos.
6. **La API de administración de Caddy, apagada.** Permitía reconfigurar el proxy entero
   por HTTP desde la red del compose. El healthcheck usa un sitio interno propio.
7. **Avisos y respaldo**: Dependabot para dependencias, imágenes base y acciones; Trivy en
   el CI buscando CVEs y secretos, informando sin reprobar; y `respaldo.sh`, que vuelca la
   base y copia los certificados, guarda una semana y se pone en el cron de la VM.

## Consecuencias

- El límite de peticiones es por proceso: si algún día hay más de una instancia de un
  servicio, el contador tiene que mudarse a un almacén compartido.
- `crearApp` pasó a ser asíncrona: el plugin del límite agrega su hook al cargarse, y una
  ruta declarada antes de que eso pase no lo tendría.
- La política de contenido lleva `unsafe-inline` en los estilos por los `style` que React
  pone en las barras y el gantt. Sacarlo pide mover esos estilos a clases.
- Lo que sigue sin cubrir es todo lo que llega con las cuentas: hash de contraseñas,
  límite de intentos de login, vida corta del token y verificación de que el dueño del
  recurso es el del token. Se resuelve al escribir esos endpoints, no antes.

---

## Enmienda (2026-09-06): [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)

La superficie que había que endurecer se redujo sola: no hay base con credenciales, ni
broker, ni proceso que interprete el cuerpo de una petición. Queda un file server con las
mismas cabeceras de seguridad, el mismo `cap_drop: ALL` y el mismo `read_only`. El límite
de peticiones por IP se fue con Fastify; el día que haya un endpoint que escriba, vuelve a
hacer falta.

---

## Enmienda (2026-09-06): [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

La mayor parte de este ADR era sobre contenedores: usuario sin privilegios, `cap_drop`,
sistema de archivos de solo lectura, techos de memoria. Nada de eso aplica sin Docker. Lo
que queda vigente es lo del navegador —CSP, no confiar en entrada ajena— y ahí hay una
regresión honesta: la CSP se perdió con el Caddyfile y hay que rehacerla con `<meta>`.
