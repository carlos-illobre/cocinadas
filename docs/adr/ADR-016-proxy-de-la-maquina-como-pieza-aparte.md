# ADR-016: El reverse proxy es una pieza de la máquina, no de la aplicación

**Estado:** Superado por [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)
**Fecha:** 2026-09-06

---

## Contexto

En la VM de Oracle no corre solo Cocinadas: ya está `citypass-event-gateway`, y Carlos
piensa instalar más aplicaciones ahí. El plan gratuito da una sola máquina, así que van
todas juntas.

**El 80 y el 443 son de una sola aplicación.** El navegador no elige puerto: quien los ata
es quien recibe todo el tráfico, y tiene que saber repartirlo por dominio. Hasta acá,
Cocinadas los ataba con su propio Caddy (ADR-009), y Citypass los ata con su nginx, con
los puertos escritos literales en su compose.

Eso deja tres formas de acomodarlos, y las dos primeras tienen el mismo defecto:

- Si los ata **Citypass**, Cocinadas queda colgado de él: desinstalar Citypass tira abajo
  Cocinadas. Carlos lo señaló explícitamente, y es lo que descartó esta opción.
- Si los ata **Cocinadas**, el problema se invierte pero no desaparece: el repositorio de
  una app de recetas termina siendo el dueño de la configuración de todas las demás, y
  agregar la tercera aplicación de la máquina obliga a commitear acá.
- Si los ata **una pieza que no es de nadie**, cada aplicación es un inquilino y ninguna
  depende de otra.

## Opciones consideradas

### 1. Que el 80 y el 443 los ate una de las aplicaciones

Lo de arriba. Se descarta: con dos aplicaciones ya obliga a elegir cuál puede
desinstalarse sin romper a la otra, y con tres deja de tener respuesta.

### 2. Traefik, con las aplicaciones registrándose solas por labels

Es lo que se usa cuando querés que agregar una aplicación no toque ninguna configuración
central: Traefik lee los labels de cada contenedor y arma las rutas. Genuinamente más
escalable.

Se descarta por dos razones. La primera es que necesita **el socket de Docker montado
dentro del proxy**, que es el contenedor expuesto a internet: quien lo comprometa tiene
control del demonio de Docker, o sea root de la máquina. La segunda es que necesita una
red Docker compartida entre proyectos, y eso choca con lo de abajo.

Se revisa si alguna vez hay tantas aplicaciones como para que editar un archivo por cada
una moleste. Con cinco no molesta.

### 3. Caddy aparte, con las aplicaciones en una red Docker compartida

La forma habitual: `docker network create web`, el proxy y cada aplicación se conectan, y
**ninguna publica puertos en el host**. Más limpio en superficie expuesta.

Parecía la buena y no lo es acá: `external: true` no sale del `.env`, así que obliga a
crear la red a mano antes de cualquier `docker compose up`, también en la máquina de
desarrollo. Rompe el «clonar y levantar» y agrega un paso previo que no está en el `.env`,
en contra de ADR-001. Se revisa si alguna vez importa no tener nada atado al host.

### 4. Caddy aparte, con las aplicaciones publicando un puerto alto

Es la opción elegida.

## Decisión

El reverse proxy pasa a `infrastructure/proxy/`, que es la carpeta de **los contenedores
que no son la aplicación**: los que sirven para levantarla y que en producción pueden o no
estar reemplazados por un servicio de la nube.

- **Es optativo.** Vive en el único `docker-compose.yml` (ADR-001) bajo el perfil `proxy`,
  y se prende con `COMPOSE_PROFILES=proxy` en el `.env`. Donde el TLS lo termine otra cosa
  —un balanceador de la nube, o el proxy de otra aplicación que ya tenga el 80— se deja
  vacío y esta pieza no existe.
- **La aplicación es un inquilino.** Su Caddyfile pasa a `:80` a secas: contesta a
  cualquier `Host`, no termina TLS y no sabe por qué dominio la llamaron. Quién es el dueño
  de cada dominio ya lo decidió el proxy. Publica `APP_ADDR:PUERTO_APP` para que se le
  pueda pegar directo en desarrollo y para que siga sirviendo con el proxy apagado.
- **Lo de la aplicación se queda en la aplicación.** Las cabeceras de seguridad, la
  política de contenido, el ruteo de la SPA y el caché siguen en la imagen de Cocinadas,
  que es donde se despliegan junto con el código que los necesita. Al proxy solo se le va
  lo que es de la máquina: el TLS y el reparto por dominio.
- **Las demás aplicaciones traen su propio bloque.** El Caddyfile del proxy termina con
  `import /etc/caddy/vecinos/*.caddy`, y cada aplicación de la máquina deja ahí su archivo
  al desplegarse. Este repositorio no guarda la configuración de nadie más, y desinstalar
  una aplicación es borrar un archivo. Con el glob vacío la configuración sigue siendo
  válida, comprobado con `caddy validate`.
- Los vecinos se alcanzan por `host.docker.internal:<puerto>` (el compose le da ese nombre
  al proxy con `extra_hosts: host-gateway`), porque adentro del contenedor `127.0.0.1` es
  el propio contenedor y no la VM. Cocinadas no lo necesita: comparte el compose con el
  proxy y se resuelve por nombre de servicio.

Enmienda a [ADR-009](ADR-009-caddy-reverse-proxy-y-tls.md), que ponía a Caddy y el TLS
como parte de la aplicación, y a [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md)
en la parte del despliegue.

## Consecuencias

### Positivas

- **Ninguna aplicación depende de otra.** Desinstalar Citypass, o Cocinadas, no toca a las
  demás: solo se borra su archivo de vecino.
- Agregar una aplicación a la máquina es un bloque de tres líneas, sin tocar el código ni
  la configuración de las que ya están.
- **Cocinadas se queda sin volúmenes.** Los dos que tenía (`caddy-datos`, `caddy-config`)
  guardaban certificados y pasan al proxy. Con el proxy apagado, el proyecto no usa
  ninguno.
- Un solo lugar pide certificados en toda la máquina. El `certbot` de Citypass se puede
  apagar entero.
- La aplicación deja de necesitar el dominio: la misma imagen sirve igual en `localhost`,
  detrás del proxy propio o detrás del de otra aplicación.

### Negativas

- **Hay una pieza más que operar**, aunque sea chica y de imagen oficial sin construir.
- El puerto de la aplicación queda publicado en `0.0.0.0`. Lo que la mantiene fuera de
  internet es la Security List de la VCN, donde ese puerto no se abre — y los puertos que
  publica Docker no pasan por la cadena `INPUT` de iptables, así que `ufw` **no** los
  protege. Es la misma frontera en la que el proyecto ya se apoyaba, pero ahora hay algo
  más detrás de ella.
- Si el proxy se cae, se caen todas las aplicaciones de la máquina a la vez.
- Queda un archivo de configuración (`infrastructure/proxy/Caddyfile`) que se copia a la
  VM en el despliegue en vez de viajar en una imagen, que es lo que ADR-015 había logrado
  para la aplicación. Es el precio de usar la imagen oficial de Caddy sin construir nada.

### Lo que no cambia

Sigue habiendo un solo `docker-compose.yml` y el `.env` sigue siendo lo único que cambia
entre ambientes (ADR-001), ahora también para decidir si el proxy existe. La aplicación
sigue siendo un contenedor sin estado que sirve archivos (ADR-015), y el catálogo sigue
viajando dentro de su imagen (ADR-006).

## La trampa que esto trae

`docker compose up -d --remove-orphans` **no baja** un servicio que se apagó por perfil:
`--remove-orphans` borra contenedores de servicios que ya no están en el compose, y un
servicio apagado por perfil sigue estando. O sea que sacar `proxy` de `COMPOSE_PROFILES`
no lo baja solo, y el proxy viejo se queda con el 80 y el 443 justo cuando se los querías
dar a otra aplicación.

Por eso `deploy.py` compara `docker compose config --services` (que respeta los perfiles y
dice qué debería correr) contra `docker compose ps --services` (que dice qué corre) y baja
la diferencia con `docker compose rm -sf`. A mano es lo mismo.

## Cuándo revisar esta decisión

- Si las aplicaciones de la máquina llegan a ser tantas que mantener un bloque por cada una
  moleste: ahí Traefik empieza a pagar el socket de Docker.
- Si aparece un requisito de no tener ningún puerto atado al host: se pasa a la red Docker
  compartida y cambia solo el `reverse_proxy` del Caddyfile del proxy.
- Si Cocinadas vuelve a ser la única aplicación de su máquina: se puede volver a meter el
  TLS en la aplicación, pero no hay motivo — dejar el proxy prendido no cuesta casi nada.

## Referencias

- [ADR-001](ADR-001-compose-unico-y-env-como-fuente-de-verdad.md),
  [ADR-009](ADR-009-caddy-reverse-proxy-y-tls.md),
  [ADR-015](ADR-015-de-cuatro-servicios-a-una-spa-estatica.md).
- «Convivir con otra aplicación en la misma VM» en [DEPLOYMENT.md](../DEPLOYMENT.md).

---

## Enmienda (2026-09-06): superado por [ADR-017](ADR-017-sitio-estatico-en-github-pages.md)

Sin servidor propio no hay 80 ni 443 que repartir: Pages termina el TLS y sirve el sitio.
El razonamiento de fondo —que el reverse proxy es una pieza de la máquina y no de la
aplicación— sigue siendo correcto, y es el que hay que releer el día que vuelvan a convivir
varias aplicaciones en un servidor.
